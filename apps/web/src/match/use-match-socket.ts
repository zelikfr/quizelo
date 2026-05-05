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

/**
 * Server-side reasons a connection was rejected and won't recover by
 * retrying. Clients should bounce the user out of the match page when
 * they see one of these.
 *
 *   `unauthorized`  : code 4001 — no/invalid session. Send to login.
 *   `not_in_match`  : code 4002 — match exists but user isn't on the
 *                     roster (eliminated then redirected back, link
 *                     shared, etc). Send home.
 *   `not_found`     : code 4004 — match isn't in the registry. Either
 *                     it never existed, was abandoned, or was GC'd
 *                     after results. Send home.
 *   `superseded`    : code 4003 — another tab attached to the same
 *                     match. We don't redirect — let the user decide
 *                     which tab to close.
 */
export type FatalReason =
  | "unauthorized"
  | "not_in_match"
  | "not_found"
  | "superseded";

export interface UseMatchSocketResult {
  state: MatchClientState;
  connection: ConnectionStatus;
  /** Set when the server closed us with a non-recoverable code. */
  fatalReason: FatalReason | null;
  sendAnswer: (questionIndex: number, choiceId: string) => void;
  sendPass: (questionIndex: number) => void;
  leave: () => void;
}

export function useMatchSocket(matchId: string): UseMatchSocketResult {
  const [state, dispatch] = useReducer(matchReducer, initialMatchState);
  const [connection, setConnection] = useState<ConnectionStatus>("connecting");
  const [fatalReason, setFatalReason] = useState<FatalReason | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  /** Once true, all incoming messages are silently dropped and we won't reconnect. */
  const frozenRef = useRef(false);
  /**
   * FIFO queue of messages typed while the socket was not OPEN
   * (initial connect, reconnect after a network drop, etc). Drained
   * inside `onopen` right after the `ready` handshake so the server
   * sees them in the order they were produced. The server already
   * dedups by `currentQuestionIndex`, so flushing entries that became
   * stale during the drop is safe.
   */
  const outboxRef = useRef<ClientMessage[]>([]);

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
        // 1. Tell the server we're ready. The server replies with a
        //    fresh hello + state-appropriate snapshot (sendResyncTo).
        send({ type: "ready" });
        // 2. Flush anything the user typed while the socket was down.
        //    Order is preserved because we splice the whole array in
        //    one shot — late-arriving sendAnswer/sendPass calls during
        //    this microtask would re-queue, not interleave.
        const queued = outboxRef.current.splice(0);
        for (const msg of queued) send(msg);
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

        // Server-side rejections — don't retry, and surface the reason
        // so the page can bounce the user away from a dead match URL
        // (currently shows "Reconnexion" forever otherwise).
        const fatalReasonForCode: Record<number, FatalReason> = {
          4001: "unauthorized",
          4002: "not_in_match",
          4003: "superseded",
          4004: "not_found",
        };
        const reason = fatalReasonForCode[ev.code];
        if (reason) {
          // Freeze further reconnects + state mutations so the page
          // can render its redirect-or-fallback UI from a stable
          // snapshot.
          frozenRef.current = true;
          setFatalReason(reason);
          return;
        }

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
    // Optimistic local lock — happens whether we're online or not so
    // the user sees "your answer was registered" immediately and the
    // UI doesn't keep flashing the picker during a 3s drop.
    dispatch({ type: "_local/answer_pick", questionIndex, choiceId });

    const msg: ClientMessage = {
      type: "answer",
      questionIndex,
      choiceId,
      clientTime: Date.now(),
    };

    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
      return;
    }
    // Socket is closed/connecting — buffer for the next onopen flush.
    // The server's per-question dedup will discard this entry if it's
    // already stale by the time we reconnect, but it'll land if we
    // make it back inside the question window.
    outboxRef.current.push(msg);
  }, []);

  const sendPass = useCallback((questionIndex: number) => {
    const msg: ClientMessage = { type: "pass", questionIndex };
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
      return;
    }
    outboxRef.current.push(msg);
  }, []);

  const leave = useCallback(() => {
    // Lock down the hook: ignore everything that may still be in flight,
    // don't retry, don't dispatch.
    frozenRef.current = true;
    // Drop any queued answers — the user is bailing out, we
    // shouldn't surprise them by replaying a stale outbox if the
    // hook ever reconnects.
    outboxRef.current = [];
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

  return { state, connection, fatalReason, sendAnswer, sendPass, leave };
}
