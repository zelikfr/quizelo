"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { QAAvatar } from "@/components/shared/QAAvatar";
import type { MatchClientState } from "@/match/match-state";

interface FinaleWaitingViewProps {
  state: MatchClientState;
  onLeave: () => void;
}

const AMBIENT =
  "radial-gradient(ellipse at 50% 0%, rgba(255,209,102,0.20), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(255,139,92,0.12), transparent 50%)";

/**
 * Shown to the local player after they're knocked out of phase 3 but
 * before the match ends. The WS stays open so we eventually flip to
 * ResultsView when `match_end` arrives.
 */
export function FinaleWaitingView({ state, onLeave }: FinaleWaitingViewProps) {
  const t = useTranslations("match.finaleWaiting");
  const tDefeat = useTranslations("match.transition.defeat");

  // Capture the rank at the moment of elimination — once frozen, it doesn't
  // matter that the live state keeps updating (other finalist may still die).
  const rankRef = useRef<number | null>(null);
  if (rankRef.current === null) {
    const stillIn = state.players.filter(
      (p) =>
        p.userId !== state.selfId &&
        ((p.status === "active" && p.lives > 0) || p.status === "finalist"),
    ).length;
    rankRef.current = stillIn + 1;
  }

  const self = state.selfId
    ? state.players.find((p) => p.userId === state.selfId)
    : null;
  const placeOrdinal = ordinal(rankRef.current);

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: AMBIENT }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <p className="mb-3 font-mono text-[10px] tracking-[0.3em] text-gold">
          ◆ {t("badge")}
        </p>

        <div className="mb-6 flex flex-col items-center gap-3">
          <div
            className="rounded-[18px] p-0.5"
            style={{ background: "linear-gradient(135deg, #FFD166, #FF8B5C)" }}
          >
            <div className="overflow-hidden rounded-[16px] bg-surface-0">
              <QAAvatar
                name={self?.name ?? "?"}
                seed={self?.avatarId ?? 0}
                size={108}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="font-display text-xl font-semibold text-white">
              {self?.name ?? "—"}
            </div>
          </div>
        </div>

        <h1
          className="m-0 text-center font-display text-[56px] font-bold leading-[0.95] tracking-[-0.025em]"
          style={{ textShadow: "0 0 32px rgba(255,209,102,0.35)" }}
        >
          {t("title", { rank: placeOrdinal })}
        </h1>

        <p className="mt-4 max-w-[520px] text-center text-[14px] leading-relaxed text-fg-2">
          {t("message")}
        </p>

        <div className="mt-9 flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-fg-3">
          <span aria-hidden className="qa-pulse h-1.5 w-1.5 rounded-full bg-gold" />
          {t("liveBadge")}
        </div>

        <Button
          variant="ghost"
          size="md"
          onClick={onLeave}
          className="mt-7"
        >
          {tDefeat("leave")}
        </Button>
      </div>
    </div>
  );
}

function ordinal(n: number): string {
  if (n <= 0) return "—";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
