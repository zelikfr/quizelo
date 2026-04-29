"use client";

/**
 * Quizelo audio engine — Tone.js implementation.
 *
 * Loaded dynamically by `./engine` (the façade) the first time audio is
 * needed. Never imported eagerly so SSR / build never touches Tone.
 */

import * as Tone from "tone";
import { getMusicMuted, getSfxMuted, subscribe } from "./store";

/* ── Constants ──────────────────────────────────────────────────────────── */

const MUSIC_PEAK_GAIN = 0.32; // master gain when music is on
const SFX_PEAK_GAIN = 0.55; // master gain when sfx are on
const FADE_S = 1.4; // music cross-fade time (seconds)
const MUTE_FADE_S = 0.25; // toggle response time

const BPM_LOBBY = 86;
const BPM_PHASE1 = 128;
const BPM_PHASE2 = 134;
const BPM_PHASE3 = 142;

/* ── Lazy module state ──────────────────────────────────────────────────── */

let initPromise: Promise<void> | null = null;
let initialized = false;

let masterLimiter: Tone.Limiter | null = null;
let musicGain: Tone.Gain | null = null;
let sfxGain: Tone.Gain | null = null;

let lobbyTrack: LobbyTrack | null = null;
let phase1Track: Phase1Track | null = null;
let phase2Track: Phase2Track | null = null;
let phase3Track: Phase3Track | null = null;
let sfx: Sfx | null = null;

let activeScene: Scene = null;
type Scene = "lobby" | "phase1" | "phase2" | "phase3" | null;

/* ── Public API ─────────────────────────────────────────────────────────── */

export type SfxName =
  | "click"
  | "correct"
  | "wrong"
  | "lifeLost"
  | "phaseEnd"
  | "victory"
  | "defeat"
  | "lobbyJoin";

/** Force-init right now (must be called from a user gesture handler). */
export async function initAudio(): Promise<void> {
  if (typeof window === "undefined") return;
  if (initPromise) return initPromise;
  initPromise = bootstrap().catch((err) => {
    // Reset so a later gesture can retry.
    initPromise = null;
    initialized = false;
    // eslint-disable-next-line no-console
    console.warn("[sound] init failed", err);
  });
  return initPromise;
}

async function bootstrap(): Promise<void> {
  await Tone.start();

  masterLimiter = new Tone.Limiter(-1).toDestination();

  musicGain = new Tone.Gain(getMusicMuted() ? 0 : MUSIC_PEAK_GAIN).connect(
    masterLimiter,
  );
  sfxGain = new Tone.Gain(getSfxMuted() ? 0 : SFX_PEAK_GAIN).connect(
    masterLimiter,
  );

  lobbyTrack = new LobbyTrack(musicGain);
  phase1Track = new Phase1Track(musicGain);
  phase2Track = new Phase2Track(musicGain);
  phase3Track = new Phase3Track(musicGain);
  sfx = new Sfx(sfxGain);

  // Reverbs need to render their impulse responses before being playable.
  await Promise.all([
    lobbyTrack.ready,
    phase1Track.ready,
    phase2Track.ready,
    phase3Track.ready,
    sfx.ready,
  ]);

  Tone.Transport.bpm.value = BPM_LOBBY;
  Tone.Transport.start("+0.05");

  // Apply mute changes whenever the user flips a toggle.
  subscribe(() => {
    if (musicGain) {
      musicGain.gain.cancelScheduledValues(Tone.now());
      musicGain.gain.rampTo(
        getMusicMuted() ? 0 : MUSIC_PEAK_GAIN,
        MUTE_FADE_S,
      );
    }
    if (sfxGain) {
      sfxGain.gain.cancelScheduledValues(Tone.now());
      sfxGain.gain.rampTo(getSfxMuted() ? 0 : SFX_PEAK_GAIN, MUTE_FADE_S);
    }
  });

  initialized = true;

  // If a scene was requested before init finished, honour it now.
  if (activeScene !== null) applyScene(activeScene);
}

/** Change which music loop is playing. Pass `null` to fade everything out. */
export function setMusicScene(scene: Scene): void {
  activeScene = scene;
  if (!initialized) return;
  applyScene(scene);
}

function applyScene(scene: Scene): void {
  if (!lobbyTrack || !phase1Track || !phase2Track || !phase3Track) return;
  // Direct BPM assignment (no `rampTo`) — automating the BPM signal while
  // many Parts loop on Transport corrupts the internal tick state and trips
  // a race in TickSource.getTicksAtTime.
  const targetBpm =
    scene === "lobby"
      ? BPM_LOBBY
      : scene === "phase1"
        ? BPM_PHASE1
        : scene === "phase2"
          ? BPM_PHASE2
          : scene === "phase3"
            ? BPM_PHASE3
            : null;
  if (targetBpm !== null) {
    Tone.Transport.bpm.cancelScheduledValues(Tone.now());
    Tone.Transport.bpm.value = targetBpm;
  }
  // Cross-fade: only the requested track gains volume, every other one stops.
  lobbyTrack[scene === "lobby" ? "play" : "stop"]();
  phase1Track[scene === "phase1" ? "play" : "stop"]();
  phase2Track[scene === "phase2" ? "play" : "stop"]();
  phase3Track[scene === "phase3" ? "play" : "stop"]();
}

/** Trigger a one-shot SFX. Safe to call before init (drops). */
export function playSfx(name: SfxName): void {
  if (getSfxMuted()) return;
  if (!initialized || !sfx) return;
  try {
    sfx.play(name);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[sound] sfx", name, err);
  }
}

/* ── Lobby: chill synthwave, Cm — Ab — Fm — G ───────────────────────────── */

class LobbyTrack {
  readonly ready: Promise<void>;

  private out: Tone.Gain;
  private pad: Tone.PolySynth;
  private bass: Tone.MonoSynth;
  private arp: Tone.MonoSynth;
  private parts: Tone.Part[] = [];

