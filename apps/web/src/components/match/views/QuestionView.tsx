"use client";

import type { BonusKind, PublicPlayer } from "@quizelo/protocol";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { QAChoice, type ChoiceState } from "@/components/shared/QAChoice";
import { QALives } from "@/components/shared/QALives";
import { QATimerRing } from "@/components/shared/QATimerRing";
import { LiveBonusDock } from "@/components/match/LiveBonusDock";
import { LiveCatChip } from "@/components/match/LiveCatChip";
import { LivePlayerChip } from "@/components/match/LivePlayerChip";
import { cn } from "@/lib/cn";
import type { MatchClientState } from "@/match/match-state";

interface QuestionViewProps {
  state: MatchClientState;
  onAnswer: (questionIndex: number, choiceId: string) => void;
  onBonus: (questionIndex: number, bonus: BonusKind) => void;
  onPass: (questionIndex: number) => void;
}

const LETTERS = ["A", "B", "C", "D", "E"] as const;

export function QuestionView({ state, onAnswer, onBonus, onPass }: QuestionViewProps) {
  const phase = state.status as "phase1" | "phase2" | "phase3";
  if (phase === "phase1")
    return <Phase1View state={state} onAnswer={onAnswer} onBonus={onBonus} onPass={onPass} />;
  if (phase === "phase2")
    return <Phase2View state={state} onAnswer={onAnswer} onPass={onPass} />;
  return <Phase3View state={state} onAnswer={onAnswer} />;
}

