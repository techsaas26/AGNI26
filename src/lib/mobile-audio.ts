/** One shared <audio> for the phone edition (the intro starts it, the top-bar button toggles it). */
let a: HTMLAudioElement | undefined;
export const track = () => {
  if (!a) {
    a = new Audio("/audio/agni-nostalgia.mp3");
    a.loop = true;
    a.volume = 0.6;
  }
  return a;
};