  constructor(dest: Tone.ToneAudioNode) {
    this.out = new Tone.Gain(0).connect(dest);

    /* Pad — wide saw with reverb tail */
    const padReverb = new Tone.Reverb({ decay: 6, wet: 0.55 });
    const padFilter = new Tone.Filter({
      frequency: 1100,
      Q: 0.7,
      type: "lowpass",
    });
    this.pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "fatsawtooth", count: 3, spread: 25 },
      envelope: { attack: 1.4, decay: 0.4, sustain: 0.85, release: 2.5 },
      volume: -22,
    });
    this.pad.chain(padFilter, padReverb, this.out);

    /* Bass — warm sub triangle */
    this.bass = new Tone.MonoSynth({
      oscillator: { type: "triangle" },
      filter: { Q: 0.5, type: "lowpass", rolloff: -24 },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.4,
        sustain: 0.4,
        release: 1,
        baseFrequency: 220,
        octaves: 2,
      },
      envelope: { attack: 0.04, decay: 0.5, sustain: 0.6, release: 1 },
      volume: -14,
    });
    this.bass.connect(this.out);

    /* Arp — 8th-note plucks with delay */
    const arpDelay = new Tone.FeedbackDelay({
      delayTime: "8n",
      feedback: 0.42,
      wet: 0.35,
    });
    this.arp = new Tone.MonoSynth({
      oscillator: { type: "square" },
      filterEnvelope: {
        attack: 0.005,
        decay: 0.18,
        sustain: 0.15,
        release: 0.25,
        baseFrequency: 900,
        octaves: 2,
      },
      envelope: { attack: 0.005, decay: 0.18, sustain: 0.1, release: 0.2 },
      volume: -28,
    });
    this.arp.chain(arpDelay, this.out);

    this.ready = padReverb.generate().then(() => undefined);

    /* Pad chord progression — 4 bars, one chord per bar (Cm → Ab → Fm → G) */
    const padChords: Array<{ time: string; chord: string[] }> = [
      { time: "0:0:0", chord: ["C4", "Eb4", "G4"] },
      { time: "1:0:0", chord: ["Ab3", "C4", "Eb4"] },
      { time: "2:0:0", chord: ["F3", "Ab3", "C4"] },
      { time: "3:0:0", chord: ["G3", "B3", "D4"] },
    ];
    const padPart = new Tone.Part<{ chord: string[] }>(
      (time, value) => {
        this.pad.triggerAttackRelease(value.chord, "1m", time);
      },
      padChords,
    );
    padPart.loop = true;
    padPart.loopEnd = "4m";
    this.parts.push(padPart);

    /* Bass — root note on every bar, half-note duration */
    const bassNotes: Array<{ time: string; note: string }> = [
      { time: "0:0:0", note: "C2" },
      { time: "1:0:0", note: "Ab1" },
      { time: "2:0:0", note: "F1" },
      { time: "3:0:0", note: "G1" },
    ];
    const bassPart = new Tone.Part<{ note: string }>(
      (time, value) => {
        this.bass.triggerAttackRelease(value.note, "2n", time);
      },
      bassNotes,
    );
    bassPart.loop = true;
    bassPart.loopEnd = "4m";
    this.parts.push(bassPart);

    /* Arp — 8 sparse pentatonic notes, repeats every 2 bars (subtle) */
    const arpNotes: Array<{ time: string; note: string }> = [
      { time: "0:0:0", note: "C5" },
      { time: "0:1:2", note: "G5" },
      { time: "0:2:0", note: "Eb5" },
      { time: "0:3:2", note: "Bb5" },
      { time: "1:0:0", note: "C5" },
      { time: "1:1:2", note: "G5" },
      { time: "1:2:0", note: "Eb5" },
      { time: "1:3:2", note: "Bb4" },
    ];
    const arpPart = new Tone.Part<{ note: string }>(
      (time, value) => {
        this.arp.triggerAttackRelease(value.note, "16n", time, 0.6);
      },
      arpNotes,
    );
    arpPart.loop = true;
    arpPart.loopEnd = "2m";
    this.parts.push(arpPart);
  }

  play(): void {
    for (const p of this.parts) {
      if (p.state !== "started") {
        // start() with no arg = "now" on the Transport timeline. Calling
        // start(0) when Transport has been running schedules all events in
        // the past, so the Part stays silent until its next loop boundary
        // (up to several seconds later — fatal for short transitions).
        try {
          p.start();
        } catch {
          /* swallow — Part may be in a weird state */
        }
      }
    }
    this.out.gain.cancelScheduledValues(Tone.now());
    this.out.gain.rampTo(1, FADE_S);
  }

  stop(): void {
    this.out.gain.cancelScheduledValues(Tone.now());
    this.out.gain.rampTo(0, FADE_S);
    // We deliberately leave the Parts started — calling p.stop() at runtime
    // mutates Tone.Transport's tick schedule mid-flight and can crash
    // TickSource ("cannot read 'time' of undefined").
  }
}

/* ── Phase 1: cinematic synthwave (baseline tension) ────────────────────── */

class Phase1Track {
  readonly ready: Promise<void>;

  private out: Tone.Gain;
  private kick: Tone.MembraneSynth;
  private snap: Tone.NoiseSynth;
  private hat: Tone.NoiseSynth;
  private sub: Tone.MonoSynth;
  private pad: Tone.PolySynth;
  private lead: Tone.PolySynth;
  private parts: Tone.Part[] = [];

  constructor(dest: Tone.ToneAudioNode) {
    this.out = new Tone.Gain(0).connect(dest);

    /* Shared room reverb to glue everything together */
    const roomReverb = new Tone.Reverb({ decay: 2.5, wet: 1 });
    const reverbSend = new Tone.Gain(0.18);
    reverbSend.chain(roomReverb, this.out);

    /* Kick — soft, deep, body over click */
    this.kick = new Tone.MembraneSynth({
      pitchDecay: 0.02,
      octaves: 3,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.32, sustain: 0.01, release: 1.2 },
      volume: -10,
    }).connect(this.out);

