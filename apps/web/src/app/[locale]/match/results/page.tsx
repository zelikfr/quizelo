import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { PodiumColumn } from "@/components/match/PodiumColumn";
import { ResultStats } from "@/components/match/ResultStats";
import { ROSTER, type Player } from "@/lib/game-data";
import { PODIUM } from "@/lib/game-questions";

interface ResultsPageProps {
  params: Promise<{ locale: string }>;
}

const RESULTS_AMBIENT =
  "radial-gradient(ellipse at 50% 0%, rgba(255,209,102,0.15), transparent 60%)";
const RESULTS_AMBIENT_MOBILE =
  "radial-gradient(ellipse at 50% 0%, rgba(255,209,102,0.18), transparent 60%)";

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("match.results");
  const tCommon = await getTranslations("common");

  const podium = PODIUM.map((p) => {
    const player = ROSTER.find((r) => r.id === p.playerId);
    return player ? { ...p, player } : null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  const me = podium.find((p) => p.player.id === 0);
  const myPlace = me?.place;
  const placeKey = myPlace === 1 ? "first" : myPlace === 2 ? "second" : "third";

  // Visual order: 2nd, 1st, 3rd (stair-step podium).
  const second = podium.find((p) => p.place === 2);
  const first = podium.find((p) => p.place === 1);
  const third = podium.find((p) => p.place === 3);

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1 qa-scan">
      <div className="qa-ambient" aria-hidden />
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
            {t(`place.${placeKey}.title`)}
          </h1>
          <p className="mt-1 text-sm text-fg-2">{t(`place.${placeKey}.tagline`)}</p>
        </div>

        {/* Podium */}
        <div className="relative mb-8 flex items-end justify-center gap-4">
          {second && <Podium podium={second} />}
          {first && <Podium podium={first} />}
          {third && <Podium podium={third} />}
        </div>

        {/* Stats grid */}
        <div className="relative mb-5">
          <ResultStats />
        </div>

        {/* Buttons */}
        <div className="relative mt-auto flex justify-center gap-3">
          <Button variant="primary" size="md" asChild>
            <Link href="/lobby?mode=ranked">↻ {tCommon("rematch")}</Link>
          </Button>
          <Button variant="ghost" size="md" asChild>
            <Link href="/home">{tCommon("backHome")}</Link>
          </Button>
          <Button variant="ghost" size="md">
            ↗ {t("share")}
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
            {t(`place.${placeKey}.titleShort`)}
          </h1>
          <p className="text-xs text-fg-2">{t(`place.${placeKey}.taglineShort`)}</p>
        </div>

        {/* Podium */}
        <div className="relative flex items-end justify-around gap-2 px-[18px] py-5">
          {second && <Podium podium={second} compact />}
          {first && <Podium podium={first} compact />}
          {third && <Podium podium={third} compact />}
        </div>

        {/* Stats */}
        <div className="relative px-[18px]">
          <ResultStats compact />
        </div>

        <div className="flex-1" />

        <div className="relative flex flex-col gap-2 px-[18px] pb-[18px] pt-4">
          <Button variant="primary" size="full" className="py-3" asChild>
            <Link href="/lobby?mode=ranked">↻ {tCommon("rematch")}</Link>
          </Button>
          <Button variant="ghost" size="full" className="py-3" asChild>
            <Link href="/home">{tCommon("backHome")}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

interface PodiumProps {
  podium: {
    place: 1 | 2 | 3;
    eloDelta: number;
    player: Player;
  };
  compact?: boolean;
}

function Podium({ podium, compact = false }: PodiumProps) {
  return (
    <PodiumColumn
      player={podium.player}
      place={podium.place}
      eloDelta={podium.eloDelta}
      eloBefore={podium.player.elo}
      isMe={podium.player.id === 0}
      compact={compact}
    />
  );
}
