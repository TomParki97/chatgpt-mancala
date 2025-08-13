const ctx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
  ? new (window.AudioContext || window.webkitAudioContext)()
  : null;

const tones = {
  move: 440,
  capture: 494,
  extra: 523,
  end: 330
};

let enabled = true;
const lastPlay = {};
const COOLDOWN = 60; // ms

export function setEnabled(val) {
  enabled = val;
}

export function toggleEnabled() {
  enabled = !enabled;
  return enabled;
}

export function play(name) {
  if (!enabled || !ctx) return;
  const freq = tones[name];
  if (!freq) return;
  const now = performance.now ? performance.now() : Date.now();
  if (lastPlay[name] && now - lastPlay[name] < COOLDOWN) return;
  lastPlay[name] = now;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.21);
}