    /* Snap — short pink-noise hit, bandpass 1.6 kHz (modern clap-ish) */
    this.snap = new Tone.NoiseSynth({
      noise: { type: "pink" },
      envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.03 },
      volume: -22,
    });
    const snapFilter = new Tone.Filter({
      frequency: 1600,
      type: "bandpass",
      Q: 1.4,
    });
    this.snap.chain(snapFilter, this.out);
    this.snap.connect(reverbSend);

    /* Hat — gentle metallic tick */
    this.hat = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.001, decay: 0.025, sustain: 0, release: 0.01 },
      volume: -34,
    });
    const hatFilter = new Tone.Filter(9000, "highpass");
    this.hat.chain(hatFilter, this.out);

    /* Sub — pure sine sub-bass, no filter sweep, just warmth */
    this.sub = new Tone.MonoSynth({
      oscillator: { type: "sine" },
      filter: { Q: 0.5, type: "lowpass", rolloff: -24 },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.5,
        release: 0.4,
        baseFrequency: 200,
        octaves: 1.5,
      },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0.6, release: 0.4 },
      volume: -10,
    }).connect(this.out);

    /* Pad — soft fatsawtooth, low volume, lots of reverb */
    const padFilter = new Tone.Filter({
      frequency: 1400,
      Q: 0.5,
      type: "lowpass",
    });
    this.pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "fatsawtooth", count: 3, spread: 30 },
      envelope: { attack: 1.2, decay: 0.5, sustain: 0.7, release: 2.5 },
      volume: -28,
    });
    this.pad.chain(padFilter, this.out);
    this.pad.connect(reverbSend);

    /* Lead — bell-like FM synth with delay (replaces the saw lead) */
    const leadDelay = new Tone.FeedbackDelay({
      delayTime: "8n.",
      feedback: 0.28,
      wet: 0.32,
    });
    this.lead = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 7,
      oscillator: { type: "sine" },
      modulation: { type: "sine" },
      envelope: { attack: 0.005, decay: 0.4, sustain: 0.05, release: 0.8 },
      modulationEnvelope: {
        attack: 0.01,
        decay: 0.35,
        sustain: 0,
        release: 0.4,
      },
      volume: -22,
    });
    this.lead.chain(leadDelay, this.out);
    this.lead.connect(reverbSend);

    this.ready = roomReverb.generate().then(() => undefined);

    /* Kick: 1 + 3 (4-on-the-floor variation, leaving space) */
    const kickPart = new Tone.Part(
      (time) => this.kick.triggerAttackRelease("C1", "8n", time),
      [{ time: "0:0:0" }, { time: "0:2:0" }],
    );
    kickPart.loop = true;
    kickPart.loopEnd = "1m";
    this.parts.push(kickPart);

    /* Snap: 2 + 4 */
    const snapPart = new Tone.Part(
      (time) => this.snap.triggerAttackRelease("16n", time),
      [{ time: "0:1:0" }, { time: "0:3:0" }],
    );
    snapPart.loop = true;
    snapPart.loopEnd = "1m";
    this.parts.push(snapPart);

    /* Hi-hat: 8th notes */
    const hatTimes = [
      "0:0:0",
      "0:0:2",
      "0:1:0",
      "0:1:2",
      "0:2:0",
      "0:2:2",
      "0:3:0",
      "0:3:2",
    ];
    const hatPart = new Tone.Part(
      (time) => this.hat.triggerAttackRelease("32n", time),
      hatTimes.map((t) => ({ time: t })),
    );
    hatPart.loop = true;
    hatPart.loopEnd = "1m";
    this.parts.push(hatPart);

    /* Sub bass — quarter-note pulse, 4-bar root walk: C - Ab - F - G */
    const bassRoots = ["C2", "Ab1", "F1", "G1"];
    const subNotes: Array<{ time: string; note: string }> = [];
    for (let bar = 0; bar < 4; bar++) {
      for (let beat = 0; beat < 4; beat++) {
        subNotes.push({
          time: `${bar}:${beat}:0`,
          note: bassRoots[bar] ?? "C2",
        });
      }
    }
    const subPart = new Tone.Part<{ note: string }>(
      (time, value) => {
        this.sub.triggerAttackRelease(value.note, "8n", time, 0.65);
      },
      subNotes,
    );
    subPart.loop = true;
    subPart.loopEnd = "4m";
    this.parts.push(subPart);

    /* Pad — slow chord progression underneath, Cm Ab Fm G */
    const padChords: Array<{ time: string; chord: string[] }> = [
      { time: "0:0:0", chord: ["C4", "Eb4", "G4"] },
      { time: "1:0:0", chord: ["Ab3", "C4", "Eb4"] },
      { time: "2:0:0", chord: ["F3", "Ab3", "C4"] },
      { time: "3:0:0", chord: ["G3", "B3", "D4"] },
    ];
    const padPart = new Tone.Part<{ chord: string[] }>(
      (time, value) => {
        this.pad.triggerAttackRelease(value.chord, "1m", time);
      },
      padChords,
    );
    padPart.loop = true;
    padPart.loopEnd = "4m";
    this.parts.push(padPart);

    /* Lead — sparser 4-bar bell-like hook in Cm pentatonic */
    const leadHook: Array<{ time: string; note: string }> = [
      { time: "0:0:0", note: "C5" },
      { time: "0:1:2", note: "Eb5" },
      { time: "0:2:2", note: "G5" },
      { time: "0:3:2", note: "Bb5" },
      { time: "1:0:2", note: "G5" },
      { time: "1:2:0", note: "C6" },
      { time: "1:3:2", note: "Bb5" },
      { time: "2:0:0", note: "Ab5" },
      { time: "2:1:2", note: "G5" },
      { time: "2:3:0", note: "F5" },
      { time: "3:0:2", note: "Eb5" },
      { time: "3:2:0", note: "D5" },
      { time: "3:3:2", note: "C5" },
    ];
    const leadPart = new Tone.Part<{ note: string }>(
      (time, value) => {
        this.lead.triggerAttackRelease(value.note, "4n", time, 0.55);
      },
      leadHook,
    );
    leadPart.loop = true;
    leadPart.loopEnd = "4m";
    this.parts.push(leadPart);
  }

  play(): void {
    for (const p of this.parts) {
      if (p.state !== "started") {
        // start() with no arg = "now" on the Transport timeline. Calling
        // start(0) when Transport has been running schedules all events in
        // the past, so the Part stays silent until its next loop boundary
        // (up to several seconds later — fatal for short transitions).
        try {
          p.start();
        } catch {
          /* swallow — Part may be in a weird state */
        }
      }
    }
    this.out.gain.cancelScheduledValues(Tone.now());
    this.out.gain.rampTo(1, FADE_S);
  }

  stop(): void {
    this.out.gain.cancelScheduledValues(Tone.now());
    this.out.gain.rampTo(0, FADE_S);
    // We deliberately leave the Parts started — calling p.stop() at runtime
    // mutates Tone.Transport's tick schedule mid-flight and can crash
    // TickSource ("cannot read 'time' of undefined").
  }
}

