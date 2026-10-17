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
