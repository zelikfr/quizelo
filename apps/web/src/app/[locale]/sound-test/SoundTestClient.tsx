"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import {
  initAudio,
  playSfx,
  setMusicScene,
  type Scene,
  type SfxName,
} from "@/lib/sound/engine";
import {
  setMusicMuted,
  setSfxMuted,
  toggleMusicMuted,
  toggleSfxMuted,
  useSoundState,
} from "@/lib/sound/store";

interface SfxRow {
  name: SfxName;
  label: string;
  hint: string;
}

const SFX: SfxRow[] = [
  { name: "click", label: "Click", hint: "Pick / Pass" },
  { name: "lobbyJoin", label: "Lobby join", hint: "Two-tone ping" },
  { name: "correct", label: "Correct", hint: "C-E-G-C ascending" },
  { name: "wrong", label: "Wrong", hint: "Two-note dissonance + tick" },
  { name: "lifeLost", label: "Life lost", hint: "Descending sweep + noise" },
  { name: "phaseEnd", label: "Phase end", hint: "Whoosh + resolve" },
  { name: "victory", label: "Victory", hint: "Big I-V-I fanfare" },
  { name: "defeat", label: "Defeat", hint: "Slow minor descent" },
];

const SCENES: Array<{ value: Scene; label: string; description: string }> = [
  { value: "lobby", label: "Lobby", description: "Chill synthwave · 86 BPM" },
  { value: "phase1", label: "Phase 1", description: "Cinematic · 128 BPM" },
  { value: "phase2", label: "Phase 2", description: "Heating up · 134 BPM" },
  { value: "phase3", label: "Phase 3", description: "Last man · 142 BPM" },
  { value: null, label: "Silence", description: "Fade everything out" },
];

export function SoundTestClient() {
  const { musicMuted, sfxMuted } = useSoundState();
  const [currentScene, setCurrentScene] = useState<Scene>(null);
  const [lastPlayed, setLastPlayed] = useState<SfxName | null>(null);
  const [initStatus, setInitStatus] = useState<"idle" | "loading" | "ready">(
    "idle",
  );

  useEffect(() => {
    // Stop music when leaving this page
    return () => setMusicScene(null);
  }, []);

  const handleInit = async () => {
    setInitStatus("loading");
    try {
      await initAudio();
      setInitStatus("ready");
    } catch {
      setInitStatus("idle");
    }
  };

  const handleSfx = (name: SfxName) => {
    void initAudio();
    playSfx(name);
    setLastPlayed(name);
    // Clear the highlight after the sound's typical length
    window.setTimeout(() => {
      setLastPlayed((prev) => (prev === name ? null : prev));
    }, 800);
  };

  const handleScene = (scene: Scene) => {
    void initAudio();
    setMusicScene(scene);
    setCurrentScene(scene);
  };

  return (
    <main className="bg-surface-1 qa-scan relative isolate min-h-screen overflow-x-clip">
      <div className="qa-grid-bg" aria-hidden />

      <div className="relative mx-auto max-w-2xl px-6 py-10">
        {/* Header */}
        <header className="mb-8 text-center">
          <p className="font-mono text-[11px] tracking-[0.3em] text-violet">
            ◆ DEV / SOUND TEST
          </p>
          <h1 className="m-0 mt-2 font-display text-[40px] font-bold tracking-[-0.02em] text-fg-1">
            Audio sandbox
          </h1>
          <p className="mt-2 text-sm text-fg-3">
            Trigger every sound the engine can produce — no match required.
          </p>
        </header>

        {/* Init / status */}
        <Section title="Engine">
          <div className="flex items-center justify-between gap-4">
            <div className="font-mono text-[11px] tracking-[0.15em] text-fg-3">
              <span className="text-fg-2">Status</span>{" "}
              <span
                className={cn(
                  "rounded-pill border px-2 py-[2px]",
                  initStatus === "ready"
                    ? "border-success/40 bg-success/10 text-success"
                    : initStatus === "loading"
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : "border-fg-3/30 bg-surface-2 text-fg-3",
                )}
              >
                {initStatus.toUpperCase()}
              </span>
            </div>
            <button
              type="button"
              onClick={handleInit}
              className="rounded-md border border-violet/40 bg-violet/15 px-3 py-1.5 font-mono text-[11px] tracking-[0.15em] text-violet transition hover:bg-violet/25"
            >
              {initStatus === "ready" ? "REINIT" : "INIT AUDIO"}
            </button>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-fg-3">
            Tone.js loads on the first user gesture (any click on this page
            counts). If a sound seems silent, click <em>INIT AUDIO</em> first.
          </p>
        </Section>

        {/* Toggles */}
        <Section title="Mute toggles">
          <div className="grid grid-cols-2 gap-3">
            <ToggleRow
              label="Music"
              muted={musicMuted}
              onToggle={toggleMusicMuted}
              onForceOn={() => setMusicMuted(false)}
              onForceOff={() => setMusicMuted(true)}
            />
            <ToggleRow
              label="SFX"
              muted={sfxMuted}
              onToggle={toggleSfxMuted}
              onForceOn={() => setSfxMuted(false)}
              onForceOff={() => setSfxMuted(true)}
            />
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-fg-3">
            State is persisted in <code className="text-fg-2">localStorage</code>{" "}
            (<code className="text-fg-2">quizelo:music_muted</code> /{" "}
            <code className="text-fg-2">quizelo:sfx_muted</code>) and shared
            with the live match UI.
          </p>
        </Section>

        {/* Music scenes */}
        <Section title="Music scenes">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            {SCENES.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => handleScene(s.value)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-lg border px-3 py-3 text-left transition",
                  currentScene === s.value
                    ? "border-violet/50 bg-violet/15 text-fg-1"
                    : "border-white/[0.08] bg-surface-2/60 text-fg-2 hover:border-white/20 hover:text-fg-1",
                )}
              >
                <span className="font-display text-[14px]">{s.label}</span>
                <span className="font-mono text-[10px] tracking-[0.1em] text-fg-3">
                  {s.description}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-fg-3">
            Cross-fades over ~1.4s. The transport BPM ramps between 86 and 128
            so swapping mid-loop sounds intentional.
          </p>
        </Section>

        {/* SFX bank */}
        <Section title="SFX bank">
          <div className="grid grid-cols-2 gap-2">
            {SFX.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => handleSfx(s.name)}
                className={cn(
                  "group flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition",
                  lastPlayed === s.name
                    ? "border-gold/60 bg-gold/15"
                    : "border-white/[0.08] bg-surface-2/60 hover:border-white/20",
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-display text-[14px] text-fg-1">
                    {s.label}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.1em] text-fg-3">
                    {s.hint}
                  </span>
                </div>
                <span
                  className={cn(
                    "font-mono text-[10px] tracking-[0.15em] transition",
                    lastPlayed === s.name
                      ? "text-gold"
                      : "text-fg-3 group-hover:text-fg-2",
                  )}
                >
                  ▶ PLAY
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-fg-3">
            Click rapidly — each tap retriggers the synth, no debouncing.
          </p>
        </Section>

        {/* Quick scenarios */}
        <Section title="Scenarios">
          <div className="grid grid-cols-1 gap-2">
            <ScenarioButton
              label="Reveal: correct answer"
              steps={["click", "correct"]}
              onRun={runScenario}
            />
            <ScenarioButton
              label="Reveal: wrong answer"
              steps={["click", "wrong"]}
              onRun={runScenario}
            />
            <ScenarioButton
              label="Reveal: phase 3 life lost"
              steps={["click", "lifeLost"]}
              onRun={runScenario}
            />
            <ScenarioButton
              label="Phase 1 → Phase 2"
              steps={["phaseEnd"]}
              onRun={runScenario}
            />
            <ScenarioButton
              label="Match end: top-3 victory"
              steps={["victory"]}
              onRun={runScenario}
            />
            <ScenarioButton
              label="Match end: defeat"
              steps={["defeat"]}
              onRun={runScenario}
            />
          </div>
        </Section>

        <footer className="mt-8 text-center font-mono text-[10px] tracking-[0.2em] text-fg-3">
          quizelo · sound-test ·{" "}
          <Link href="/home" className="text-violet hover:underline">
            ← back
          </Link>
        </footer>
      </div>
    </main>
  );
}