/* ── Phase 2: tension rising (4-on-the-floor, 16th hat, sub 8th, stab) ──── */

class Phase2Track {
  readonly ready: Promise<void>;

  private out: Tone.Gain;
  private kick: Tone.MembraneSynth;
  private snap: Tone.NoiseSynth;
  private hat: Tone.NoiseSynth;
  private sub: Tone.MonoSynth;
  private pad: Tone.PolySynth;
  private lead: Tone.PolySynth;
  private stab: Tone.PolySynth;
  private parts: Tone.Part[] = [];

  constructor(dest: Tone.ToneAudioNode) {
    this.out = new Tone.Gain(0).connect(dest);

    const roomReverb = new Tone.Reverb({ decay: 2.2, wet: 1 });
    const reverbSend = new Tone.Gain(0.18);
    reverbSend.chain(roomReverb, this.out);

    /* Kick — slightly punchier than phase 1 */
    this.kick = new Tone.MembraneSynth({
      pitchDecay: 0.022,
      octaves: 3.5,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0.01, release: 1.0 },
      volume: -9,
    }).connect(this.out);

    /* Snap — tighter, slightly more presence */
    this.snap = new Tone.NoiseSynth({
      noise: { type: "pink" },
      envelope: { attack: 0.001, decay: 0.07, sustain: 0, release: 0.03 },
      volume: -20,
    });
    const snapFilter = new Tone.Filter({
      frequency: 1700,
      type: "bandpass",
      Q: 1.4,
    });
    this.snap.chain(snapFilter, this.out);
    this.snap.connect(reverbSend);

