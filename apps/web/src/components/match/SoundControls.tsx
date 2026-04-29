"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { initAudio, playSfx } from "@/lib/sound/engine";
import {
  toggleMusicMuted,
  toggleSfxMuted,
  useSoundState,
} from "@/lib/sound/store";

interface SoundControlsProps {
  className?: string;
}

/** Two-button sound control (music + sfx), placed top-right of the match shell. */
export function SoundControls({ className }: SoundControlsProps) {
  const { musicMuted, sfxMuted } = useSoundState();
  const t = useTranslations("match.shell");

  const onMusicClick = () => {
    // The toggle counts as a user gesture — make sure audio is initialised.
    void initAudio();
    toggleMusicMuted();
  };

  const onSfxClick = () => {
    void initAudio();
    const wasMuted = sfxMuted;
    toggleSfxMuted();
    // Confirmation blip when un-muting SFX so the user hears it works.
    if (wasMuted) playSfx("click");
  };

  return (
    <div
      className={cn(
        "pointer-events-auto inline-flex items-center gap-1.5 rounded-full",
        "border border-white/[0.08] bg-surface-2/80 p-1 backdrop-blur",
        className,
      )}
    >
      <PillButton
        active={!musicMuted}
        onClick={onMusicClick}
        ariaLabel={musicMuted ? t("musicUnmute") : t("musicMute")}
        title={musicMuted ? t("musicUnmute") : t("musicMute")}
      >
        {musicMuted ? <MusicOffIcon /> : <MusicOnIcon />}
      </PillButton>
      <PillButton
        active={!sfxMuted}
        onClick={onSfxClick}
        ariaLabel={sfxMuted ? t("sfxUnmute") : t("sfxMute")}
        title={sfxMuted ? t("sfxUnmute") : t("sfxMute")}
      >
        {sfxMuted ? <SpeakerOffIcon /> : <SpeakerOnIcon />}
      </PillButton>
    </div>
  );
}

interface PillButtonProps {
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
  title: string;
  children: React.ReactNode;
}

function PillButton({
  active,
  onClick,
  ariaLabel,
  title,
  children,
}: PillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      title={title}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-full",
        "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet/60",
        active
          ? "bg-violet/15 text-violet hover:bg-violet/25"
          : "text-fg-3 hover:text-fg-1",
      )}
    >
      {children}
    </button>
  );
}

/* ── Icons (inline SVG, currentColor) ─────────────────────────────────── */

function MusicOnIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function MusicOffIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18V5l12-2v13" opacity="0.4" />
      <circle cx="6" cy="18" r="3" opacity="0.4" />
      <circle cx="18" cy="16" r="3" opacity="0.4" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </svg>
  );
}

function SpeakerOnIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SpeakerOffIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  );
}
