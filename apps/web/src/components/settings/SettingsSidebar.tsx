import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";

const SECTIONS = [
  { id: "account",  glyph: "◉", premium: false, danger: false },
  { id: "sub",      glyph: "★", premium: true,  danger: false },
  { id: "gameplay", glyph: "◆", premium: false, danger: false },
  { id: "audio",    glyph: "♪", premium: false, danger: false },
  { id: "notif",    glyph: "◈", premium: false, danger: false },
  { id: "lang",     glyph: "◈", premium: false, danger: false },
  { id: "privacy",  glyph: "⌾", premium: false, danger: false },
  { id: "danger",   glyph: "⚠", premium: false, danger: true  },
] as const;

const VERSION = "Quizelo 0.1.0 · build dev";

interface SettingsSidebarProps {
  active?: string;
}

export async function SettingsSidebar({ active = "account" }: SettingsSidebarProps) {
  const t = await getTranslations("settings.sections");
  const tMisc = await getTranslations("settings.misc");

  return (
    <aside className="border-r border-white/[0.08]">
      {/* Inner sticky wrapper — keeps the nav glued under the HomeTopBar
          (h-16 = 64px = top-16) while the right column scrolls. */}
      <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto px-4 py-6 no-scrollbar">
        {SECTIONS.map((s) => {
          const isActive = s.id === active;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={cn(
                "mb-px flex items-center gap-2.5 rounded-lg border px-3 py-2.5 font-display text-[13px] no-underline transition-colors duration-120",
                isActive
                  ? "border-violet/35 bg-violet/[0.12] font-semibold text-white"
                  : "border-transparent",
                !isActive && s.danger && "text-danger",
                !isActive && !s.danger && "text-fg-2 hover:text-fg-1",
              )}
            >
              <span className="w-4 text-center text-[13px] opacity-85">{s.glyph}</span>
              <span className="flex-1">{t(s.id)}</span>
              {s.premium && (
                <span className="rounded-[4px] bg-gold/15 px-1.5 py-px font-mono text-[9px] tracking-[0.1em] text-gold">
                  PRO
                </span>
              )}
            </a>
          );
        })}

        <div className="mt-4 border-t border-white/[0.08] pt-3">
          <div className="font-mono text-[9px] tracking-[0.18em] text-fg-3">
            {tMisc("version")}
          </div>
          <div className="mt-1 font-mono text-[11px] text-fg-2">{VERSION}</div>
        </div>
      </div>
    </aside>
  );
}