    /* Hi-hat — same metallic tick, 16th notes coming below */
    this.hat = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.001, decay: 0.022, sustain: 0, release: 0.01 },
      volume: -32,
    });
    const hatFilter = new Tone.Filter(9500, "highpass");
    this.hat.chain(hatFilter, this.out);

    /* Sub — sine, 8th notes */
    this.sub = new Tone.MonoSynth({
      oscillator: { type: "sine" },
      filter: { Q: 0.5, type: "lowpass", rolloff: -24 },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.25,
        sustain: 0.5,
        release: 0.3,
        baseFrequency: 220,
        octaves: 1.6,
      },
      envelope: { attack: 0.008, decay: 0.3, sustain: 0.55, release: 0.3 },
      volume: -10,
    }).connect(this.out);

    /* Pad — same timbre as phase 1, slightly more volume */
    const padFilter = new Tone.Filter({
      frequency: 1500,
      Q: 0.5,
      type: "lowpass",
    });
    this.pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "fatsawtooth", count: 3, spread: 30 },
      envelope: { attack: 0.9, decay: 0.5, sustain: 0.7, release: 2 },
      volume: -26,
    });
    this.pad.chain(padFilter, this.out);
    this.pad.connect(reverbSend);

    /* Lead — bell, slightly more present + delay */
    const leadDelay = new Tone.FeedbackDelay({
      delayTime: "8n.",
      feedback: 0.3,
      wet: 0.32,
    });
    this.lead = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 8,
      oscillator: { type: "sine" },
      modulation: { type: "sine" },
      envelope: { attack: 0.005, decay: 0.4, sustain: 0.05, release: 0.7 },
      modulationEnvelope: {
        attack: 0.01,
        decay: 0.35,
        sustain: 0,
        release: 0.4,
      },
      volume: -20,
    });
    this.lead.chain(leadDelay, this.out);
    this.lead.connect(reverbSend);

    /* Stab — saw chord on the "and of 4" of every bar (anticipation) */
    const stabFilter = new Tone.Filter({
      frequency: 2200,
      Q: 0.6,
      type: "lowpass",
    });
    this.stab = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.002, decay: 0.18, sustain: 0, release: 0.2 },
      volume: -28,
    });
    this.stab.chain(stabFilter, this.out);
    this.stab.connect(reverbSend);

    this.ready = roomReverb.generate().then(() => undefined);

    /* Kick: 4-on-the-floor */
    const kickPart = new Tone.Part(
      (time) => this.kick.triggerAttackRelease("C1", "8n", time),
      [
        { time: "0:0:0" },
        { time: "0:1:0" },
        { time: "0:2:0" },
        { time: "0:3:0" },
      ],
    );
    kickPart.loop = true;
    kickPart.loopEnd = "1m";
    this.parts.push(kickPart);

    /* Snap: 2 + 4 + ghost on 4.5 */
    const snapPart = new Tone.Part(
      (time, value: { ghost?: boolean }) =>
        this.snap.triggerAttackRelease("16n", time, value.ghost ? 0.4 : 0.9),
      [
        { time: "0:1:0", ghost: false },
        { time: "0:3:0", ghost: false },
        { time: "0:3:2", ghost: true },
      ],
    );
    snapPart.loop = true;
    snapPart.loopEnd = "1m";
    this.parts.push(snapPart);

    /* Hat: 16th notes throughout */
    const hatTimes: string[] = [];
    for (let beat = 0; beat < 4; beat++) {
      for (let sub = 0; sub < 4; sub++) {
        hatTimes.push(`0:${beat}:${sub}`);
      }
    }
    const hatPart = new Tone.Part(
      (time) => this.hat.triggerAttackRelease("32n", time),
      hatTimes.map((t) => ({ time: t })),
    );
    hatPart.loop = true;
    hatPart.loopEnd = "1m";
    this.parts.push(hatPart);

    /* Sub — 8th notes, 4-bar root walk */
    const bassRoots = ["C2", "Ab1", "F1", "G1"];
    const subNotes: Array<{ time: string; note: string }> = [];
    for (let bar = 0; bar < 4; bar++) {
      for (let beat = 0; beat < 4; beat++) {
        for (let sub = 0; sub < 2; sub++) {
          subNotes.push({
            time: `${bar}:${beat}:${sub * 2}`,
            note: bassRoots[bar] ?? "C2",
          });
        }
      }
    }
    const subPart = new Tone.Part<{ note: string }>(
      (time, value) => {
        this.sub.triggerAttackRelease(value.note, "16n", time, 0.65);
      },
      subNotes,
    );
    subPart.loop = true;
    subPart.loopEnd = "4m";
    this.parts.push(subPart);

    /* Pad — same chord progression as phase 1 */
    const padChords: Array<{ time: string; chord: string[] }> = [
      { time: "0:0:0", chord: ["C4", "Eb4", "G4"] },
      { time: "1:0:0", chord: ["Ab3", "C4", "Eb4"] },
      { time: "2:0:0", chord: ["F3", "Ab3", "C4"] },
      { time: "3:0:0", chord: ["G3", "B3", "D4"] },
    ];
    const padPart = new Tone.Part<{ chord: string[] }>(
      (time, value) => {
        this.pad.triggerAttackRelease(value.chord, "1m", time);
      },
      padChords,
    );
    padPart.loop = true;
    padPart.loopEnd = "4m";
    this.parts.push(padPart);

    /* Lead — slightly denser hook */
    const leadHook: Array<{ time: string; note: string }> = [
      { time: "0:0:0", note: "C5" },
      { time: "0:1:0", note: "Eb5" },
      { time: "0:2:0", note: "G5" },
      { time: "0:3:0", note: "Bb5" },
      { time: "1:0:0", note: "G5" },
      { time: "1:1:2", note: "C6" },
      { time: "1:3:0", note: "Bb5" },
      { time: "2:0:0", note: "Ab5" },
      { time: "2:1:2", note: "G5" },
      { time: "2:3:0", note: "F5" },
      { time: "3:0:0", note: "Eb5" },
      { time: "3:1:2", note: "D5" },
      { time: "3:3:0", note: "C5" },
    ];
    const leadPart = new Tone.Part<{ note: string }>(
      (time, value) => {
        this.lead.triggerAttackRelease(value.note, "4n", time, 0.55);
      },
      leadHook,
    );
    leadPart.loop = true;
    leadPart.loopEnd = "4m";
    this.parts.push(leadPart);

    /* Stab — chord anticipation on the "and of 4" of each bar */
    const stabHits: Array<{ time: string; chord: string[] }> = [
      { time: "0:3:2", chord: ["Ab3", "C4", "Eb4"] },
      { time: "1:3:2", chord: ["F3", "Ab3", "C4"] },
      { time: "2:3:2", chord: ["G3", "B3", "D4"] },
      { time: "3:3:2", chord: ["C4", "Eb4", "G4"] },
    ];
    const stabPart = new Tone.Part<{ chord: string[] }>(
      (time, value) => {
        this.stab.triggerAttackRelease(value.chord, "16n", time, 0.6);
      },
      stabHits,
    );
    stabPart.loop = true;
    stabPart.loopEnd = "4m";
    this.parts.push(stabPart);
  }

  play(): void {
    for (const p of this.parts) {
      if (p.state !== "started") {
        // start() with no arg = "now" on the Transport timeline. Calling
        // start(0) when Transport has been running schedules all events in
        // the past, so the Part stays silent until its next loop boundary
        // (up to several seconds later — fatal for short transitions).
        try {
          p.start();
        } catch {
          /* swallow — Part may be in a weird state */
        }
      }
    }
    this.out.gain.cancelScheduledValues(Tone.now());
    this.out.gain.rampTo(1, FADE_S);
  }

  stop(): void {
    this.out.gain.cancelScheduledValues(Tone.now());
    this.out.gain.rampTo(0, FADE_S);
    // We deliberately leave the Parts started — calling p.stop() at runtime
    // mutates Tone.Transport's tick schedule mid-flight and can crash
    // TickSource ("cannot read 'time' of undefined").
  }
}

/* ── Phase 3: max tension (16th sub w/ 5th, frantic lead, brass on 1) ───── */

class Phase3Track {
  readonly ready: Promise<void>;

  private out: Tone.Gain;
  private kick: Tone.MembraneSynth;
  private snap: Tone.NoiseSynth;
  private hat: Tone.NoiseSynth;
  private sub: Tone.MonoSynth;
  private pad: Tone.PolySynth;
  private lead: Tone.PolySynth;
  private brass: Tone.PolySynth;
  private parts: Tone.Part[] = [];

  constructor(dest: Tone.ToneAudioNode) {
    this.out = new Tone.Gain(0).connect(dest);

    const roomReverb = new Tone.Reverb({ decay: 1.8, wet: 1 });
    const reverbSend = new Tone.Gain(0.15);
    reverbSend.chain(roomReverb, this.out);

    /* Kick — punchier */
    this.kick = new Tone.MembraneSynth({
      pitchDecay: 0.025,
      octaves: 4,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.28, sustain: 0.01, release: 0.9 },
      volume: -8,
    }).connect(this.out);

