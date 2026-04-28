import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { LobbyStatsRow } from "@/components/lobby/LobbyStatsRow";
import { LobbySlotGrid } from "@/components/lobby/LobbySlotGrid";
import { LobbyActivityLog } from "@/components/lobby/LobbyActivityLog";
import { QATimerBar } from "@/components/shared/QATimerBar";

interface LobbyPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ mode?: string }>;
}

const FILLED = 7;

export default async function LobbyPage({ params, searchParams }: LobbyPageProps) {
  const { locale } = await params;
  const { mode } = await searchParams;
  setRequestLocale(locale);

  const ranked = mode !== "quick";
  const t = await getTranslations("lobby");
  const tCommon = await getTranslations("common");

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1 qa-scan">
      <div className="qa-ambient" aria-hidden />
      <div className="qa-grid-bg" aria-hidden />

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="hidden md:flex md:flex-col md:min-h-screen md:px-14 md:py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.2em] text-violet-light">
              ◆ {ranked ? t("rankedTitle") : t("normalTitle")}
            </p>
            <h1 className="mt-1.5 font-display text-[36px] font-bold tracking-[-0.02em]">
              {t("findingMatch")}
            </h1>
          </div>
          <Button variant="ghost" size="md" asChild>
            <Link href="/home">✕ {t("cancel")}</Link>
          </Button>
        </header>

        <div className="grid flex-1 gap-8" style={{ gridTemplateColumns: "1fr 320px" }}>
          {/* Center column */}
          <div className="flex flex-col justify-center gap-8">
            <LobbyStatsRow filled={FILLED} />
            <LobbySlotGrid filled={FILLED} />
          </div>

          {/* Right column */}
          <LobbyActivityLog />
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────── */}
      <div className="flex min-h-screen flex-col md:hidden">
        <div className="flex items-center justify-between px-[18px] pt-3.5">
          <Link
            href="/home"
            aria-label={t("cancel")}
            className="text-lg text-fg-2 no-underline"
          >
            ‹
          </Link>
          <span className="font-mono text-[10px] tracking-[0.2em] text-violet-light">
            {ranked ? tCommon("ranked") : tCommon("normal")}
          </span>
          <span className="w-[18px]" />
        </div>

        <div className="px-[18px] pt-5">
          <h1 className="m-0 font-display text-[24px] font-bold leading-none tracking-[-0.02em]">
            {t("findingMatch")}
          </h1>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-qa-pulse rounded-full bg-violet" />
            <span className="font-mono text-[11px] text-fg-2">0:34</span>
          </div>
        </div>

        {/* Big counter */}
        <div className="px-[18px] py-6">
          <div
            className="rounded-lg border border-white/[0.08] p-5 text-center"
            style={{
              background:
                "linear-gradient(180deg, rgba(124,92,255,0.12), rgba(124,92,255,0.02))",
            }}
          >
            <div className="font-display text-[56px] font-bold leading-none tracking-[-0.04em]">
              <span className="text-white">{FILLED}</span>
              <span className="text-[28px] text-fg-3"> / 10</span>
            </div>
            <div className="mt-1 font-mono text-[10px] tracking-[0.15em] text-fg-3">
              {t("playersInRoom")}
            </div>
            <div className="mt-3.5">
              <QATimerBar value={FILLED / 10} />
            </div>
          </div>
        </div>

        {/* Slot grid */}
        <div className="px-[18px]">
          <LobbySlotGrid filled={FILLED} compact />
        </div>

        {/* Activity log compact */}
        <div className="flex-1 overflow-hidden px-[18px] pt-5">
          <div className="mb-2.5 font-mono text-[10px] tracking-[0.15em] text-fg-3">
            {t("activity.title")}
          </div>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {[
              { who: "Drelan",   delay: "+0:32" },
              { who: "auroraX",  delay: "+0:24" },
              { who: "Léa.S",    delay: "+0:22" },
              { who: "M3RIDIAN", delay: "+0:18" },
            ].map((e) => (
              <li key={e.who} className="flex items-center gap-2 text-xs">
                <span className="w-7 font-mono text-[9px] text-fg-4">{e.delay}</span>
                <span className="text-fg-1">{e.who}</span>
                <span className="ml-auto text-[10px] text-success">
                  {t("activity.joined")}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-[18px]">
          <Button variant="ghost" size="full" className="py-3" asChild>
            <Link href="/home">✕ {t("cancel")}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
