import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { ME, ROSTER } from "@/lib/game-data";

interface TransitionPageProps {
  params: Promise<{ locale: string }>;
}

const AMBIENT_DESKTOP =
  "radial-gradient(ellipse at 50% 0%, rgba(255,77,109,0.25), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(255,77,109,0.15), transparent 50%)";
const AMBIENT_MOBILE =
  "radial-gradient(ellipse at 50% 0%, rgba(255,77,109,0.30), transparent 50%)";

const ELO_DELTA = 12;

/** Two players still fighting in the finale (mockup data). */
const REMAINING_IDS = [1, 5] as const;

export default async function TransitionDefeatPage({ params }: TransitionPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("match.transition.defeat");
  const tCommon = await getTranslations("common");

  const remaining = REMAINING_IDS.map((id) => ROSTER.find((p) => p.id === id))
    .filter((x): x is NonNullable<typeof x> => x !== undefined);

  const stats: { value: string; label: string; color: string }[] = [
    { value: "23 / 30", label: t("stats.correct"),  color: "#4ADE80" },
    { value: "76 %",    label: t("stats.accuracy"), color: "#FFFFFF" },
    { value: "6.4s",    label: t("stats.avgTime"),  color: "#5EC2FF" },
  ];

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1 qa-scan">
      <div className="qa-grid-bg" aria-hidden />

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="relative hidden md:flex md:min-h-screen md:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: AMBIENT_DESKTOP }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-danger/[0.04] itp-red-pulse"
        />

        <div className="relative z-10 flex items-center justify-between px-12 py-5">
          <span className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.3em] text-danger">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-danger"
              style={{ boxShadow: "0 0 10px #FF4D6D" }}
            />
            {t("gameOver")}
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] text-fg-3">
            ROOM #A4F2 · 04:38
          </span>
        </div>

        <div
          className="relative z-10 grid flex-1 items-stretch gap-7 px-12 pb-6"
          style={{ gridTemplateColumns: "1.1fr 1fr" }}
        >
          {/* LEFT */}
          <div className="flex flex-col justify-center gap-6">
            <div>
              <div className="mb-3.5 font-mono text-[11px] font-bold tracking-[0.4em] text-danger">
                ✕ {t("eliminatedHeading")}
              </div>
              <h1 className="m-0 font-display text-[72px] font-bold leading-[0.92] tracking-[-0.035em] text-balance">
                {t("titleA")}{" "}
                <span style={{ color: "#C9CFE0" }}>{t("placeOrdinal")}</span>
                {t("titleB")}
                <br />
                {t("titleC")}
              </h1>
            </div>

            {/* ELO + stats */}
            <div
              className="grid gap-2.5"
              style={{ gridTemplateColumns: "1.2fr 1fr 1fr 1fr" }}
            >
              <div
                className="rounded-lg border p-[18px]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,209,102,0.18), rgba(11,15,26,0.7))",
                  borderColor: "rgba(255,209,102,0.4)",
                }}
              >
                <div className="mb-2.5 font-mono text-[9px] font-bold tracking-[0.25em] text-gold">
                  {t("eloGain")}
                </div>
                <div className="font-display font-mono text-[36px] font-bold leading-none text-gold tracking-[-0.02em]">
                  +{ELO_DELTA}
                </div>
                <div className="mt-2 font-mono text-[9px] tracking-[0.15em] text-fg-3">
                  {ME.elo} → {ME.elo + ELO_DELTA}
                </div>
              </div>
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-white/[0.08] bg-black/30 p-3.5"
                >
                  <div
                    className="font-display font-mono text-[22px] font-bold leading-none"
                    style={{ color: s.color }}
                  >
                    {s.value}
                  </div>
                  <div className="mt-1.5 font-mono text-[8px] tracking-[0.2em] text-fg-3">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex gap-2.5">
              <Button variant="gold" size="md" className="flex-1 justify-center" asChild>
                <Link href="/lobby?mode=ranked">{tCommon("rematch")} ▸</Link>
              </Button>
              <Button variant="ghost" size="md" asChild>
                <Link href="/match/phase-3">▸ {t("watchFinale")}</Link>
              </Button>
              <Button variant="ghost" size="md" asChild>
                <Link href="/home">{t("leave")}</Link>
              </Button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col justify-center gap-6">
            {/* Defeat avatar */}
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
                  <QAAvatar name={ME.name} seed={ME.seed} size={140} />
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
                  {ME.name}
                </div>
                <div className="mt-1 font-mono text-[10px] tracking-[0.2em] text-fg-3">
                  {t("placeOrdinal")} {t("placeLabel")} · 1 {t("matchLabel")}
                </div>
              </div>
            </div>

            {/* Remaining finalists */}
            <div className="rounded-[14px] border border-white/[0.08] bg-gradient-surface p-4">
              <div className="mb-2.5 font-mono text-[9px] tracking-[0.25em] text-fg-3">
                {t("stillFighting")}
              </div>
              <div className="flex gap-2.5">
                {remaining.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-1 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2"
                  >
                    <QAAvatar name={p.name} seed={p.seed} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap font-display text-xs font-medium text-white">
                        {p.name}
                      </div>
                      <div className="font-mono text-[9px] tracking-[0.1em] text-fg-3">
                        {p.elo}
                      </div>
                    </div>
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-success" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────── */}
      <div className="relative flex min-h-screen flex-col md:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 right-0 h-[600px]"
          style={{ background: AMBIENT_MOBILE }}
        />

        <div className="relative z-10 px-[22px] pt-12 pb-3.5">
          <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-[0.3em] text-danger">
            <span aria-hidden className="h-[5px] w-[5px] rounded-full bg-danger" />
            {t("gameOver")}
          </div>
        </div>

        {/* Defeat avatar */}
        <div className="relative z-10 flex flex-col items-center gap-4 px-[22px]">
          <div className="relative">
            <div className="overflow-hidden rounded-[14px] grayscale-[0.5] brightness-[0.85]">
              <QAAvatar name={ME.name} seed={ME.seed} size={104} />
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
              <span style={{ color: "#C9CFE0" }}>{t("placeOrdinal")}</span>.
            </h1>
          </div>
        </div>

        {/* ELO + stats */}
        <div className="relative z-10 px-[22px] pt-5">
          <div
            className="mb-2 flex items-center justify-between rounded-lg border p-3.5"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,209,102,0.18), rgba(11,15,26,0.7))",
              borderColor: "rgba(255,209,102,0.4)",
            }}
          >
            <div>
              <div className="mb-1 font-mono text-[9px] font-bold tracking-[0.25em] text-gold">
                {t("eloGain")}
              </div>
              <div className="font-mono text-[9px] text-fg-3">
                {ME.elo} → {ME.elo + ELO_DELTA}
              </div>
            </div>
            <div className="font-display font-mono text-[32px] font-bold leading-none text-gold">
              +{ELO_DELTA}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-white/[0.08] bg-black/30 p-2.5 text-center"
              >
                <div
                  className="font-display font-mono text-base font-bold leading-none"
                  style={{ color: s.color }}
                >
                  {s.value}
                </div>
                <div className="mt-1 font-mono text-[7px] tracking-[0.2em] text-fg-3">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Remaining */}
        <div className="relative z-10 px-[22px] pt-3.5">
          <div className="rounded-xl border border-white/[0.08] bg-gradient-surface p-3">
            <div className="mb-2 font-mono text-[9px] tracking-[0.25em] text-fg-3">
              {t("stillFighting")}
            </div>
            <div className="flex gap-1.5">
              {remaining.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-1 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1.5"
                >
                  <QAAvatar name={p.name} seed={p.seed} size={22} />
                  <div className="min-w-0 flex-1">
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap font-display text-[11px] font-medium text-white">
                      {p.name}
                    </div>
                  </div>
                  <span aria-hidden className="h-[5px] w-[5px] rounded-full bg-success" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="relative z-10 flex flex-col gap-1.5 px-[22px] pt-4 pb-6">
          <Button variant="gold" size="full" className="py-3.5" asChild>
            <Link href="/lobby?mode=ranked">{tCommon("rematch")} ▸</Link>
          </Button>
          <Button
            variant="ghost"
            size="full"
            className="justify-center py-2.5 text-[11px]"
            asChild
          >
            <Link href="/match/phase-3">▸ {t("watchFinale")}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
