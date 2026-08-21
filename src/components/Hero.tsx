import ScenarioDemo from './ScenarioDemo';

export default function Hero() {
  return (
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow">Judgment, played out</p>
            <h1>
              Practise judgment<br />
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
            <a className="hero-demo-btn" href="/demo" target="_blank" rel="noopener noreferrer">
              Play the demo
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7h9M7 2.5l4.5 4.5L7 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
          <ScenarioDemo />
        </div>
      </section>
  );
}