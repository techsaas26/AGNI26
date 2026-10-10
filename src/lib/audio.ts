/**
 * A tiny WebAudio kit — every sound is synthesised, there are no audio files.
 * Safe to import during SSR: nothing touches `window` until a sound is played.
 */

type WaveType = OscillatorType;

interface ToneOptions {
  dur?: number;
  type?: WaveType;
  vol?: number;
  to?: number;
  at?: number;
  lp?: number;
}

interface NoiseOptions {
  dur?: number;
  vol?: number;
  fc?: number;
  q?: number;
  type?: BiquadFilterType;
  at?: number;
  to?: number;
}

const KICK = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0];
const SNARE = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1];
const HAT = [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1];
const BASS = [55, 0, 0, 55, 0, 0, 65.4, 0, 0, 0, 55, 0, 82.4, 0, 73.4, 0];
const LEAD = [0, 0, 440, 0, 0, 523, 0, 0, 659, 0, 0, 587, 0, 0, 523, 0];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let on = false;
let ambient = false;
let beatTimer: ReturnType<typeof setInterval> | null = null;
let step = 0;
let nextT = 0;
let beatOn = false;

function ensure(): boolean {
  const AC: typeof AudioContext | undefined =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return false;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp);
    comp.connect(ctx.destination);
    const n = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    noiseBuf = n;
  }
  if (ctx.state === "suspended") ctx.resume();
  return true;
}

function tone(f: number, { dur = 0.18, type = "sine", vol = 0.2, to = 0, at = 0, lp = 0 }: ToneOptions = {}) {
  if (!on || !ensure() || !ctx || !master) return;
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (to) o.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  let out: AudioNode = o;
  if (lp) {
    const b = ctx.createBiquadFilter();
    b.type = "lowpass";
    b.frequency.value = lp;
    o.connect(b);
    out = b;
  }
  out.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise({ dur = 0.1, vol = 0.15, fc = 2000, q = 0.8, type = "bandpass", at = 0, to = 0 }: NoiseOptions = {}) {
  if (!on || !ensure() || !ctx || !master || !noiseBuf) return;
  const t = ctx.currentTime + at;
  const s = ctx.createBufferSource();
  const b = ctx.createBiquadFilter();
  const g = ctx.createGain();
  s.buffer = noiseBuf;
  s.loop = true;
  b.type = type;
  b.frequency.setValueAtTime(fc, t);
  if (to) b.frequency.exponentialRampToValueAtTime(to, t + dur);
  b.Q.value = q;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  s.connect(b);
  b.connect(g);
  g.connect(master);
  s.start(t, Math.random());
  s.stop(t + dur + 0.05);
}

/** A low drone plus hearth crackle, started the first time sound is switched on. */
function startAmbient() {
  if (ambient || !ensure() || !ctx || !master) return;
  ambient = true;
  const g = ctx.createGain();
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 3);
  g.connect(master);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 360;
  lp.connect(g);
  [55, 82.41, 110.2].forEach((f, i) => {
    const x = ctx!.createOscillator();
    const v = ctx!.createGain();
    x.type = i ? "triangle" : "sine";
    x.frequency.value = f;
    v.gain.value = [0.22, 0.1, 0.05][i];
    x.connect(v);
    v.connect(lp);
    x.start();
  });
  const lfo = ctx.createOscillator();
  const lg = ctx.createGain();
  lfo.frequency.value = 0.07;
  lg.gain.value = 120;
  lfo.connect(lg);
  lg.connect(lp.frequency);
  lfo.start();
  setInterval(() => {
    if (!on) return;
    if (Math.random() < 0.7)
      noise({ dur: 0.02 + Math.random() * 0.05, vol: 0.02 + Math.random() * 0.05, fc: 2500 + Math.random() * 4000, q: 1.5, type: "bandpass" });
  }, 95);
}

function schedule() {
  if (!ctx) return;
  while (nextT < ctx.currentTime + 0.12) {
    const i = step % 16;
    const at = Math.max(0, nextT - ctx.currentTime);
    if (KICK[i]) tone(150, { to: 42, dur: 0.28, vol: 0.55, at });
    if (SNARE[i]) {
      noise({ dur: 0.16, vol: 0.22, fc: 1900, q: 0.7, at });
      tone(190, { to: 120, dur: 0.1, vol: 0.12, at, type: "triangle" });
    }
    if (HAT[i]) noise({ dur: 0.045, vol: 0.07, fc: 8500, q: 0.6, type: "highpass", at });
    if (BASS[i]) tone(BASS[i], { type: "sawtooth", dur: 0.24, vol: 0.16, lp: 420, at });
    if (LEAD[i]) tone(LEAD[i], { type: "square", dur: 0.2, vol: 0.05, lp: 2400, at });
    nextT += 60 / 100 / 4;
    step++;
  }
}

