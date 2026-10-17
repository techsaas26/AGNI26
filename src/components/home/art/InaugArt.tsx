import SceneVideo from "../SceneVideo";
import { Layer } from "./shared";

/**
 * Inauguration: the lamp is lit on the temple stage while the chenda drummers play, at half speed
 * and on a loop. It is a silent clip rather than a GIF — same look, about a tenth of the weight.
 */
export default function InaugArt() {
  return (
    <Layer depth={0.05} bleed={1.04} origin="50% 100%">
      <SceneVideo src="/video/inauguration.mp4" poster="/images/inaug/lamp-poster.webp" />
    </Layer>
  );
}
