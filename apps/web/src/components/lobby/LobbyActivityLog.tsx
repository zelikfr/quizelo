import { getTranslations } from "next-intl/server";
import { LOBBY_ACTIVITY } from "@/lib/game-data";
import { cn } from "@/lib/cn";

export async function LobbyActivityLog() {
  const t = await getTranslations("lobby.activity");

  return (
    <aside className="flex flex-col rounded-lg border border-white/[0.08] bg-gradient-surface p-[18px]">
      <div className="mb-3.5 font-mono text-[10px] tracking-[0.15em] text-fg-3">
        {t("title")}
      </div>

      <ul className="m-0 flex flex-1 list-none flex-col gap-2.5 p-0">
        {LOBBY_ACTIVITY.map((entry, i) => (
          <li
            key={entry.who}
            className="flex items-center gap-2.5 text-xs"
            style={{ opacity: 1 - i * 0.06 }}
          >
            <span className="w-9 font-mono text-[9px] text-fg-4">{entry.delay}</span>
            <span
              aria-hidden
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                "self" in entry && entry.self
                  ? "bg-gold [box-shadow:0_0_6px_rgba(255,209,102,0.6)]"
                  : "bg-success [box-shadow:0_0_6px_rgba(74,222,128,0.6)]",
              )}
            />
            <span
              className={cn(
                "text-fg-1",
                "self" in entry && entry.self && "font-semibold",
              )}
            >
              {entry.who}
            </span>
            <span className="ml-auto text-[11px] text-fg-3">
              {"self" in entry && entry.self ? t("you") : t("joined")}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center gap-2 rounded-md border border-warn/25 bg-warn/[0.08] p-2.5">
        <span aria-hidden className="h-1.5 w-1.5 animate-qa-pulse rounded-full bg-warn" />
        <span className="font-mono text-[10px] text-warn">{t("starting")}</span>
      </div>
    </aside>
  );
}
