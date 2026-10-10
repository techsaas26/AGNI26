/** Film grain, vignette, the camera-flash overlay and the custom cursor (driven by the engine). */
export default function FilmLayer() {
  return (
    <>
      <div className="fx-grain" aria-hidden="true" />
      <div className="fx-vignette" aria-hidden="true" />
      <div className="fx-flash" id="flash" aria-hidden="true" />
      <div className="cursor" id="cursor" aria-hidden="true">
        <i className="c-dot" />
        <i className="c-ring">
          <b />
        </i>
      </div>
    </>
  );
}
