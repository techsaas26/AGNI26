/**
 * A tiny WebAudio kit — effects are synthesised; the soundtrack is public/audio/summit-of-will.mp3.
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

/**
 * Two pieces of music, one after the other. The Turning of the Key scores the logo and ends with it; as the
 * fire opens the page it fades out and the site's own track takes over. Browsers refuse audio before
 * a gesture, so the loader's headphones page asks for one tap; a refused play() elsewhere leaves the
 * wish (`on`) standing and the next click / key / tap starts it.
 *
 * The Turning of the Key is ~120 bpm with its first hit at 1.06 s. The loader timeline is driven from its
 * element's own clock so every letter lands on a beat.
 */
export const SONG = { start: 25, beat0: 25.76, beat: 0.5, end: 36 } as const;
/** The intro uses seconds 25–36 of the track; past this it fades to silence (it keeps running as the loader's clock). */
const INTRO_END = SONG.end;
const VOL_INTRO = 0.75;
const VOL_SITE = 0.6;
let music: HTMLAudioElement | null = null; // The Turning of the Key (the logo)
let clockAt = -1; // the last time `introTime` saw on the song, when it last changed, and when it first showed one
let clockMoved = 0;
let clockSince = 0;
let site: HTMLAudioElement | null = null; // the site's loop
/** Which piece is current: the logo's, or the site's. */
let phase: "intro" | "site" = "intro";
const GESTURES = ["pointerdown", "mousedown", "click", "keydown", "touchstart", "touchend"] as const;

const audible = () => on && ((!!music && !music.paused) || (!!site && !site.paused));
const emit = () => document.dispatchEvent(new CustomEvent("sfx", { detail: audible() }));

/** Ramp an element's volume. */
function fade(el: HTMLAudioElement, to: number, ms: number, done?: () => void) {
  const from = el.volume;
  const t0 = performance.now();
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / ms);
    el.volume = Math.max(0, Math.min(1, from + (to - from) * k));
    if (k < 1) requestAnimationFrame(step);
    else done?.();
  };
  requestAnimationFrame(step);
}

function unlock(e: Event) {
  // the sound button handles its own press (see sfx.toggle), otherwise this tap would start the sound and the click stop it
  if ((e.target as Element | null)?.closest?.(".snd")) return;
  if (on) play();
}

const armUnlock = () => GESTURES.forEach((g) => document.addEventListener(g, unlock, true));
const disarmUnlock = () => GESTURES.forEach((g) => document.removeEventListener(g, unlock, true));

/** Start (or resume) the current piece; resolves true if the browser let it play. */
function play(): Promise<boolean> {
  let m: HTMLAudioElement;
  let level: number;
  if (phase === "intro") {
    if (!music) {
      music = new Audio("/audio/turning-of-the-key.mp3");
      music.preload = "auto";
      // skip the near-silent first moments: the track swells in under the first letter
      music.addEventListener(
        "loadedmetadata",
        () => {
          if (music && music.currentTime < SONG.start) music.currentTime = SONG.start;
        },
        { once: true },
      );
      music.volume = 0;
      let ended = false;
      music.addEventListener("timeupdate", () => {
        if (!ended && music && music.currentTime >= INTRO_END) {
          ended = true;
          fade(music, 0, 1000);
        }
      });
    }
    m = music;
    level = VOL_INTRO;
  } else {
    if (!site) {
      site = new Audio("/audio/agni-nostalgia.mp3");
      site.loop = true;
      site.volume = 0;
    }
    m = site;
    level = VOL_SITE;
  }
  return m
    .play()
    .then(() => {
      disarmUnlock();
      fade(m, level, phase === "intro" ? 1400 : 2200);
      emit();
      return true;
    })
    .catch(() => {
      armUnlock();
      emit();
      return false;
    });
}

