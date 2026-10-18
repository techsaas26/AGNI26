/** One shared <audio> for the phone edition (the intro starts it, the top-bar button toggles it). */
let a: HTMLAudioElement | undefined;
export const track = () => {
  if (!a) {
    // the top bar creates this on page load just to follow it; preload "none" (set before the src)
    // keeps the 2 MB track off the network until someone actually turns the music on
    a = new Audio();
    a.preload = "none";
    a.src = "/audio/agni-nostalgia.mp3";
    a.loop = true;
    a.volume = 0.6;
  }
  return a;
};

// Going from /m to /events (or back) is a full page load, which always stops the sound. So each page notes, as it is left,
// whether the music was on and where it had got to, and the next page carries on from there.
const KEY = "agni-music";
type Saved = { on: boolean; t: number };

/** Note the music's state when this page is left. Returns the cleanup. */
export const keepMusic = () => {
  const save = () => {
    if (!a) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ on: !a.paused, t: a.currentTime } satisfies Saved));
    } catch {}
  };
  window.addEventListener("pagehide", save);
  return () => window.removeEventListener("pagehide", save);
};

/**
 * If the music was playing on the page before, play it on from the same point. Browsers may refuse sound until the visitor
 * touches this page (iPhones always do); then the first tap or key anywhere starts it. Returns the cleanup.
 */
export const resumeMusic = () => {
  let saved: Saved | null = null;
  try {
    saved = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
  } catch {}
  if (!saved?.on) return () => {};
  const t = saved.t;
  const audio = track();
  audio.preload = "auto";
  const seek = () => {
    try {
      audio.currentTime = t;
    } catch {}
  };
  if (audio.readyState >= 1) seek();
  else audio.addEventListener("loadedmetadata", seek, { once: true });

  const off = () => {
    document.removeEventListener("pointerdown", kick, true);
    document.removeEventListener("keydown", kick, true);
  };
  function kick() {
    off();
    audio.play().catch(() => {});
  }
  audio.play().catch(() => {
    document.addEventListener("pointerdown", kick, true);
    document.addEventListener("keydown", kick, true);
  });
  return off;
};
