/**
 * Movie Night: an open-air cinema at night, and on its screen six star silhouettes, projected like a nineties reel:
 * the frame jitters, the light flutters, there is grain and a cue mark (all driven by lib/ambient.ts). Nothing here
 * moves with the pointer or the scroll.
 */
export default function MovieArt() {
  return (
    <div className="layer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="fill" src="/images/movie/open-air.webp" alt="" />
      {/* the screen in the photograph, a pixel loose: x 441–1237, y 303–652 of 1672×941 */}
      <div className="mv-screen">
        <div className="mv-film">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/movie/movie-night-stars.webp" alt="" />
        </div>
        <i className="mv-glow flicker" />
        <i className="mv-lit" />
        <i className="mv-flick" />
        <i className="fx-grain" />
        <i className="mv-cue" />
      </div>
    </div>
  );
}
