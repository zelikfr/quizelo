"use client";

import { initAudio, playSfx } from "@/lib/sound/engine";
import {
  setMusicMuted,
  setSfxMuted,
  useSoundState,
} from "@/lib/sound/store";
import { cn } from "@/lib/cn";

interface AudioMuteToggleProps {
  scope: "music" | "sfx";
  label: React.ReactNode;
  hint?: React.ReactNode;
  compact?: boolean;
  inline?: boolean;
}

/**
 * Settings-row variant of SoundControls — a single labelled toggle that
 * binds the corresponding mute flag in the persisted sound store.
 *
 * Marked as a client component because it reads `localStorage` (via
 * `useSoundState`) and mutates audio state. The visuals are kept identical
 * to `SettingToggle` for a seamless mix on the settings page.
 */
export function AudioMuteToggle({
  scope,
  label,
  hint,
  compact = false,
  inline = false,
}: AudioMuteToggleProps) {
  const state = useSoundState();
  const muted = scope === "music" ? state.musicMuted : state.sfxMuted;
  const checked = !muted;

  const onChange = (next: boolean) => {
    void initAudio();
    if (scope === "music") {
      setMusicMuted(!next);
    } else {
      const wasMuted = muted;
      setSfxMuted(!next);
      // Confirmation blip when un-muting SFX so the user hears it works.
      if (next && wasMuted) playSfx("click");
    }
  };

  return (
    <label
      className={cn(
        "flex items-center gap-4",
        !inline && "border-b border-white/[0.08] last:border-b-0",
        !inline && (compact ? "px-3.5 py-3" : "px-[18px] py-3.5"),
        "cursor-pointer",
      )}
    >
      <div className="flex-1">
        <div
          className={cn(
            "font-display font-medium text-fg-1",
            compact ? "text-xs" : "text-[13px]",
          )}
        >
          {label}
        </div>
        {hint && (
          <div
            className={cn(
              "mt-0.5 text-fg-3",
              compact ? "text-[10px]" : "text-[11px]",
            )}
          >
            {hint}
          </div>
        )}
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
        aria-label={typeof label === "string" ? label : scope}
      />

      <div
        aria-hidden
        className={cn(
          "relative shrink-0 rounded-pill border bg-white/[0.06] transition-colors duration-200",
          compact ? "h-[18px] w-8" : "h-[22px] w-[38px]",
          "border-white/[0.08]",
          "peer-checked:border-violet/70 peer-checked:bg-violet/50",
          "peer-checked:[box-shadow:0_0_14px_-2px_rgba(124,92,255,0.5)]",
          compact
            ? "peer-checked:[&_.thumb]:left-[14px]"
            : "peer-checked:[&_.thumb]:left-[17px]",
          "peer-checked:[&_.thumb]:bg-white",
        )}
      >
        <div
          className={cn(
            "thumb absolute top-px left-px rounded-full bg-fg-3 transition-[left,background-color] duration-200",
            compact ? "h-[14px] w-[14px]" : "h-[18px] w-[18px]",
          )}
        />
      </div>
    </label>
  );
}
