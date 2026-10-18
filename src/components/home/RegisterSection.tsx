import { register, site } from "@/data/site";
import { RegisterArt } from "./art/MiscArt";

/** Register — a tilting "Admit One" ticket and the call to action. */
export default function RegisterSection() {
  const t = register.ticket;
  return (
    <section className="scene reg" id="register" data-scene="register" data-label="Register">
      <div className="stage" id="art-register">
        <RegisterArt />
      </div>
      <canvas className="fxc" data-particles="dust" />
      {/* the marquee frames the screen, so it is laid out by the engine for the scene's size (lib/art `registerFrame`) */}
      <canvas className="fxc" data-lights="register-bulbs" aria-hidden="true" />
      <div className="reg-wrap">
        <div className="copy copy--center">
          <h2 className="title rv">
            {register.title} <span>{register.accent}</span>
          </h2>
          <p className="lede rv">{register.lede}</p>
        </div>
        <div className="ticket-scene rv">
          <div className="ticket" id="ticket" data-cursor="Tilt">
            <div className="tk-main">
              <p className="tk-top">
                <span>{t.top}</span>
                <span>{t.number}</span>
              </p>
              <h3 className="tk-title">
                AGNI<i>’</i>26
              </h3>
              <p className="tk-sub">{t.subtitle}</p>
              <div className="tk-meta">
                <p>
                  <small>Date</small>
                  <b>{site.datesShort}</b>
                </p>
                <p>
                  <small>Venue</small>
                  <b>{t.venue}</b>
                </p>
                <p>
                  <small>Show</small>
                  <b>{t.show}</b>
                </p>
              </div>
              <i className="tk-bar" />
            </div>
            <div className="tk-stub">
              <span className="tk-vert">{t.stub}</span>
              <b className="tk-no">{t.stubNo}</b>
              <i className="tk-bar tk-bar--s" />
            </div>
            <i className="tk-shine" />
          </div>
        </div>
        <div className="copy copy--center">
          <a className="btn rv" href={register.url} target="_blank" rel="noopener" data-cursor="Book">
            <span>{register.button}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