    /* Snap — sharper still */
    this.snap = new Tone.NoiseSynth({
      noise: { type: "pink" },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.03 },
      volume: -18,
    });
    const snapFilter = new Tone.Filter({
      frequency: 1800,
      type: "bandpass",
      Q: 1.5,
    });
    this.snap.chain(snapFilter, this.out);
    this.snap.connect(reverbSend);

    /* Hi-hat — open more, accented */
    this.hat = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.001, decay: 0.025, sustain: 0, release: 0.01 },
      volume: -30,
    });
    const hatFilter = new Tone.Filter(10000, "highpass");
    this.hat.chain(hatFilter, this.out);

    /* Sub — sine with 16th notes alternating root and 5th */
    this.sub = new Tone.MonoSynth({
      oscillator: { type: "sine" },
      filter: { Q: 0.5, type: "lowpass", rolloff: -24 },
      filterEnvelope: {
        attack: 0.005,
        decay: 0.2,
        sustain: 0.5,
        release: 0.25,
        baseFrequency: 240,
        octaves: 1.7,
      },
      envelope: { attack: 0.005, decay: 0.22, sustain: 0.55, release: 0.25 },
      volume: -10,
    }).connect(this.out);

    /* Pad — sustained Cm9-style voicings */
    const padFilter = new Tone.Filter({
      frequency: 1700,
      Q: 0.55,
      type: "lowpass",
    });
    this.pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "fatsawtooth", count: 3, spread: 32 },
      envelope: { attack: 0.7, decay: 0.4, sustain: 0.7, release: 1.6 },
      volume: -26,
    });
    this.pad.chain(padFilter, this.out);
    this.pad.connect(reverbSend);

    /* Lead — frantic 8th notes, brighter timbre */
    const leadDelay = new Tone.FeedbackDelay({
      delayTime: "16n",
      feedback: 0.28,
      wet: 0.3,
    });
    this.lead = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 9,
      oscillator: { type: "sine" },
      modulation: { type: "sine" },
      envelope: { attack: 0.004, decay: 0.3, sustain: 0.05, release: 0.5 },
      modulationEnvelope: {
        attack: 0.005,
        decay: 0.3,
        sustain: 0,
        release: 0.3,
      },
      volume: -20,
    });
    this.lead.chain(leadDelay, this.out);
    this.lead.connect(reverbSend);

    /* Brass stab — wide saw chord, the new urgency element */
    const brassFilter = new Tone.Filter({
      frequency: 1800,
      Q: 0.8,
      type: "lowpass",
    });
    this.brass = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "fatsawtooth", count: 3, spread: 25 },
      envelope: { attack: 0.005, decay: 0.25, sustain: 0.05, release: 0.3 },
      volume: -24,
    });
    this.brass.chain(brassFilter, this.out);
    this.brass.connect(reverbSend);

    this.ready = roomReverb.generate().then(() => undefined);

    /* Kick: 4-on-the-floor + ghost on 1.5 of every other bar (drives forward) */
    const kickHits: string[] = [];
    for (let bar = 0; bar < 2; bar++) {
      for (let beat = 0; beat < 4; beat++) {
        kickHits.push(`${bar}:${beat}:0`);
      }
      kickHits.push(`${bar}:0:2`);
      kickHits.push(`${bar}:2:2`);
    }
    const kickPart = new Tone.Part(
      (time) => this.kick.triggerAttackRelease("C1", "8n", time),
      kickHits.map((t) => ({ time: t })),
    );
    kickPart.loop = true;
    kickPart.loopEnd = "2m";
    this.parts.push(kickPart);

    /* Snap: 2 + 4 with double on the second bar's 4 */
    const snapPart = new Tone.Part(
      (time, value: { vel: number }) =>
        this.snap.triggerAttackRelease("16n", time, value.vel),
      [
        { time: "0:1:0", vel: 0.9 },
        { time: "0:3:0", vel: 0.9 },
        { time: "0:3:2", vel: 0.5 },
      ],
    );
    snapPart.loop = true;
    snapPart.loopEnd = "1m";
    this.parts.push(snapPart);

    /* Hat: 16th notes with accent every 8th */
    const hatHits: Array<{ time: string; vel: number }> = [];
    for (let beat = 0; beat < 4; beat++) {
      for (let sub = 0; sub < 4; sub++) {
        hatHits.push({
          time: `0:${beat}:${sub}`,
          vel: sub === 0 || sub === 2 ? 1 : 0.5,
        });
      }
    }
    const hatPart = new Tone.Part<{ vel: number }>(
      (time, value) => this.hat.triggerAttackRelease("32n", time, value.vel),
      hatHits,
    );
    hatPart.loop = true;
    hatPart.loopEnd = "1m";
    this.parts.push(hatPart);

    /* Sub — 16th notes alternating root & 5th, 4-bar Cm-Ab-Fm-G */
    const bassNotes = [
      { root: "C2", fifth: "G2" },
      { root: "Ab1", fifth: "Eb2" },
      { root: "F1", fifth: "C2" },
      { root: "G1", fifth: "D2" },
    ];
    const sub16th: Array<{ time: string; note: string }> = [];
    for (let bar = 0; bar < 4; bar++) {
      const { root, fifth } = bassNotes[bar] ?? bassNotes[0]!;
      for (let beat = 0; beat < 4; beat++) {
        for (let sub = 0; sub < 4; sub++) {
          const note = sub === 2 ? fifth : root;
          sub16th.push({ time: `${bar}:${beat}:${sub}`, note });
        }
      }
    }
    const subPart = new Tone.Part<{ note: string }>(
      (time, value) => {
        this.sub.triggerAttackRelease(value.note, "32n", time, 0.55);
      },
      sub16th,
    );
    subPart.loop = true;
    subPart.loopEnd = "4m";
    this.parts.push(subPart);

    /* Pad — Cm9-ish voicings (added 9th tension) */
    const padChords: Array<{ time: string; chord: string[] }> = [
      { time: "0:0:0", chord: ["C4", "Eb4", "G4", "D5"] },
      { time: "1:0:0", chord: ["Ab3", "C4", "Eb4", "Bb4"] },
      { time: "2:0:0", chord: ["F3", "Ab3", "C4", "G4"] },
      { time: "3:0:0", chord: ["G3", "B3", "D4", "A4"] },
    ];
    const padPart = new Tone.Part<{ chord: string[] }>(
      (time, value) => {
        this.pad.triggerAttackRelease(value.chord, "1m", time);
      },
      padChords,
    );
    padPart.loop = true;
    padPart.loopEnd = "4m";
    this.parts.push(padPart);

    /* Lead — frantic 8th notes, urgent zigzag */
    const leadHook: Array<{ time: string; note: string }> = [];
    const phrases = [
      ["C5", "Eb5", "G5", "Eb5", "C5", "Eb5", "G5", "C6"],
      ["G5", "Bb5", "C6", "Bb5", "G5", "Bb5", "C6", "Eb6"],
      ["Ab5", "C6", "Eb6", "C6", "Ab5", "G5", "F5", "Eb5"],
      ["D5", "F5", "G5", "Bb5", "G5", "F5", "Eb5", "D5"],
    ];
    for (let bar = 0; bar < 4; bar++) {
      const phrase = phrases[bar] ?? phrases[0]!;
      for (let beat = 0; beat < 4; beat++) {
        for (let sub = 0; sub < 2; sub++) {
          const idx = beat * 2 + sub;
          const note = phrase[idx];
          if (note) {
            leadHook.push({ time: `${bar}:${beat}:${sub * 2}`, note });
          }
        }
      }
    }
    const leadPart = new Tone.Part<{ note: string }>(
      (time, value) => {
        this.lead.triggerAttackRelease(value.note, "8n", time, 0.5);
      },
      leadHook,
    );
    leadPart.loop = true;
    leadPart.loopEnd = "4m";
    this.parts.push(leadPart);

    /* Brass stab — saw chord on the 1 of every bar (urgency anchor) */
    const brassChords: Array<{ time: string; chord: string[] }> = [
      { time: "0:0:0", chord: ["C3", "Eb3", "G3"] },
      { time: "1:0:0", chord: ["Ab2", "C3", "Eb3"] },
      { time: "2:0:0", chord: ["F2", "Ab2", "C3"] },
      { time: "3:0:0", chord: ["G2", "B2", "D3"] },
    ];
    const brassPart = new Tone.Part<{ chord: string[] }>(
      (time, value) => {
        this.brass.triggerAttackRelease(value.chord, "8n", time, 0.55);
      },
      brassChords,
    );
    brassPart.loop = true;
    brassPart.loopEnd = "4m";
    this.parts.push(brassPart);
  }

  play(): void {
    for (const p of this.parts) {
      if (p.state !== "started") {
        // start() with no arg = "now" on the Transport timeline. Calling
        // start(0) when Transport has been running schedules all events in
        // the past, so the Part stays silent until its next loop boundary
        // (up to several seconds later — fatal for short transitions).
        try {
          p.start();
        } catch {
          /* swallow — Part may be in a weird state */
        }
      }
    }
    this.out.gain.cancelScheduledValues(Tone.now());
    this.out.gain.rampTo(1, FADE_S);
  }

  stop(): void {
    this.out.gain.cancelScheduledValues(Tone.now());
    this.out.gain.rampTo(0, FADE_S);
    // We deliberately leave the Parts started — calling p.stop() at runtime
    // mutates Tone.Transport's tick schedule mid-flight and can crash
    // TickSource ("cannot read 'time' of undefined").
  }
}

