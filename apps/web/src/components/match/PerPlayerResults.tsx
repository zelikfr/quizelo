import { getTranslations } from "next-intl/server";
import { QAAvatar } from "@/components/shared/QAAvatar";
import { QALives } from "@/components/shared/QALives";
import { ROSTER, type Player } from "@/lib/game-data";

export type AnswerStatus = "correct" | "wrong" | "timeout";

export interface PlayerResult {
  playerId: number;
  status: AnswerStatus;
  /** Lives remaining after the round. */
  lives: number;
}

interface PerPlayerResultsProps {
  results: readonly PlayerResult[];
  /** ID of a player eliminated this round (shown as a danger banner). */
  eliminatedPlayerId?: number;
}

const STATUS_STYLES = {
  correct: {
    icon: "✓",
    color: "#4ADE80",
    bg: "rgba(74,222,128,0.06)",
    border: "rgba(74,222,128,0.18)",
  },
  wrong: {
    icon: "✗",
    color: "#FF4D6D",
    bg: "rgba(255,77,109,0.06)",
    border: "rgba(255,77,109,0.18)",
  },
  timeout: {
    icon: "⏱",
    color: "#FFB020",
    bg: "rgba(255,176,32,0.05)",
    border: "rgba(255,176,32,0.18)",
  },
} as const;

const ME_BG = "rgba(124,92,255,0.12)";
const ME_BORDER = "rgba(124,92,255,0.4)";

export async function PerPlayerResults({
  results,
  eliminatedPlayerId,
}: PerPlayerResultsProps) {
  const t = await getTranslations("match.interstitial");
  const eliminated = ROSTER.find((p) => p.id === eliminatedPlayerId);

  return (
    <aside className="flex flex-col rounded-lg border border-white/[0.08] bg-gradient-surface p-[18px]">
      <p className="mb-3 font-mono text-[10px] tracking-[0.15em] text-fg-3">
        {t("perPlayerResults")}
      </p>

      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {results.map((r) => {
          const player: Player | undefined = ROSTER.find((p) => p.id === r.playerId);
          if (!player) return null;
          return (
            <ResultRow
              key={player.id}
              player={player}
              status={r.status}
              lives={r.lives}
            />
          );
        })}
      </ul>

      {eliminated && (
        <div
          className="mt-2.5 flex items-center gap-2 rounded-md border border-dashed border-danger/30 bg-danger/[0.08] px-3 py-2.5"
          role="status"
        >
          <span aria-hidden className="text-sm text-danger">☠</span>
          <span
            className="font-mono text-[10px] tracking-[0.1em]"
            style={{ color: "#FFB0BD" }}
          >
            {t("eliminatedBanner", { name: eliminated.name })}
          </span>
        </div>
      )}
    </aside>
  );
}

interface ResultRowProps {
  player: Player;
  status: AnswerStatus;
  lives: number;
}

function ResultRow({ player, status, lives }: ResultRowProps) {
  const isMe = player.id === 0;
  const cfg = STATUS_STYLES[status];

  return (
    <li
      className="flex items-center gap-2.5 rounded-md border px-2.5 py-2"
      style={{
        background: isMe ? ME_BG : cfg.bg,
        borderColor: isMe ? ME_BORDER : cfg.border,
      }}
    >
      <QAAvatar name={player.name} seed={player.seed} size={26} />
      <span
        className="flex-1 font-display text-xs font-semibold"
        style={{ color: isMe ? "#FFD166" : "var(--fg-1)" }}
      >
        {player.name}
      </span>
      <span aria-hidden className="text-sm" style={{ color: cfg.color }}>
        {cfg.icon}
      </span>
      <QALives count={lives} max={3} size={6} gap={2} />
    </li>
  );
}