/* ── Building blocks ──────────────────────────────────────────────────── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-xl border border-white/[0.06] bg-surface-2/40 p-4 backdrop-blur">
      <h2 className="mb-3 font-mono text-[11px] tracking-[0.25em] text-fg-3">
        ◆ {title.toUpperCase()}
      </h2>
      {children}
    </section>
  );
}

function ToggleRow({
  label,
  muted,
  onToggle,
}: {
  label: string;
  muted: boolean;
  onToggle: () => void;
  onForceOn: () => void;
  onForceOff: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        void initAudio();
        onToggle();
      }}
      className={cn(
        "flex flex-col items-start gap-1 rounded-lg border px-3 py-3 text-left transition",
        muted
          ? "border-fg-3/30 bg-surface-1 text-fg-3 hover:border-fg-3/50"
          : "border-success/40 bg-success/10 text-success hover:border-success/60",
      )}
      aria-pressed={!muted}
    >
      <span className="font-display text-[14px]">{label}</span>
      <span className="font-mono text-[10px] tracking-[0.15em]">
        {muted ? "MUTED" : "ACTIVE"} · click to toggle
      </span>
    </button>
  );
}

function ScenarioButton({
  label,
  steps,
  onRun,
}: {
  label: string;
  steps: SfxName[];
  onRun: (steps: SfxName[]) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onRun(steps)}
      className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-surface-2/60 px-3 py-2.5 text-left transition hover:border-white/20"
    >
      <div className="flex flex-col gap-0.5">
        <span className="font-display text-[13px] text-fg-1">{label}</span>
        <span className="font-mono text-[10px] tracking-[0.1em] text-fg-3">
          {steps.join(" → ")}
        </span>
      </div>
      <span className="font-mono text-[10px] tracking-[0.15em] text-fg-3">
        ▶ RUN
      </span>
    </button>
  );
}

function runScenario(steps: SfxName[]): void {
  void initAudio();
  // Click + reveal: ~280ms gap so the click reads before the verdict
  steps.forEach((s, i) => {
    window.setTimeout(() => playSfx(s), i === 0 ? 0 : 280 * i);
  });
}
