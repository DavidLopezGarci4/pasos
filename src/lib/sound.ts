// Procedural Chiptune 8-Bit Synthesizer using standard Web Audio API
// Zero external audio files, zero latency, 0 KB asset payload

const MUTE_KEY = "pasos_sound_muted";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setSoundMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "true" : "false");
  } catch {
    // Ignored
  }
}

export function toggleSoundMuted(): boolean {
  const current = isSoundMuted();
  setSoundMuted(!current);
  return !current;
}

// 1. Soft retro click / tap
export function playTap(): void {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.035);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.035);
}

// 2. Upbeat Task Completed Arpeggio (C5 - E5 - G5 - C6)
export function playTaskDone(): void {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  const noteDuration = 0.07;
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + idx * noteDuration;

    osc.type = "square";
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.12, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + noteDuration + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + noteDuration + 0.03);
  });
}

// 3. Victorious Fanfare for Level Up / Routine Completion
export function playLevelUp(): void {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const melody = [
    { f: 523.25, d: 0.1 }, // C5
    { f: 659.25, d: 0.1 }, // E5
    { f: 783.99, d: 0.1 }, // G5
    { f: 1046.5, d: 0.25 }, // C6
    { f: 880.0, d: 0.12 }, // A5
    { f: 1046.5, d: 0.4 }, // C6
  ];

  let currentTime = ctx.currentTime;

  melody.forEach((note) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(note.f, currentTime);

    gain.gain.setValueAtTime(0.18, currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, currentTime + note.d);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(currentTime);
    osc.stop(currentTime + note.d);

    currentTime += note.d * 0.9;
  });
}

// 4. Timer Completed Chime
export function playTimerDone(): void {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = "triangle";
  osc2.type = "square";
  osc1.frequency.setValueAtTime(880, now); // A5
  osc2.frequency.setValueAtTime(1760, now); // A6

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.5);
  osc2.stop(now + 0.5);
}

// 5. Cute Pet Feed / Munch sound
export function playPetFeed(): void {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.linearRampToValueAtTime(480, now + 0.06);
  osc.frequency.linearRampToValueAtTime(600, now + 0.12);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.14);
}