function beat(v: boolean) {
  if (v === beatOn || !ensure() || !ctx) return;
  beatOn = v;
  if (v && on) {
    step = 0;
    nextT = ctx.currentTime + 0.05;
    beatTimer = setInterval(schedule, 25);
  } else {
    if (beatTimer) clearInterval(beatTimer);
    beatTimer = null;
    beatOn = false;
  }
}

export const sfx = {
  get on() {
    return on;
  },
  get beating() {
    return beatOn;
  },
  /** Switch sound on/off. Broadcasts a `sfx` event so UI can reflect the state. */
  set(v: boolean, persist = true) {
    on = !!v;
    if (on) {
      ensure();
      startAmbient();
      if (ctx && master) {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 0.6);
      }
    } else if (ctx && master) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      beat(false);
    }
    if (persist) {
      try {
        localStorage.setItem("agni-sound", on ? "1" : "0");
      } catch {
        /* storage unavailable */
      }
    }
    document.dispatchEvent(new CustomEvent("sfx", { detail: on }));
  },
  ignite() {
    noise({ dur: 0.35, vol: 0.3, fc: 900, to: 5000, q: 0.5 });
    noise({ dur: 1.1, vol: 0.16, fc: 400, to: 1800, q: 0.4, at: 0.05 });
    tone(70, { to: 160, dur: 0.7, vol: 0.18, type: "sawtooth", lp: 500 });
  },
  flare() {
    noise({ dur: 1.4, vol: 0.28, fc: 300, to: 6000, q: 0.3, type: "lowpass" });
    tone(55, { to: 220, dur: 1.4, vol: 0.22, type: "sawtooth", lp: 700 });
    tone(440, { to: 880, dur: 1.2, vol: 0.06, at: 0.1 });
  },
  tick() {
    tone(1800, { dur: 0.04, vol: 0.04, type: "square", lp: 3000 });
  },
  hover() {
    tone(900, { dur: 0.06, vol: 0.025 });
  },
  clack() {
    noise({ dur: 0.05, vol: 0.3, fc: 1400, q: 1.2 });
    tone(120, { to: 60, dur: 0.1, vol: 0.3 });
  },
  ratchet() {
    noise({ dur: 0.025, vol: 0.18, fc: 3200, q: 2 });
    tone(2400, { dur: 0.025, vol: 0.04, type: "square" });
  },
  reel() {
    for (let i = 0; i < 6; i++) noise({ dur: 0.02, vol: 0.1, fc: 2600, q: 2, at: i * 0.045 });
  },
  bleep(f = 660) {
    tone(f, { type: "square", dur: 0.09, vol: 0.08, lp: 3200 });
  },
  coin() {
    tone(988, { type: "square", dur: 0.07, vol: 0.08 });
    tone(1319, { type: "square", dur: 0.25, vol: 0.08, at: 0.07 });
  },
  over() {
    [392, 330, 262, 196].forEach((f, i) => tone(f, { type: "square", dur: 0.16, vol: 0.08, at: i * 0.14 }));
  },
  thump(f = 110) {
    tone(f * 1.6, { to: f * 0.5, dur: 0.35, vol: 0.6 });
    noise({ dur: 0.09, vol: 0.22, fc: 900, q: 0.6 });
  },
  chenda(f = 170) {
    tone(f * 1.5, { to: f, dur: 0.2, vol: 0.4, type: "triangle" });
    noise({ dur: 0.07, vol: 0.3, fc: 1800, q: 0.9 });
  },
  light() {
    noise({ dur: 0.5, vol: 0.18, fc: 700, to: 3000, q: 0.5 });
    tone(660, { dur: 0.5, vol: 0.05, to: 990 });
  },
  snap() {
    noise({ dur: 0.04, vol: 0.35, fc: 2200, q: 1 });
    tone(1500, { dur: 0.03, vol: 0.1, type: "square" });
    noise({ dur: 0.06, vol: 0.28, fc: 900, q: 1, at: 0.09 });
    tone(70, { to: 40, dur: 0.12, vol: 0.3, at: 0.09 });
  },
  beat,
};
