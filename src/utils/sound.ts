let audioCtx: AudioContext | null = null;
let soundVolume = 0.5; // default volume
let soundType: "mechanical" | "typewriter" | "bubble" | "muted" = "mechanical";

export function setVolume(vol: number) {
  soundVolume = Math.max(0, Math.min(1, vol));
}

export function getVolume(): number {
  return soundVolume;
}

export function setSoundType(type: "mechanical" | "typewriter" | "bubble" | "muted") {
  soundType = type;
}

export function getSoundType(): string {
  return soundType;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  // Try to resume if suspended by auto-play blocker
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playKeySound() {
  if (soundType === "muted") return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  if (soundType === "mechanical") {
    // Sharp high frequency click
    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

    gain.gain.setValueAtTime(soundVolume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.06);
  } else if (soundType === "typewriter") {
    // Metal clack sound (high freq noise band + woody pop)
    osc.type = "triangle";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(150, now + 0.08);

    gain.gain.setValueAtTime(soundVolume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    // Add a second metallic ring
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(2500, now);
    gain2.gain.setValueAtTime(soundVolume * 0.03, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
    osc2.start(now);
    osc2.stop(now + 0.04);
  } else if (soundType === "bubble") {
    // Bubble sound - low to high sweep
    osc.type = "sine";
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

    gain.gain.setValueAtTime(soundVolume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.06);
  }
}

export function playErrorSound() {
  if (soundType === "muted") return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  // Buzzing square/sawtooth wave
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(130, now);
  osc.frequency.linearRampToValueAtTime(90, now + 0.15);

  gain.gain.setValueAtTime(soundVolume * 0.12, now);
  gain.gain.linearRampToValueAtTime(0.001, now + 0.15);

  // Bandpass filter to make it sound muffled and old
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(200, now);
  
  osc.disconnect(gain);
  osc.connect(filter);
  filter.connect(gain);

  osc.start(now);
  osc.stop(now + 0.16);
}

export function playLaserSound() {
  if (soundType === "muted") return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  // Laser sweep: high to low
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);

  gain.gain.setValueAtTime(soundVolume * 0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.start(now);
  osc.stop(now + 0.2);
}

export function playChimeSound() {
  if (soundType === "muted") return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 major chord

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(soundVolume * 0.15, now + idx * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.4);
  });
}
