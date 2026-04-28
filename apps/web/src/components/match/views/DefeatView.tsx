"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { cn } from "@/lib/cn";
import type { MatchClientState } from "@/match/match-state";

const AMBIENT_DESKTOP =
  "radial-gradient(ellipse at 50% 0%, rgba(255,77,109,0.25), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(255,77,109,0.15), transparent 50%)";
const AMBIENT_MOBILE =
  "radial-gradient(ellipse at 50% 0%, rgba(255,77,109,0.30), transparent 50%)";

interface DefeatViewProps {
  state: MatchClientState;
  onLeave: () => void;
}

export function DefeatView({ state, onLeave }: DefeatViewProps) {
  const t = useTranslations("match.transition.defeat");

  const self = state.selfId
    ? state.players.find((p) => p.userId === state.selfId)
    : null;

  // Defeat-position: how many *other* players were still in when I went out + 1.
  // Self is excluded — when lives hit 0 in phase 1/3 the server flips the
  // status to eliminated_* but the reveal payload doesn't carry that change,
  // so our snapshot still reads `status: "active"` for any player who lost
  // their last life this round. Cross-check with `lives > 0` to filter them.
  const stillIn = state.players.filter(
    (p) =>
      p.userId !== state.selfId &&
      ((p.status === "active" && p.lives > 0) || p.status === "finalist"),
  ).length;
  // Phase 2 ties: the two eliminated_p2 players go down together at phase
  // end. Break the tie with score so 4th and 5th are distinct.
  const peersAhead =
    self && self.status === "eliminated_p2"
      ? state.players.filter(
          (p) =>
            p.userId !== self.userId &&
            p.status === "eliminated_p2" &&
            p.score > self.score,
        ).length
      : 0;
  const myRank = stillIn + peersAhead + 1;
  const placeOrdinal = ordinal(myRank);

  // Same caveat as `stillIn` above — the snapshot may carry stale "active"
  // status for players who lost their last life this round. Filter by
  // `lives > 0` (or finalist, which doesn't use lives) to avoid showing
  // ghost players in the "still fighting" card.
  const remaining = state.players.filter(
    (p) =>
      p.userId !== state.selfId &&
      ((p.status === "active" && p.lives > 0) || p.status === "finalist"),
  );

  const isRanked = state.mode === "ranked";

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{ background: AMBIENT_DESKTOP }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 block md:hidden"
        style={{ background: AMBIENT_MOBILE }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-danger/[0.04] itp-red-pulse"
      />

      {/* ── Desktop ──────────────────────────────────────────────── */}
      <div className="relative z-10 hidden md:flex md:min-h-screen md:flex-col">
        <div className="flex items-center justify-between px-12 py-5">
          <span className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.3em] text-danger">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-danger"
              style={{ boxShadow: "0 0 10px #FF4D6D" }}
            />
            {t("gameOver")}
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] text-fg-3">
            ROOM #{(state.matchId ?? "").slice(0, 4).toUpperCase()}
          </span>
        </div>

        <div
          className="grid flex-1 items-stretch gap-7 px-12 pb-6"
          style={{ gridTemplateColumns: "1.1fr 1fr" }}
        >
          {/* LEFT */}
          <div className="flex flex-col justify-center gap-6">
            <div>
              <div className="mb-3.5 font-mono text-[11px] font-bold tracking-[0.4em] text-danger">
                ✕ {t("eliminatedHeading")}
              </div>
              <h1 className="m-0 font-display text-[64px] font-bold leading-[0.95] tracking-[-0.03em] text-balance">
                {t("titleA")}{" "}
                <span style={{ color: "#C9CFE0" }}>{placeOrdinal}</span>
                {t("titleB")}
                <br />
                {t("titleC")}
              </h1>
            </div>

            {/* Stats: place + (ELO if ranked) + match */}
            <div
              className="grid gap-2.5"
              style={{
                gridTemplateColumns: isRanked ? "1fr 1fr 1fr" : "1fr 1fr",
              }}
            >
              <StatCard
                label={t("placeLabel")}
                value={placeOrdinal}
                color="#C9CFE0"
              />
              {isRanked && (
                <StatCard
                  label="ELO"
                  value={(self?.score ?? 0).toString()}
                  color="#FFD166"
                />
              )}
              <StatCard
                label={t("matchLabel")}
                value={state.matchId?.slice(0, 4).toUpperCase() ?? "—"}
                color="#5EC2FF"
                mono
              />
            </div>

            <div className="flex gap-2.5">
              <Button
                variant="ghost"
                size="md"
                onClick={onLeave}
                className="flex-1 justify-center"
              >
                {t("leave")}
              </Button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col justify-center gap-6">
            <div
              className="flex flex-col items-center gap-4 rounded-[18px] border p-7"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,77,109,0.10), rgba(11,15,26,0.8))",
                borderColor: "rgba(255,77,109,0.3)",
              }}
            >
              <div className="relative">
                <div className="overflow-hidden rounded-[18px] grayscale-[0.5] brightness-[0.85]">
                  <QAAvatar
                    name={self?.name ?? "?"}
                    seed={self?.avatarId ?? 0}
                    size={140}
                  />
                </div>
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-[18px]"
                  style={{
                    background:
                      "linear-gradient(135deg, transparent calc(50% - 1.5px), rgba(255,77,109,0.95) calc(50% - 1.5px), rgba(255,77,109,0.95) calc(50% + 1.5px), transparent calc(50% + 1.5px))",
                  }}
                />
              </div>
              <div className="text-center">
                <div className="font-display text-2xl font-semibold tracking-[-0.015em] text-white">
                  {self?.name ?? "—"}
                </div>
                <div className="mt-1 font-mono text-[10px] tracking-[0.2em] text-fg-3">
                  {placeOrdinal} {t("placeLabel")}
                </div>
              </div>
            </div>

            {remaining.length > 0 && (
              <div className="rounded-[14px] border border-white/[0.08] bg-gradient-surface p-4">
                <div className="mb-2.5 font-mono text-[9px] tracking-[0.25em] text-fg-3">
                  {t("stillFighting")} · {remaining.length}
                </div>
                <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 xl:grid-cols-4">
                  {remaining.map((p) => (
                    <div
                      key={p.userId}
                      className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2"
                    >
                      <QAAvatar name={p.name} seed={p.avatarId} size={28} />
                      <div className="min-w-0 flex-1">
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap font-display text-xs font-medium text-white">
                          {p.name}
                        </div>
                      </div>
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-success" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-screen flex-col md:hidden">
        <div className="px-[22px] pt-12 pb-3.5">
          <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-[0.3em] text-danger">
            <span aria-hidden className="h-[5px] w-[5px] rounded-full bg-danger" />
            {t("gameOver")}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 px-[22px]">
          <div className="relative">
            <div className="overflow-hidden rounded-[14px] grayscale-[0.5] brightness-[0.85]">
              <QAAvatar
                name={self?.name ?? "?"}
                seed={self?.avatarId ?? 0}
                size={104}
              />
            </div>
            <div
              aria-hidden
              className="absolute inset-0 rounded-[14px]"
              style={{
                background:
                  "linear-gradient(135deg, transparent calc(50% - 1.5px), rgba(255,77,109,0.95) calc(50% - 1.5px), rgba(255,77,109,0.95) calc(50% + 1.5px), transparent calc(50% + 1.5px))",
              }}
            />
          </div>
          <div className="text-center">
            <div className="mb-1.5 font-mono text-[9px] font-bold tracking-[0.35em] text-danger">
              ✕ {t("eliminatedShort")}
            </div>
            <h1 className="m-0 font-display text-[32px] font-bold leading-[0.95] tracking-[-0.025em]">
              {t("titleAShort")}{" "}
              <span style={{ color: "#C9CFE0" }}>{placeOrdinal}</span>.
            </h1>
          </div>
        </div>

        <div
          className={cn("grid gap-1.5 px-[22px] pt-5", isRanked ? "grid-cols-3" : "grid-cols-2")}
        >
          <StatCard
            label={t("placeLabel")}
            value={placeOrdinal}
            color="#C9CFE0"
            small
          />
          {isRanked && (
            <StatCard
              label="ELO"
              value={(self?.score ?? 0).toString()}
              color="#FFD166"
              small
            />
          )}
          <StatCard
            label={t("matchLabel")}
            value={state.matchId?.slice(0, 4).toUpperCase() ?? "—"}
            color="#5EC2FF"
            small
            mono
          />
        </div>

        {remaining.length > 0 && (
          <div className="px-[22px] pt-3.5">
            <div className="rounded-xl border border-white/[0.08] bg-gradient-surface p-3">
              <div className="mb-2 font-mono text-[9px] tracking-[0.25em] text-fg-3">
                {t("stillFighting")} · {remaining.length}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {remaining.map((p) => (
                  <div
                    key={p.userId}
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1.5"
                  >
                    <QAAvatar name={p.name} seed={p.avatarId} size={22} />
                    <div className="min-w-0 flex-1">
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap font-display text-[11px] font-medium text-white">
                        {p.name}
                      </div>
                    </div>
                    <span
                      aria-hidden
                      className="h-[5px] w-[5px] rounded-full bg-success"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-1.5 px-[22px] pt-4 pb-6">
          <Button variant="ghost" size="full" onClick={onLeave} className="py-3.5">
            {t("leave")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  small = false,
  mono = false,
}: {
  label: string;
  value: string;
  color: string;
  small?: boolean;
  mono?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/[0.08] bg-black/30",
        small ? "p-2.5" : "p-3.5",
      )}
    >
      <div
        className={cn(
          "font-display font-bold leading-none",
          small ? "text-base" : "text-[22px]",
          mono ? "font-mono" : "font-mono",
        )}
        style={{ color }}
      >
        {value}
      </div>
      <div
        className={cn(
          "mt-1.5 font-mono tracking-[0.2em] text-fg-3",
          small ? "text-[7px]" : "text-[9px]",
        )}
      >
        {label}
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
