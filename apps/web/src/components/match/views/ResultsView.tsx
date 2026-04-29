"use client";

import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { PodiumColumn } from "@/components/match/PodiumColumn";
import { enqueueAndRedirectAction } from "@/lib/match-actions";
import { cn } from "@/lib/cn";
import type { MatchClientState } from "@/match/match-state";

interface ResultsViewProps {
  state: MatchClientState;
}

const RESULTS_AMBIENT =
  "radial-gradient(ellipse at 50% 0%, rgba(255,209,102,0.15), transparent 60%)";
const RESULTS_AMBIENT_MOBILE =
  "radial-gradient(ellipse at 50% 0%, rgba(255,209,102,0.18), transparent 60%)";

export function ResultsView({ state }: ResultsViewProps) {
  const t = useTranslations("match.results");
  const tCommon = useTranslations("common");

  if (!state.podium) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="font-mono text-[11px] tracking-[0.3em] text-fg-3">
          {t("computing")}
        </span>
      </div>
    );
  }

  const podium = state.podium;
  const playerById = new Map(state.players.map((p) => [p.userId, p]));

  const me = podium.find((p) => p.userId === state.selfId);
  const myPlace = me?.rank;
  const placeKey =
    myPlace === 1 ? "first" : myPlace === 2 ? "second" : myPlace === 3 ? "third" : null;

  // Top 3 (visual stair-step order: 2nd, 1st, 3rd)
  const first = podium.find((p) => p.rank === 1);
  const second = podium.find((p) => p.rank === 2);
  const third = podium.find((p) => p.rank === 3);
  const rest = podium.slice(3);

  // Quick matches don't move ELO — hide every "+N / -N" cell instead of
  // showing zero everywhere.
  const isRanked = state.mode === "ranked";
  const eloFor = (delta: number): number | null => (isRanked ? delta : null);

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1 qa-scan">
      <div className="qa-grid-bg" aria-hidden />

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="relative hidden md:flex md:min-h-screen md:flex-col md:px-14 md:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: RESULTS_AMBIENT }}
        />

        <div className="relative mb-6 text-center">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold">
            ◆ {t("badge")}
          </p>
          <h1
            className="m-0 mt-2 font-display text-[64px] font-bold tracking-[-0.03em] text-gold"
            style={{ textShadow: "0 0 32px rgba(255,209,102,0.3)" }}
          >
            {placeKey
              ? t(`place.${placeKey}.title`)
              : `#${myPlace ?? "—"}`}
          </h1>
          <p className="mt-1 text-sm text-fg-2">
            {placeKey ? t(`place.${placeKey}.tagline`) : t("title")}
          </p>
        </div>

        {/* Podium */}
        <div className="relative mb-8 flex items-end justify-center gap-4">
          {second && (
            <PodiumColumn
              player={mapToPodium(second, playerById)}
              place={2}
              eloDelta={eloFor(second.eloDelta)}
              isMe={second.userId === state.selfId}
            />
          )}
          {first && (
            <PodiumColumn
              player={mapToPodium(first, playerById)}
              place={1}
              eloDelta={eloFor(first.eloDelta)}
              isMe={first.userId === state.selfId}
            />
          )}
          {third && (
            <PodiumColumn
              player={mapToPodium(third, playerById)}
              place={3}
              eloDelta={eloFor(third.eloDelta)}
              isMe={third.userId === state.selfId}
            />
          )}
        </div>

        {/* Rest of the field */}
        {rest.length > 0 && (
          <div className="relative mb-5 flex flex-col gap-1.5">
            {rest.map((row) => {
              const p = playerById.get(row.userId);
              return (
                <div
                  key={row.userId}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-white/[0.06] bg-surface-2/60 px-3 py-2",
                    row.userId === state.selfId && "border-violet/30 bg-violet/[0.08]",
                  )}
                >
                  <span className="w-6 font-mono text-[11px] tracking-[0.1em] text-fg-3">
                    #{row.rank}
                  </span>
                  <span className="flex-1 font-display text-[13px]">
                    {p?.name ?? row.userId}
                  </span>
                  {isRanked && (
                    <span
                      className={cn(
                        "w-12 text-right font-mono text-[11px] tabular-nums",
                        row.eloDelta > 0
                          ? "text-success"
                          : row.eloDelta < 0
                            ? "text-danger"
                            : "text-fg-3",
                      )}
                    >
                      {formatDelta(row.eloDelta)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Buttons */}
        <div className="relative mt-auto flex justify-center gap-3">
          <form action={enqueueAndRedirectAction}>
            <RematchSubmit label={`↻ ${tCommon("rematch")}`} variant="primary" />
          </form>
          <Button variant="ghost" size="md" asChild>
            <Link href="/home" className="no-underline">
              {tCommon("backHome")}
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────── */}
      <div className="relative flex min-h-screen flex-col md:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: RESULTS_AMBIENT_MOBILE }}
        />

        <div className="relative px-[18px] pt-6 text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] text-gold">
            ◆ {t("badge")}
          </p>
          <h1
            className="m-0 mt-2 font-display text-[36px] font-bold tracking-[-0.03em] text-gold"
            style={{ textShadow: "0 0 24px rgba(255,209,102,0.3)" }}
          >
            {placeKey
              ? t(`place.${placeKey}.titleShort`)
              : `#${myPlace ?? "—"}`}
          </h1>
          <p className="text-xs text-fg-2">
            {placeKey ? t(`place.${placeKey}.taglineShort`) : t("title")}
          </p>
        </div>

        <div className="relative flex items-end justify-around gap-2 px-[18px] py-5">
          {second && (
            <PodiumColumn
              player={mapToPodium(second, playerById)}
              place={2}
              eloDelta={eloFor(second.eloDelta)}
              isMe={second.userId === state.selfId}
              compact
            />
          )}
          {first && (
            <PodiumColumn
              player={mapToPodium(first, playerById)}
              place={1}
              eloDelta={eloFor(first.eloDelta)}
              isMe={first.userId === state.selfId}
              compact
            />
          )}
          {third && (
            <PodiumColumn
              player={mapToPodium(third, playerById)}
              place={3}
              eloDelta={eloFor(third.eloDelta)}
              isMe={third.userId === state.selfId}
              compact
            />
          )}
        </div>

        <div className="flex-1" />

        <div className="relative flex flex-col gap-2 px-[18px] pb-[18px] pt-4">
          <form action={enqueueAndRedirectAction}>
            <RematchSubmit label={`↻ ${tCommon("rematch")}`} variant="primary" full />
          </form>
          <Button variant="ghost" size="full" className="py-3" asChild>
            <Link href="/home" className="no-underline">
              {tCommon("backHome")}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

function RematchSubmit({
  label,
  variant,
  full = false,
}: {
  label: string;
  variant: "primary" | "ghost";
  full?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={full ? "full" : "md"}
      disabled={pending}
      className={full ? "py-3" : undefined}
    >
      {pending ? "…" : label}
    </Button>
  );
}

function mapToPodium(
  row: { userId: string; rank: number; score: number; eloDelta: number },
  playerById: Map<string, { name: string; avatarId: number }>,
) {
  const p = playerById.get(row.userId);
  return {
    name: p?.name ?? row.userId,
    seed: p?.avatarId ?? 0,
  };
}

function formatDelta(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}