/* ── SFX bank — synthwave-aligned (same palette as lobby + match) ───────── */

class Sfx {
  readonly ready: Promise<void>;

  private out: Tone.Gain;

  /** Reverb send — same decay range as the music tracks for cohesion. */
  private reverb: Tone.Reverb;
  private reverbSend: Tone.Gain;

  /** Delay send — 8th-note feedback, same timing as the lobby arp. */
  private delay: Tone.FeedbackDelay;
  private delaySend: Tone.Gain;

  /** Lead — saw with filter envelope (the canonical synthwave voice). */
  private lead: Tone.PolySynth;

  /** Pad — fatsawtooth chord backing (same patch as lobby pad). */
  private pad: Tone.PolySynth;

  /** Square pluck — high accents, mirrors the lobby arp. */
  private pluck: Tone.MonoSynth;

  /** Sub — pure sine bass for impacts. */
  private sub: Tone.MonoSynth;

  /** Pink noise + bandpass — risers / sweeps. */
  private noise: Tone.NoiseSynth;
  private noiseFilter: Tone.Filter;

  constructor(dest: Tone.ToneAudioNode) {
    this.out = new Tone.Gain(1).connect(dest);

    /* Shared sends — generous reverb, gentler delay than lobby arp */
    this.reverb = new Tone.Reverb({ decay: 3.5, wet: 1 });
    this.reverbSend = new Tone.Gain(0.55);
    this.reverbSend.chain(this.reverb, this.out);

    this.delay = new Tone.FeedbackDelay({
      delayTime: "8n",
      feedback: 0.25,
      wet: 1,
    });
    this.delaySend = new Tone.Gain(0.2);
    this.delaySend.chain(this.delay, this.out);

    /* Lead — triangle (not saw) for a softer arcade tone, wide reverb wash */
    this.lead = new Tone.PolySynth(Tone.MonoSynth, {
      oscillator: { type: "triangle" },
      filter: { Q: 0.4, type: "lowpass" },
      filterEnvelope: {
        attack: 0.02,
        decay: 0.3,
        sustain: 0.4,
        release: 0.7,
        baseFrequency: 1100,
        octaves: 1.4,
      },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.35, release: 0.9 },
      volume: -22,
    });
    this.lead.connect(this.out);
    this.lead.connect(this.reverbSend);
    this.lead.connect(this.delaySend);

