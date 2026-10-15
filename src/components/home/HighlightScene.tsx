import type { ReactNode } from "react";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";
import type { Highlight } from "@/types";

type ParticleKind = "embers" | "dust" | "sparks";

interface Props {
  item: Highlight;
  /** 1-based position among the five scenes, shown as "n / 5". */
  index: number;
  total: number;
  /** The illustrated stage (parallax planes). */
  art: ReactNode;
  /** Particle canvases layered over the art. */
  particles?: ParticleKind[];
  /** Extra overlay rendered between the stage and the particles. */
  beforeParticles?: ReactNode;
  /** Extra overlay rendered between the particles and the copy. */
  afterParticles?: ReactNode;
}

/** One "Why AGNI" scene: an illustrated stage, a title card and a one-line hint. */
export default function HighlightScene({ item, index, total, art, particles = [], beforeParticles, afterParticles }: Props) {
  const { id, anchor, label } = item;
  return (
    <section
      className={cn("scene ev", `ev--${id}`)}
      id={anchor}
      data-scene={id}
      data-label={label}
      data-fx={item.fx}
      data-fw={item.fw}
    >
      <div className="stage" id={`art-${id}`}>
        {art}
      </div>
      {beforeParticles}
      {particles.map((kind) => (
        <canvas key={kind} className="fxc" data-particles={kind} />
      ))}
      {afterParticles}
      <div className={`copy copy--${item.side}`}>
        <h2 className={cn("title rv", item.titleClass)}>
          {item.title} <span>{item.accent}</span>
        </h2>
        <i className="rule rv" />
        <p className="lede rv">{item.description}</p>
        <p className="tagline rv">{item.tagline}</p>
        <a className="more rv" href={site.eventsUrl} target="_blank" rel="noopener" data-cursor="Open">
          <i />
          <span>Learn more</span>
        </a>
      </div>
      <p className={cn("hint rv", item.hintSide && "hint--left")} id={item.hintId}>
        <i />
        {item.hint}
      </p>
    </section>
  );
}
