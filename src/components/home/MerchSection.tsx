import { merch, site } from "@/data/site";
import { MerchArt } from "./art/MiscArt";

/** Merchandise — the tee hangs on the right and flips on click. */
export default function MerchSection() {
  return (
    <section
      className="scene merch"
      id="merch"
      data-scene="merch"
      data-label="Merchandise"
      data-fx="1180"
      data-fw="760"
    >
      <div className="stage" id="art-merch">
        <MerchArt />
      </div>
      <div className="copy copy--left">
        <p className="eyebrow rv">
          <b>{merch.no}</b>
          <span>{merch.eyebrow}</span>
        </p>
        <h2 className="title title--mid rv">
          {merch.title} <span>{merch.accent}</span>
        </h2>
        <i className="rule rv" />
        <ul className="perks">
          {merch.perks.map((perk) => (
            <li className="rv" key={perk.title}>
              <h3>
                <i>★</i> {perk.title}
              </h3>
              <p>{perk.text}</p>
            </li>
          ))}
        </ul>
        <a className="btn rv" href={site.merchUrl} target="_blank" rel="noopener" data-cursor="Shop">
          <span>{merch.button}</span>
        </a>
      </div>
      <p className="hint hint--right rv">
        <i />
        {merch.hint}
      </p>
    </section>
  );
}
