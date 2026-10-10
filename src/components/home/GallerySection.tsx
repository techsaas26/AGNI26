import { galleryFrames } from "@/data/gallery";
import { gallery } from "@/data/site";
import { cn } from "@/lib/utils";

/** Gallery — the memory reel: a film strip that winds sideways as you scroll. */
export default function GallerySection() {
  return (
    <section className="reel" id="gallery" data-scene="gallery" data-label="Gallery">
      <div className="reel-pin">
        <div className="reel-bg">
          <i className="beam" />
        </div>
        <div className="copy copy--reel">
          <p className="eyebrow rv">
            <b>{gallery.no}</b>
            <span>{gallery.eyebrow}</span>
          </p>
          <h2 className="title title--mid title--inline rv">
            {gallery.title} <span>{gallery.accent}</span>
          </h2>
        </div>
        <div className="reel-track" id="reel-track">
          {galleryFrames.map((frame, i) => {
            const end = !frame.image;
            return (
              <figure className={cn("frame", end && "frame--end")} data-f={i + 1} key={frame.no}>
                {end ? (
                  <div className="ph ph--end">
                    <span>
                      Some fires
                      <br />
                      never fade
                    </span>
                  </div>
                ) : (
                  <div
                    className={cn("ph", frame.logo && "ph--logo")}
                    style={{
                      backgroundImage: `url(${frame.image})`,
                      backgroundPosition: frame.position,
                      backgroundSize: frame.size,
                    }}
                  />
                )}
                <figcaption>
                  <b>{frame.no}</b>
                  {frame.caption}
                </figcaption>
              </figure>
            );
          })}
        </div>
        <p className="reel-hint">
          <i />
          {gallery.hint}
        </p>
        <div className="reel-meter">
          <i id="reel-meter" />
        </div>
      </div>
    </section>
  );
}
