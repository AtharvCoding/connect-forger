// Tiny synthesized sound effects (no audio files to download).

const KEY = 'connect-forger:muted';
let ctx: AudioContext | null = null;
let muted = (() => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
})();

export const isMuted = () => muted;
export function setMuted(m: boolean) {
  muted = m;
  try {
    localStorage.setItem(KEY, m ? '1' : '0');
  } catch {
    /* storage unavailable: setting just won't persist */
  }
}

function ac(): AudioContext | null {
  if (muted) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, gain = 0.18, slideTo?: number) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise(start: number, dur: number, gain = 0.12) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + start;
  const buf = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3;
  const src = a.createBufferSource();
  const f = a.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 1800;
  const g = a.createGain();
  g.gain.value = gain;
  src.buffer = buf;
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
}

export const sfx = {
  click: () => tone(880, 0, 0.05, 'square', 0.05),
  /** Lower rows land with a deeper clack. */
  drop: (row: number) => {
    noise(0, 0.08, 0.16);
    tone(150 + row * 22, 0, 0.14, 'sine', 0.22, 70);
  },
  bump: () => tone(110, 0, 0.12, 'square', 0.06, 80),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.28, 'triangle', 0.16)),
  lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, i * 0.14, 0.3, 'triangle', 0.14)),
  draw: () => [440, 415].forEach((f, i) => tone(f, i * 0.18, 0.32, 'triangle', 0.14)),
};