/** Filtered noise that swells to a peak and falls away: the body of a transition whoosh. */
function whoosh({ dur = 1, from = 300, to = 4000, vol = 0.25, peak = 0.5, at = 0, q = 0.9 }: { dur?: number; from?: number; to?: number; vol?: number; peak?: number; at?: number; q?: number } = {}) {
  if (!on || !ensure() || !ctx || !master || !noiseBuf) return;
  const t = ctx.currentTime + at;
  const s = ctx.createBufferSource();
  const b = ctx.createBiquadFilter();
  const g = ctx.createGain();
  s.buffer = noiseBuf;
  s.loop = true;
  b.type = "bandpass";
  b.Q.value = q;
  b.frequency.setValueAtTime(from, t);
  b.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + dur * peak);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(b);
  b.connect(g);
  g.connect(master);
  s.start(t, Math.random());
  s.stop(t + dur + 0.05);
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
  /** Switch sound on/off. Broadcasts a `sfx` event (detail: is anything audible) so UI can reflect it. */
  set(v: boolean, persist = true) {
    on = !!v;
    if (on) {
      ensure();
      play();
      if (ctx && master) {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 0.6);
      }
    } else {
      if (ctx && master) {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      }
      beat(false);
      music?.pause();
      site?.pause();
    }
    if (persist) {
      try {
        localStorage.setItem("agni-sound", on ? "1" : "0");
      } catch {
        /* storage unavailable */
      }
    }
    if (!on) emit();
  },
  /** The sound button: acts on what can be heard, so a blocked autoplay starts on the first press. */
  toggle() {
    this.set(!audible());
  },
  /** Start the song (call from the tap on the headphones page); resolves true if it is playing. */
  intro(): Promise<boolean> {
    on = true;
    ensure();
    return play();
  },
  /**
   * The song's own clock in seconds while it is playing — the loader keys its timeline to it. Not a
   * clock, so null (the logo then runs on its own): a song that stopped moving, or one still short of
   * the passage the logo is scored to three seconds after it began (a host without byte ranges cannot
   * seek it there).
   */
  introTime(): number | null {
    if (!music || music.paused || music.currentTime <= 0) return null;
    const now = performance.now();
    const t = music.currentTime;
    clockSince ||= now;
    if (t !== clockAt) {
      clockAt = t;
      clockMoved = now;
    }
    return now - clockMoved > 2000 || (t < SONG.start && now - clockSince > 3000) ? null : t;
  },
  /** The logo is done: The Turning of the Key ends (fading under the fire) and the site's track comes in. */
  endIntro() {
    phase = "site";
    const m = music;
    if (m && !m.paused) fade(m, 0, 1300, () => m.pause());
    if (on) play();
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
  /**
   * One sound per cut, shaped like its picture: the visual moves fastest around the middle of the
   * cut (expo in-out), so every whoosh peaks there and any landing hit comes just after it.
   */
  cut: {
    bloom() {
      whoosh({ dur: 1.3, from: 250, to: 5200, vol: 0.28, peak: 0.55 });
      tone(55, { to: 200, dur: 1.2, vol: 0.18, type: "sawtooth", lp: 600 });
    },
    rise() {
      whoosh({ dur: 1.1, from: 180, to: 2600, vol: 0.26, peak: 0.6 });
      tone(90, { to: 38, dur: 0.4, vol: 0.5, at: 0.62 });
    },
    shutters() {
      for (let i = 0; i < 5; i++) {
        noise({ dur: 0.05, vol: 0.22, fc: 1400, q: 1.2, at: 0.08 + i * 0.07 });
        tone(130, { to: 70, dur: 0.1, vol: 0.2, at: 0.08 + i * 0.07 });
      }
      whoosh({ dur: 0.9, from: 900, to: 3200, vol: 0.14, peak: 0.5, at: 0.45 });
    },
    push() {
      whoosh({ dur: 1, from: 2400, to: 500, vol: 0.28, peak: 0.45, q: 0.6 });
      tone(160, { to: 60, dur: 0.35, vol: 0.3, at: 0.55 });
    },
    diagonal() {
      whoosh({ dur: 0.75, from: 7000, to: 700, vol: 0.3, peak: 0.35, q: 1.4 });
      noise({ dur: 0.1, vol: 0.2, fc: 2400, q: 0.8, at: 0.45 });
    },
    doors() {
      tone(70, { to: 45, dur: 0.35, vol: 0.4, at: 0.1 });
      whoosh({ dur: 1.1, from: 700, to: 3400, vol: 0.2, peak: 0.55, at: 0.15 });
      tone(660, { to: 990, dur: 0.6, vol: 0.04, at: 0.4 });
    },
    fall() {
      whoosh({ dur: 1.2, from: 4800, to: 220, vol: 0.3, peak: 0.4, q: 0.7 });
      tone(240, { to: 40, dur: 0.9, vol: 0.2, type: "triangle", at: 0.2 });
    },
    cover() {
      whoosh({ dur: 1.1, from: 160, to: 1200, vol: 0.26, peak: 0.55, q: 0.5 });
      for (let i = 0; i < 6; i++) noise({ dur: 0.02, vol: 0.12, fc: 3000, q: 2, at: 0.3 + i * 0.07 });
      tone(80, { to: 40, dur: 0.35, vol: 0.4, at: 0.8 });
    },
    depth() {
      whoosh({ dur: 1.3, from: 400, to: 1800, vol: 0.12, peak: 0.5, q: 0.4 });
      tone(220, { to: 330, dur: 1.2, vol: 0.05 });
    },
    bands() {
      for (let i = 0; i < 4; i++) {
        noise({ dur: 0.05, vol: 0.24, fc: 1000, q: 1, at: 0.08 + i * 0.09 });
        tone(100, { to: 55, dur: 0.12, vol: 0.28, at: 0.08 + i * 0.09 });
      }
      tone(60, { to: 36, dur: 0.5, vol: 0.45, at: 0.7 });
    },
    lift() {
      whoosh({ dur: 1.2, from: 300, to: 2000, vol: 0.22, peak: 0.55 });
      tone(70, { to: 40, dur: 0.5, vol: 0.4, at: 0.8 });
    },
  },
  beat,
};
