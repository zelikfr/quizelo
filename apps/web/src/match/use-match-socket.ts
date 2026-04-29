"use client";

import { ServerMessage, type ClientMessage } from "@quizelo/protocol";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  initialMatchState,
  matchReducer,
  type MatchClientState,
} from "./match-state";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000";

export type ConnectionStatus = "connecting" | "open" | "closed" | "error";

export interface UseMatchSocketResult {
  state: MatchClientState;
  connection: ConnectionStatus;
  sendAnswer: (questionIndex: number, choiceId: string) => void;
  sendPass: (questionIndex: number) => void;
  leave: () => void;
}

export function useMatchSocket(matchId: string): UseMatchSocketResult {
  const [state, dispatch] = useReducer(matchReducer, initialMatchState);
  const [connection, setConnection] = useState<ConnectionStatus>("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  /** Once true, all incoming messages are silently dropped and we won't reconnect. */
  const frozenRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    /** The socket this effect "owns". Late callbacks check identity to ignore stale events. */
    let activeWs: WebSocket | null = null;
    let pingTimer: ReturnType<typeof setInterval> | null = null;
    let backoff = 800;

    const send = (msg: ClientMessage) => {
      if (activeWs?.readyState === WebSocket.OPEN) {
        activeWs.send(JSON.stringify(msg));
      }
    };

    const connect = () => {
      if (cancelled) return;
      setConnection("connecting");

      const ws = new WebSocket(`${WS_URL}/ws/match/${matchId}`);
      activeWs = ws;
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled || activeWs !== ws) return;
        backoff = 800;
        setConnection("open");
        send({ type: "ready" });
        pingTimer = setInterval(() => send({ type: "ping" }), 25_000);
      };

      ws.onmessage = (event) => {
        if (cancelled || activeWs !== ws || frozenRef.current) return;
        try {
          const raw = JSON.parse(event.data as string);
          const parsed = ServerMessage.safeParse(raw);
          if (!parsed.success) {
            console.warn("[ws] dropped invalid message", parsed.error);
            return;
          }
          dispatch({ type: "server", msg: parsed.data });
        } catch (err) {
          console.warn("[ws] parse error", err);
        }
      };

      ws.onerror = () => {
        if (cancelled || activeWs !== ws) return;
        setConnection("error");
      };

      ws.onclose = (ev) => {
        const wasActive = activeWs === ws;
        if (wasActive) {
          activeWs = null;
          if (wsRef.current === ws) wsRef.current = null;
        }
        if (pingTimer) clearInterval(pingTimer);
        pingTimer = null;
        if (cancelled || !wasActive || frozenRef.current) return;

        setConnection("closed");

        // Server-side rejections (auth, not-in-match, etc.) — don't retry.
        const fatalCodes = [4001, 4002, 4003, 4004];
        if (fatalCodes.includes(ev.code)) return;

        const delay = Math.min(backoff, 8_000);
        backoff = Math.min(backoff * 2, 8_000);
        setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (pingTimer) clearInterval(pingTimer);
      pingTimer = null;
      if (activeWs) {
        // Detach handlers so a late onclose from a CONNECTING socket
        // doesn't try to reconnect or clobber the next mount's ws ref.
        const ws = activeWs;
        activeWs = null;
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        try {
          ws.close(1000, "unmount");
        } catch {
          /* noop */
        }
        if (wsRef.current === ws) wsRef.current = null;
      }
    };
  }, [matchId]);

  const sendAnswer = useCallback((questionIndex: number, choiceId: string) => {
    dispatch({ type: "_local/answer_pick", questionIndex, choiceId });

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(
      JSON.stringify({
        type: "answer",
        questionIndex,
        choiceId,
        clientTime: Date.now(),
      } satisfies ClientMessage),
    );
  }, []);

  const sendPass = useCallback((questionIndex: number) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(
      JSON.stringify({ type: "pass", questionIndex } satisfies ClientMessage),
    );
  }, []);

  const leave = useCallback(() => {
    // Lock down the hook: ignore everything that may still be in flight,
    // don't retry, don't dispatch.
    frozenRef.current = true;
    const ws = wsRef.current;
    if (ws) {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "leave" } satisfies ClientMessage));
        }
      } catch {
        /* noop */
      }
      try {
        ws.close(1000, "leave");
      } catch {
        /* noop */
      }
      wsRef.current = null;
    }
  }, []);

  return { state, connection, sendAnswer, sendPass, leave };
}