// ─── Phase 1 — 3-column desktop / mobile strip ──────────────────────
function Phase1View({ state, onAnswer, onBonus }: QuestionViewProps) {
  const t = useTranslations("match");
  const tPhase = useTranslations("match.phase1");
  const tLive = useTranslations("match.live");

  const q = state.question;
  const reveal = state.reveal;
  const remaining = useDeadline(q?.deadline ?? null, state.serverTimeOffset);

  if (!q) return <Loading />;

  const self = state.selfId ? state.players.find((p) => p.userId === state.selfId) : null;
  const isAnswered =
    state.answer?.questionIndex === q.index &&
    (state.answer.choiceId !== null || state.answer.skipped);
  const isReveal = reveal?.questionIndex === q.index;
  const hidden =
    state.fiftyFiftyHide?.questionIndex === q.index
      ? new Set(state.fiftyFiftyHide.hidden)
      : new Set<string>();

  // The reveal carries lives but not status — status only flips at the next
  // phase_start/phase_end. Treat lives = 0 as already out so the survivor
  // count updates instantly on the death blow.
  const alive = state.players.filter(
    (p) => p.status === "active" && p.lives > 0,
  );
  const eliminated = state.players.filter(
    (p) =>
      p.status === "eliminated_p1" ||
      p.status === "eliminated_p2" ||
      p.status === "eliminated_p3" ||
      (p.status === "active" && p.lives <= 0),
  );
  const aliveSorted = [...alive].sort((a, b) => b.score - a.score);
  const half = Math.ceil(aliveSorted.length / 2);
  const aliveLeft = aliveSorted.slice(0, half);
  const aliveRight = aliveSorted.slice(half);

  const handlePick = (choiceId: string) => {
    console.info("[Phase1View] handlePick", {
      choiceId,
      isAnswered,
      isReveal,
      qIndex: q.index,
    });
    if (isAnswered || isReveal) return;
    onAnswer(q.index, choiceId);
  };

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1">
      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="hidden md:flex md:min-h-screen md:flex-col">
        <PhaseHeader
          phase={1}
          progress={`${t("question")} ${q.index + 1}`}
          meta={`${tPhase("survivors")} ${alive.length}/${state.players.length}`}
        />

        <div className="grid flex-1" style={{ gridTemplateColumns: "240px 1fr 240px" }}>
          {/* Left — survivors */}
          <aside className="flex flex-col gap-2 border-r border-white/[0.08] p-5">
            <p className="mb-1 font-mono text-[10px] tracking-[0.15em] text-fg-3">
              {tPhase("survivors")}
            </p>
            {aliveLeft.map((p) => (
              <LivePlayerChip
                key={p.userId}
                player={p}
                compact
                highlight={p.userId === state.selfId}
                status={chipStatusFor(p, state, isReveal)}
              />
            ))}
          </aside>

          {/* Center — question */}
          <section className="flex flex-col px-10 py-8">
            <div className="mb-6 flex items-center justify-between">
              <LiveCatChip cat={q.category} />
              <QATimerRing value={remaining} max={15} size={68} label="SEC" />
            </div>

            <h2 className="m-0 mb-8 font-display text-[36px] font-semibold leading-[1.15] tracking-[-0.015em] text-balance">
              {q.prompt}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {q.choices.map((c, i) =>
                hidden.has(c.id) ? null : (
                  <QAChoice
                    key={c.id}
                    letter={LETTERS[i] ?? "?"}
                    text={c.label}
                    state={choiceStateFor(c.id, state, q.index, hidden)}
                    disabled={isAnswered || isReveal}
                    onClick={() => handlePick(c.id)}
                  />
                ),
              )}
            </div>

            {state.answer?.skipped && (
              <p className="mt-4 rounded-md border border-violet/20 bg-violet/[0.06] px-4 py-2.5 text-[12px] text-violet-light">
                {tLive("skippedNotice")}
              </p>
            )}

            <div className="mt-auto pt-6">
              {self && (
                <LiveBonusDock
                  bonuses={self.bonuses}
                  onUse={
                    isAnswered || isReveal ? undefined : (b) => onBonus(q.index, b)
                  }
                />
              )}
            </div>
          </section>

          {/* Right — others + eliminated */}
          <aside className="flex flex-col gap-2 border-l border-white/[0.08] p-5">
            <p className="mb-1 font-mono text-[10px] tracking-[0.15em] text-fg-3">
              {tPhase("others")}
            </p>
            {aliveRight.map((p) => (
              <LivePlayerChip
                key={p.userId}
                player={p}
                compact
                status={chipStatusFor(p, state, isReveal)}
              />
            ))}

            {eliminated.length > 0 && (
              <>
                <p className="mb-1 mt-3 font-mono text-[10px] tracking-[0.15em] text-fg-3">
                  {tPhase("eliminated")}
                </p>
                {eliminated.map((p) => (
                  <LivePlayerChip
                    key={p.userId}
                    player={p}
                    compact
                    status="eliminated"
                  />
                ))}
              </>
            )}
          </aside>
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────── */}
      <div className="flex min-h-screen flex-col md:hidden">
        <div className="flex items-center justify-between px-[18px] pt-3.5 pb-3">
          <span className="font-mono text-[10px] tracking-[0.18em] text-violet-light">
            P1 · Q{q.index + 1}
          </span>
          <span className="font-mono text-[10px] text-fg-3">
            {tPhase("survivors")} {alive.length}/{state.players.length}
          </span>
        </div>

        {/* Mini player strip */}
        <div className="no-scrollbar flex gap-1 overflow-x-auto px-3.5 pb-3">
          {state.players.map((p) => {
            const out =
              p.status === "eliminated_p1" || p.status === "eliminated_p2" ||
              p.status === "eliminated_p3" || p.status === "left";
            return (
              <div key={p.userId} className="flex shrink-0 flex-col items-center gap-[3px]">
                <QAAvatar
                  name={p.name}
                  seed={p.avatarId}
                  size={28}
                  dim={out}
                  ring={p.userId === state.selfId ? "#7C5CFF" : undefined}
                />
                <QALives count={out ? 0 : p.lives} max={3} size={4} gap={2} />
              </div>
            );
          })}
        </div>

        <div className="mt-1.5 flex items-center justify-between px-[18px]">
          <LiveCatChip cat={q.category} />
          <QATimerRing value={remaining} max={15} size={52} />
        </div>

        <div className="px-[18px] pt-5">
          <h2 className="m-0 font-display text-[22px] font-semibold leading-[1.18] tracking-[-0.01em]">
            {q.prompt}
          </h2>
        </div>

        <div className="flex flex-col gap-2 px-[18px] pt-5">
          {q.choices.map((c, i) =>
            hidden.has(c.id) ? null : (
              <QAChoice
                key={c.id}
                letter={LETTERS[i] ?? "?"}
                text={c.label}
                state={choiceStateFor(c.id, state, q.index, hidden)}
                disabled={isAnswered || isReveal}
                onClick={() => handlePick(c.id)}
              />
            ),
          )}
        </div>

        <div className="flex-1" />

        {self && (
          <LiveBonusDock
            bonuses={self.bonuses}
            onUse={isAnswered || isReveal ? undefined : (b) => onBonus(q.index, b)}
            compact
          />
        )}
      </div>
    </main>
  );
}

