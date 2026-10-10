import { Fragment } from "react";
import Image from "next/image";
import { about } from "@/data/site";
import { Layer } from "./art/shared";

/** About — the paragraph is split into words so the about controller can light them as you scroll. */
export default function AboutSection() {
  const words = about.text.trim().split(/\s+/);
  return (
    <section className="scene about" id="about" data-scene="about" data-label="About" data-fw="1000">
      <div className="stage" id="art-about">
        <Layer depth={0.05} bleed={1.12}>
          <Image
            className="fill"
            src="/images/gallery/campus-bench.webp"
            alt=""
            fill
            sizes="100vw"
            quality={90}
            loading="eager"
            decoding="async"
          />
        </Layer>
        <Layer depth={0.16}>
          <canvas id="leaves-about" width={1600} height={900} />
        </Layer>
      </div>
      <div className="about-shade" />
      <div className="copy copy--about">
        <p className="eyebrow rv">
          <b>{about.no}</b>
          <span>{about.eyebrow}</span>
        </p>
        <h2 className="title title--quote rv">{about.title}</h2>
        <i className="rule rv" />
        <p className="lede lede--reveal" id="about-text">
          {words.map((w, i) => (
            <Fragment key={i}>
              {i > 0 && " "}
              <span className="w">{w}</span>
            </Fragment>
          ))}
        </p>
        <p className="byline rv">{about.byline}</p>
        <a className="more rv" href="#events" data-cursor="Explore">
          <i />
          <span>{about.link}</span>
        </a>
      </div>
    </section>
  );
}
