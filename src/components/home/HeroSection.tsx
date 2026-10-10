import Image from "next/image";
import { hero, site } from "@/data/site";
import { Layer } from "./art/shared";

/**
 * The opening scene: three photographic planes (sky and campus, the maple tree, the AGNI'26 logo)
 * that drift against each other, plus falling leaves and light.
 */
export default function HeroSection() {
  return (
    <section className="scene hero" id="home" data-scene="hero" data-label="Home" data-fx="800" data-fw="1060">
      <div className="stage" id="hero-stage">
        <Layer depth={0.06} zoom={0.1}>
          <Image
            className="fill"
            src="/images/hero/hero-bg.jpeg"
            alt=""
            fill
            sizes="100vw"
            quality={90}
            preload
            loading="eager"
            decoding="async"
          />
        </Layer>
        <Layer depth={0.07} zoom={0.1} className="sun" />
        <Layer depth={0.12} zoom={0.16}>
          <canvas id="leaves-far" width={1600} height={900} />
        </Layer>
        <Layer depth={0.36} zoom={0.4} origin="42% 66%">
          <Image
            className="fill tree-fit"
            src="/images/hero/hero-tree.png"
            alt=""
            fill
            sizes="100vw"
            quality={90}
            preload
            loading="eager"
            decoding="async"
          />
        </Layer>
        <Layer depth={0.22} zoom={0.27} origin="50% 66%" className="logo-layer">
          <div className="logo-box">
            <Image
              className="fill"
              src="/images/hero/hero-logo.png"
              alt={site.name}
              fill
              sizes="100vw"
              quality={90}
              preload
              loading="eager"
              decoding="async"
            />
            <i className="logo-sheen" aria-hidden="true">
              <b />
            </i>
          </div>
        </Layer>
        <Layer depth={0.18} zoom={0.26}>
          <div className="godrays" />
        </Layer>
      </div>
      <canvas className="fxc" id="leaves-near" />
      <div className="hero-shade" />
      <div className="hero-dim" aria-hidden="true" />

      <h1 className="sr">{hero.headline}</h1>
      <div className="hero-copy" id="hero-copy">
        <p className="hc-kick">
          {hero.kicker.map((line) => (
            <span className="ln" key={line}>
              {line}
            </span>
          ))}
        </p>
        <i className="hc-rule" />
        <p className="hc-date">
          <span className="ln">{site.dates}</span>
        </p>
      </div>
      <p className="hero-tag">
        <i />
        <span>{site.tagline}</span>
      </p>
      <p className="hero-vert">
        <span>{hero.vertical}</span>
      </p>
      <a className="hero-scroll" href="#about" data-cursor="Scroll">
        <span className="mouse">
          <i />
        </span>
        <span>{hero.scroll}</span>
      </a>
      <p className="hero-college">
        <i />
        <span>{hero.college}</span>
      </p>
    </section>
  );
}