// ─── Phase 2 — sprint with big timer ────────────────────────────────
function Phase2View({
  state,
  onAnswer,
  onPass,
}: {
  state: MatchClientState;
  onAnswer: QuestionViewProps["onAnswer"];
  onPass: QuestionViewProps["onPass"];
}) {
  const t = useTranslations("match.live");
  const tPhase = useTranslations("match.phase2");
  const q = state.question;
  const reveal = state.reveal;
  const sprintRemaining = useDeadline(state.phase2EndsAt, state.serverTimeOffset);

  if (!q) return <Loading />;

  const self = state.selfId ? state.players.find((p) => p.userId === state.selfId) : null;
  const isAnswered =
    state.answer?.questionIndex === q.index && state.answer.choiceId !== null;
  const isReveal = reveal?.questionIndex === q.index;

  const ranking = [...state.players]
    .filter((p) => p.status === "active")
    .sort((a, b) => b.score - a.score);
  const cutoff = ranking[2]?.score ?? 0;

  const handlePick = (choiceId: string) => {
    if (isAnswered || isReveal) return;
    onAnswer(q.index, choiceId);
  };

  const handlePass = () => {
    if (isAnswered || isReveal) return;
    onPass(q.index);
  };

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1">
      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="hidden md:block">
        <PhaseHeader phase={2} progress="SPRINT" meta={t("phase2Rules")} accent="gold" />

        {/* Big timer */}
        <div className="relative flex justify-center pt-5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(255,209,102,0.15), transparent 60%)",
            }}
          />
          <div
            className="font-display font-mono text-[72px] font-bold leading-none tracking-[-0.02em] text-gold"
            style={{ textShadow: "0 0 32px rgba(255,209,102,0.45)" }}
          >
            {formatMmSs(sprintRemaining)}
          </div>
        </div>

        <div
          className="mx-auto grid max-w-[1180px] gap-8 px-12 pt-10"
          style={{ gridTemplateColumns: "1fr 320px" }}
        >
          {/* Question card */}
          <div>
            <div className="h-[3px] w-full overflow-hidden rounded-pill bg-white/[0.06]">
              <div
                className="h-full bg-gradient-gold transition-[width] duration-300"
                style={{ width: `${Math.max(0, Math.min(100, (sprintRemaining / 60) * 100))}%` }}
              />
            </div>
            <div className="mt-5 rounded-[18px] border border-white/[0.08] bg-white/[0.025] p-7">
              <LiveCatChip cat={q.category} />
              <h2 className="m-0 mb-5 mt-3.5 font-display text-[28px] font-semibold leading-[1.2] tracking-[-0.01em]">
                {q.prompt}
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {q.choices.map((c, i) => (
                  <QAChoice
                    key={c.id}
                    letter={LETTERS[i] ?? "?"}
                    text={c.label}
                    state={choiceStateFor(c.id, state, q.index, new Set())}
                    disabled={isAnswered || isReveal}
                    onClick={() => handlePick(c.id)}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-[11px] text-fg-3">
                  {tPhase("solo")}
                </span>
                <button
                  type="button"
                  onClick={handlePass}
                  disabled={isAnswered || isReveal}
                  className="cursor-pointer rounded-pill border border-violet/35 bg-violet/[0.08] px-4 py-1.5 font-mono text-[11px] font-bold tracking-[0.1em] text-violet-light hover:bg-violet/[0.14] disabled:cursor-default disabled:opacity-40"
                >
                  ↦ {t("passShort")}
                </button>
              </div>
            </div>

            {/* Your run stats */}
            <div className="mt-4 flex gap-3">
              <ScoreCard label={t("phase2Score")} value={self?.score ?? 0} />
              <ScoreCard label={tPhase("correct")} value={state.phase2Stats.correct} color="text-success" />
              <ScoreCard label={tPhase("wrong")} value={state.phase2Stats.wrong} color="text-danger" />
            </div>
          </div>

          {/* Live leaderboard */}
          <aside className="rounded-[14px] border border-white/[0.08] bg-white/[0.025] p-4.5">
            <div className="mb-3 font-mono text-[10px] tracking-[0.15em] text-fg-3">
              {tPhase("liveTop3")}
            </div>
            <div className="flex flex-col gap-2">
              {ranking.map((p, i) => {
                const inTop3 = i < 3;
                return (
                  <div
                    key={p.userId}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5",
                      inTop3
                        ? "border-success/25 bg-success/[0.06]"
                        : "border-danger/18 bg-danger/[0.05]",
                    )}
                  >
                    <span
                      className={cn(
                        "w-5 font-display font-mono text-base font-bold",
                        inTop3 ? "text-success" : "text-fg-3",
                      )}
                    >
                      {i + 1}
                    </span>
                    <QAAvatar name={p.name} seed={p.avatarId} size={28} />
                    <span
                      className={cn(
                        "flex-1 truncate font-display text-[13px] font-semibold",
                        p.userId === state.selfId ? "text-gold" : "text-fg-1",
                      )}
                    >
                      {p.name}
                    </span>
                    <span
                      className={cn(
                        "font-display font-mono text-[16px] font-bold tabular-nums",
                        inTop3 ? "text-white" : "text-fg-3",
                      )}
                    >
                      {p.score > 0 ? "+" : ""}
                      {p.score}
                    </span>
                  </div>
                );
              })}
              <div className="mt-1 rounded-md border border-dashed border-white/[0.08] bg-white/[0.02] px-3 py-2">
                <span className="font-mono text-[10px] text-fg-3">
                  {tPhase("cutoff")} →{" "}
                  <b className="text-white">{cutoff > 0 ? `+${cutoff}` : cutoff}</b>
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Mobile ──────────────────────────────────────────── */}
      <div className="flex min-h-screen flex-col md:hidden">
        <div className="flex items-center justify-between px-[18px] pt-3.5 pb-2">
          <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-gold">
            P2 · SPRINT
          </span>
          <span className="font-mono text-[10px] text-fg-3">{t("phase2Rules")}</span>
        </div>

        <div className="px-[18px] pt-3 text-center">
          <div
            className="font-display font-mono text-[56px] font-bold leading-none tracking-[-0.02em] text-gold"
            style={{ textShadow: "0 0 24px rgba(255,209,102,0.4)" }}
          >
            {formatMmSs(sprintRemaining)}
          </div>
          <div className="mt-1.5 h-[3px] overflow-hidden rounded-pill bg-white/[0.06]">
            <div
              className="h-full bg-gradient-gold transition-[width] duration-300"
              style={{ width: `${Math.max(0, Math.min(100, (sprintRemaining / 60) * 100))}%` }}
            />
          </div>
        </div>

        <div className="flex gap-1.5 px-[18px] pt-3.5">
          <ScoreCard label={t("phase2Score")} value={self?.score ?? 0} small />
          <ScoreCard label="✓" value={state.phase2Stats.correct} color="text-success" small />
          <ScoreCard label="✗" value={state.phase2Stats.wrong} color="text-danger" small />
        </div>

        <div className="px-[18px] pt-4">
          <LiveCatChip cat={q.category} />
          <h2 className="m-0 mb-3.5 mt-2 font-display text-[18px] font-semibold leading-[1.2]">
            {q.prompt}
          </h2>
          <div className="flex flex-col gap-2">
            {q.choices.map((c, i) => (
              <QAChoice
                key={c.id}
                letter={LETTERS[i] ?? "?"}
                text={c.label}
                state={choiceStateFor(c.id, state, q.index, new Set())}
                disabled={isAnswered || isReveal}
                onClick={() => handlePick(c.id)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handlePass}
            disabled={isAnswered || isReveal}
            className="mt-3 w-full cursor-pointer rounded-md border border-violet/35 bg-violet/[0.08] py-2.5 font-mono text-[11px] font-bold tracking-[0.15em] text-violet-light hover:bg-violet/[0.14] disabled:cursor-default disabled:opacity-40"
          >
            ↦ {t("passShort")}
          </button>
        </div>

        <div className="flex-1" />

        {/* Mini live ranking */}
        <div className="border-t border-white/[0.08] bg-black/30 px-[18px] py-3">
          <div className="mb-1.5 font-mono text-[9px] tracking-[0.15em] text-fg-3">
            {tPhase("topAdvances")}
          </div>
          <div className="flex gap-1.5">
            {ranking.slice(0, 5).map((p, i) => {
              const inTop3 = i < 3;
              return (
                <div
                  key={p.userId}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-lg border px-1 py-1.5 text-center",
                    inTop3
                      ? "border-success/25 bg-success/[0.08]"
                      : "border-danger/18 bg-danger/[0.05]",
                  )}
                >
                  <QAAvatar name={p.name} seed={p.avatarId} size={22} />
                  <span
                    className={cn(
                      "font-display font-mono text-[11px] font-bold",
                      inTop3 ? "text-white" : "text-fg-3",
                    )}
                  >
                    {p.score > 0 ? "+" : ""}
                    {p.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Phase 3 — finale (3 finalist cards + question) ─────────────────
function Phase3View({
  state,
  onAnswer,
}: Omit<QuestionViewProps, "onBonus"> & { onAnswer: QuestionViewProps["onAnswer"] }) {
  const tPhase = useTranslations("match.phase3");

  const q = state.question;
  const reveal = state.reveal;
  const remaining = useDeadline(q?.deadline ?? null, state.serverTimeOffset);

  // All hooks must run unconditionally — keep `useMemo` BEFORE any early
  // return so the hook order is stable across renders.
  const slowestCorrectId = useMemo(() => {
    if (!q || !reveal || reveal.questionIndex !== q.index) return null;
    const corrects = reveal.outcomes.filter((o) => o.isCorrect);
    if (corrects.length === 0 || corrects.length !== reveal.outcomes.length) return null;
    return corrects.reduce((slow, o) =>
      (o.responseMs ?? 0) > (slow.responseMs ?? 0) ? o : slow,
    ).userId;
  }, [reveal, q]);

  if (!q) return <Loading />;

  const isAnswered =
    state.answer?.questionIndex === q.index && state.answer.choiceId !== null;
  const isReveal = reveal?.questionIndex === q.index;

  const finalists = state.players.filter(
    (p) => p.status === "active" || p.status === "finalist" || p.status === "eliminated_p3",
  );

  const handlePick = (choiceId: string) => {
    if (isAnswered || isReveal) return;
    onAnswer(q.index, choiceId);
  };

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(255,209,102,0.12), transparent 60%)",
        }}
      />

      {/* ── Desktop ─────────────────────────────────────────────────── */}
      <div className="relative hidden md:block">
        <PhaseHeader phase={3} progress="FINALE" meta={tPhase("rules")} accent="gold" />

        {/* Three finalists */}
        <div className="flex justify-center gap-8 px-10 pt-5">
          {finalists.map((p) => (
            <FinalistCard
              key={p.userId}
              player={p}
              isSelf={p.userId === state.selfId}
              isLastBadge={p.userId === slowestCorrectId}
              isOut={p.status === "eliminated_p3"}
              tLast={tPhase("lastBadge")}
            />
          ))}
        </div>

        {/* Question */}
        <div className="mx-auto max-w-[820px] px-10 pt-10">
          <div className="mb-4 flex items-center justify-between">
            <LiveCatChip cat={q.category} />
            <QATimerRing value={remaining} max={15} size={64} label="SEC" danger={remaining <= 5} />
          </div>
          <h2 className="m-0 mb-6 font-display text-[32px] font-semibold leading-[1.15] tracking-[-0.015em]">
            {q.prompt}
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {q.choices.map((c, i) => (
              <QAChoice
                key={c.id}
                letter={LETTERS[i] ?? "?"}
                text={c.label}
                state={choiceStateFor(c.id, state, q.index, new Set())}
                disabled={isAnswered || isReveal}
                onClick={() => handlePick(c.id)}
              />
            ))}
          </div>
          <div className="mt-3.5 flex items-center gap-2.5 rounded-[10px] border border-danger/25 bg-danger/[0.08] px-3 py-2.5">
            <span aria-hidden className="text-base text-danger">
              ⚠
            </span>
            <span className="font-mono text-[11px] text-danger/90">
              {tPhase("warning")}
            </span>
          </div>
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────────────── */}
      <div className="relative flex min-h-screen flex-col md:hidden">
        <div className="flex items-center justify-between px-[18px] pt-3.5">
          <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-gold">
            P3 · FINALE
          </span>
          <QATimerRing value={remaining} max={15} size={36} danger={remaining <= 5} />
        </div>

        <div className="flex gap-2 px-3.5 pt-3">
          {finalists.map((p) => (
            <FinalistCard
              key={p.userId}
              player={p}
              isSelf={p.userId === state.selfId}
              isLastBadge={p.userId === slowestCorrectId}
              isOut={p.status === "eliminated_p3"}
              tLast={tPhase("lastBadgeShort")}
              compact
            />
          ))}
        </div>

        <div className="px-[18px] pt-5">
          <LiveCatChip cat={q.category} />
          <h2 className="m-0 mb-4 mt-2.5 font-display text-[20px] font-semibold leading-[1.2]">
            {q.prompt}
          </h2>
          <div className="flex flex-col gap-2">
            {q.choices.map((c, i) => (
              <QAChoice
                key={c.id}
                letter={LETTERS[i] ?? "?"}
                text={c.label}
                state={choiceStateFor(c.id, state, q.index, new Set())}
                disabled={isAnswered || isReveal}
                onClick={() => handlePick(c.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex-1" />

        <div className="px-[18px] pb-5 pt-3">
          <div className="rounded-[10px] border border-danger/25 bg-danger/[0.08] px-2.5 py-2">
            <span className="font-mono text-[10px] text-danger/90">{tPhase("warning")}</span>
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────
function PhaseHeader({
  phase,
  progress,
  meta,
  accent = "violet",
}: {
  phase: 1 | 2 | 3;
  progress?: string;
  meta?: string;
  accent?: "violet" | "gold";
}) {
  const t = useTranslations("match");
  const isViolet = accent === "violet";
  const chipStyle = {
    background: isViolet ? "rgba(124,92,255,0.15)" : "rgba(255,209,102,0.15)",
    borderColor: isViolet ? "rgba(124,92,255,0.35)" : "rgba(255,209,102,0.35)",
    color: isViolet ? "#A18BFF" : "#FFD166",
  };
  return (
    <div className="flex items-center justify-between border-b border-white/[0.08] px-7 py-3.5">
      <div className="flex items-center gap-3">
        <span
          className="rounded border px-2 py-1 font-mono text-[10px] tracking-[0.15em]"
          style={chipStyle}
        >
          {t("phaseLabel")} {phase}
        </span>
        {progress && <span className="font-mono text-[11px] text-fg-3">· {progress}</span>}
      </div>
      {meta && <span className="font-mono text-[11px] text-fg-3">{meta}</span>}
    </div>
  );
}

function FinalistCard({
  player,
  isSelf,
  isLastBadge,
  isOut,
  tLast,
  compact = false,
}: {
  player: PublicPlayer;
  isSelf: boolean;
  isLastBadge: boolean;
  isOut: boolean;
  tLast: string;
  compact?: boolean;
}) {
  const bg = isLastBadge
    ? "linear-gradient(180deg, rgba(255,77,109,0.15), rgba(255,77,109,0.04))"
    : isSelf
      ? "linear-gradient(180deg, rgba(255,209,102,0.15), rgba(255,209,102,0.02))"
      : "rgba(255,255,255,0.03)";
  const borderColor = isLastBadge
    ? "rgba(255,77,109,0.4)"
    : isSelf
      ? "rgba(255,209,102,0.4)"
      : "rgba(255,255,255,0.08)";

  if (compact) {
    return (
      <div
        className={cn(
          "relative flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-2.5",
          isOut && "opacity-50 grayscale-[0.5]",
        )}
        style={{ background: bg, borderColor }}
      >
        <QAAvatar name={player.name} seed={player.avatarId} size={32} dim={isOut} />
        <span className="max-w-full truncate font-display text-[11px] font-bold">
          {player.name}
        </span>
        <QALives count={player.lives} max={3} size={6} gap={3} />
        {isLastBadge && (
          <span
            className="absolute -top-2 left-1/2 -translate-x-1/2 rounded px-1.5 py-[2px] font-mono text-[8px] font-bold tracking-[0.1em] text-white"
            style={{ background: "#FF4D6D" }}
          >
            {tLast}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex min-w-[200px] items-center gap-3.5 rounded-2xl border p-4",
        isOut && "opacity-50 grayscale-[0.5]",
      )}
      style={{ background: bg, borderColor }}
    >
      <QAAvatar name={player.name} seed={player.avatarId} size={48} dim={isOut} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[14px] font-semibold text-white">
          {player.name}
        </div>
        <div className="font-mono text-[10px] text-fg-3">{player.score} pts</div>
        <div className="mt-1.5">
          <QALives count={player.lives} max={3} size={9} gap={4} />
        </div>
      </div>
      {isLastBadge && (
        <span
          className="absolute -top-2.5 right-3 rounded px-2 py-[3px] font-mono text-[9px] font-bold tracking-[0.15em] text-white"
          style={{ background: "#FF4D6D" }}
        >
          {tLast}
        </span>
      )}
    </div>
  );
}

function ScoreCard({
  label,
  value,
  color = "text-fg-1",
  small = false,
}: {
  label: string;
  value: number;
  color?: string;
  small?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex-1 rounded-[10px] border border-white/[0.08] bg-white/[0.025] text-center",
        small ? "p-2.5" : "p-3.5",
      )}
    >
      <div
        className={cn(
          "font-display font-mono font-bold leading-none",
          small ? "text-[18px]" : "text-[22px]",
          color,
        )}
      >
        {value}
      </div>
      <div className="mt-1 font-mono text-[9px] tracking-[0.15em] text-fg-3">
        {label}
      </div>
    </div>
  );
}

function Loading() {
  const t = useTranslations("match.live");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="font-mono text-[11px] tracking-[0.3em] text-fg-3">
        {t("loading")}
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────
function chipStatusFor(
  player: PublicPlayer,
  state: MatchClientState,
  isReveal: boolean,
): import("@/components/match/LivePlayerChip").LiveChipStatus {
  if (
    player.status === "eliminated_p1" ||
    player.status === "eliminated_p2" ||
    player.status === "eliminated_p3" ||
    player.status === "left"
  )
    return "eliminated";

  if (isReveal && state.reveal) {
    const out = state.reveal.outcomes.find((o) => o.userId === player.userId);
    if (out?.isCorrect) return "correct";
    if (out && (out.chosenChoiceId !== null || !out.skipped)) return "wrong";
  }
  // No reveal yet — has the player already submitted an answer? We can't
  // know directly server-side, but we can tell from the local self answer.
  return "alive";
}

function choiceStateFor(
  choiceId: string,
  state: MatchClientState,
  questionIndex: number,
  hidden: Set<string>,
): ChoiceState {
  if (hidden.has(choiceId)) return "dimmed";

  if (state.reveal && state.reveal.questionIndex === questionIndex) {
    if (choiceId === state.reveal.correctChoiceId) return "correct";
    if (state.answer?.choiceId === choiceId) return "wrong";
    return "dimmed";
  }

  if (state.answer?.choiceId === choiceId) return "selected";
  return "idle";
}

function useDeadline(deadlineMs: number | null, offset: number): number {
  const [now, setNow] = useState(() => Date.now() - offset);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() - offset), 200);
    return () => clearInterval(id);
  }, [offset]);
  if (deadlineMs === null) return 0;
  return Math.max(0, Math.ceil((deadlineMs - now) / 1000));
}

function formatMmSs(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
