import { merch } from "@/data/site";
import MerchViewer from "./MerchViewer";

/** Merchandise — the tee, in 3D. */
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
      <MerchViewer model="/models/tee-opt.glb" front="/images/merch-front.webp" back="/images/merch-back.webp" />
      <div className="copy copy--left">
        <h2 className="title title--mid rv">
          {merch.title} <span>{merch.accent}</span>
        </h2>
        <i className="rule rv" />
        <ul className="perks">
          <li className="rv">
            <p>{merch.text}</p>
          </li>
        </ul>
      </div>
      <p className="hint hint--right rv">
        <i />
        {merch.hint}
      </p>
    </section>
  );
}
