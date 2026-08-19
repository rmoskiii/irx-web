import ScenarioDemo from './ScenarioDemo';

export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <p className="eyebrow">Judgment, played out</p>
          <h1>
            Practice judgment<br />
            <span className="accent">before</span> it matters.
          </h1>
          <p className="hero-sub">
            IRX is an AI-powered interactive simulation for real-world decision-making.
            Scams, dilemmas, hard conversations — you play them out here first, and find
            out what your instincts actually do under pressure.
          </p>
          <div className="hero-tags">
            <span className="tag tag-live">
              <span className="tag-dot" />
              Playable MVP
            </span>
            <span className="tag tag-raise">
              <span className="tag-dot" />
              Raising pre-seed
            </span>
          </div>
        </div>
        <ScenarioDemo />
      </div>
    </section>
  );
}