    /* Pad — same fatsawtooth as lobby pad, gentle attack, lush reverb */
    const padFilter = new Tone.Filter({
      frequency: 1100,
      Q: 0.5,
      type: "lowpass",
    });
    this.pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "fatsawtooth", count: 3, spread: 28 },
      envelope: { attack: 0.4, decay: 0.4, sustain: 0.7, release: 2 },
      volume: -26,
    });
    this.pad.chain(padFilter, this.out);
    this.pad.connect(this.reverbSend);

    /* Soft pluck — triangle (not square), short but mellow, with delay tail */
    this.pluck = new Tone.MonoSynth({
      oscillator: { type: "triangle" },
      filter: { Q: 0.3, type: "lowpass" },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.1,
        release: 0.3,
        baseFrequency: 800,
        octaves: 1.4,
      },
      envelope: { attack: 0.008, decay: 0.2, sustain: 0.05, release: 0.3 },
      volume: -26,
    });
    this.pluck.connect(this.out);
    this.pluck.connect(this.delaySend);
    this.pluck.connect(this.reverbSend);

    /* Sub — round sine impact */
    this.sub = new Tone.MonoSynth({
      oscillator: { type: "sine" },
      filter: { Q: 0.5, type: "lowpass" },
      filterEnvelope: {
        attack: 0.005,
        decay: 0.35,
        sustain: 0.2,
        release: 0.4,
        baseFrequency: 220,
        octaves: 1.5,
      },
      envelope: { attack: 0.003, decay: 0.35, sustain: 0.2, release: 0.4 },
      volume: -8,
    }).connect(this.out);

    /* Filtered pink noise — risers / sweeps */
    this.noise = new Tone.NoiseSynth({
      noise: { type: "pink" },
      envelope: { attack: 0.08, decay: 0.5, sustain: 0, release: 0.15 },
      volume: -28,
    });
    this.noiseFilter = new Tone.Filter({
      frequency: 1200,
      type: "bandpass",
      Q: 0.9,
    });
    this.noise.chain(this.noiseFilter, this.out);

    this.ready = this.reverb.generate().then(() => undefined);
  }

  play(name: SfxName): void {
    const now = Tone.now();
    switch (name) {
      case "click": {
        // Soft triangle pluck — short but mellow, leaves a small delay tail.
        this.pluck.triggerAttackRelease("E5", "16n", now, 0.55);
        break;
      }

      case "lobbyJoin": {
        // Two-note pentatonic ascent on the soft triangle lead.
        this.lead.triggerAttackRelease("G4", "8n", now, 0.5);
        this.lead.triggerAttackRelease("D5", "4n", now + 0.13, 0.55);
        break;
      }

      case "correct": {
        // Cm pentatonic up, soft triangle, lower velocities — feels arcade
        // (4 ascending notes) but reads as gentle, not chiptune.
        this.lead.triggerAttackRelease("C5", "16n", now, 0.55);
        this.lead.triggerAttackRelease("Eb5", "16n", now + 0.09, 0.55);
        this.lead.triggerAttackRelease("G5", "16n", now + 0.18, 0.55);
        this.lead.triggerAttackRelease("C6", "8n", now + 0.27, 0.6);
        break;
      }

      case "wrong": {
        // Downward minor third + soft sub thud — recognisable as "wrong"
        // without buzzy saws.
        this.sub.triggerAttackRelease("F2", "8n", now, 0.55);
        this.lead.triggerAttackRelease("F4", "8n", now + 0.04, 0.45);
        this.lead.triggerAttackRelease("D4", "4n", now + 0.16, 0.45);
        break;
      }

      case "lifeLost": {
        // Soft descending phrase on the lead + sub anchor + low noise breath.
        this.lead.triggerAttackRelease("Bb4", "8n", now, 0.55);
        this.lead.triggerAttackRelease("Gb4", "8n", now + 0.16, 0.55);
        this.lead.triggerAttackRelease("D4", "8n", now + 0.32, 0.55);
        this.lead.triggerAttackRelease("Bb3", "4n", now + 0.48, 0.55);
        this.sub.triggerAttackRelease("Bb1", "2n", now + 0.48, 0.5);
        this.noiseFilter.frequency.setValueAtTime(700, now);
        this.noise.triggerAttackRelease("4n", now, 0.4);
        break;
      }

      case "phaseEnd": {
        // Soft riser → pad chord lands on the peak. No harsh accent.
        this.noiseFilter.frequency.cancelScheduledValues(now);
        this.noiseFilter.frequency.setValueAtTime(400, now);
        this.noiseFilter.frequency.exponentialRampToValueAtTime(
          4500,
          now + 0.55,
        );
        this.noise.triggerAttackRelease("4n", now, 0.55);
        this.pad.triggerAttackRelease(
          ["C4", "Eb4", "G4", "C5"],
          "1n",
          now + 0.5,
          0.65,
        );
        this.lead.triggerAttackRelease("G5", "4n", now + 0.55, 0.45);
        break;
      }

      case "victory": {
        // Pad ascent Cm → G → C major resolution + soft lead celebration.
        const t = now;
        this.pad.triggerAttackRelease(["C4", "Eb4", "G4"], "4n", t, 0.6);
        this.pad.triggerAttackRelease(
          ["G3", "B3", "D4"],
          "4n",
          t + 0.32,
          0.65,
        );
        this.pad.triggerAttackRelease(
          ["C4", "E4", "G4", "C5"],
          "1n",
          t + 0.64,
          0.7,
        );
        // Lead climbs gently over the resolution
        this.lead.triggerAttackRelease("G5", "16n", t + 0.64, 0.5);
        this.lead.triggerAttackRelease("C6", "16n", t + 0.74, 0.5);
        this.lead.triggerAttackRelease("Eb6", "8n", t + 0.84, 0.5);
        this.lead.triggerAttackRelease("G6", "2n", t + 1.0, 0.45);
        break;
      }

      case "defeat": {
        // Slow descending pad — Cm → Bbm → Ab → Gm — soft vinyl fade.
        const dt = now;
        this.pad.triggerAttackRelease(["C4", "Eb4", "G4"], "4n", dt, 0.55);
        this.pad.triggerAttackRelease(
          ["Bb3", "Db4", "F4"],
          "4n",
          dt + 0.5,
          0.5,
        );
        this.pad.triggerAttackRelease(
          ["Ab3", "C4", "Eb4"],
          "4n",
          dt + 1.0,
          0.45,
        );
        this.pad.triggerAttackRelease(
          ["G3", "Bb3", "D4"],
          "1n",
          dt + 1.5,
          0.45,
        );
        this.sub.triggerAttackRelease("G2", "1n", dt + 1.5, 0.45);
        break;
      }
    }
  }
}
