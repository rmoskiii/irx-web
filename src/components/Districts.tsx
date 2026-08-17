type District = {
  name: string;
  accent: string;
  status: string;
  live: boolean;
  blurb: string;
  scenarios: string[];
};

const DISTRICTS: District[] = [
  {
    name: 'Digital District',
    accent: '#5EE6D0',
    status: 'Playable',
    live: true,
    blurb: 'Scams, deepfakes and social engineering. Can you recognise what is really happening before it costs you something?',
    scenarios: ['The Prince', 'The Bank', 'The Job', 'The Investment', 'The Deepfake'],
  },
  {
    name: 'Neighbourhood District',
    accent: '#FFC15E',
    status: 'Playable',
    live: true,
    blurb: 'Everyday moral weight — competing loyalties, no villain in the room. Can you handle the human being in front of you?',
    scenarios: ['The Secret', 'The Favor'],
  },
  {
    name: 'Money District',
    accent: '#8A8A90',
    status: 'In design',
    live: false,
    blurb: 'Pressure, incentives and the decisions you make about money when someone else is watching the clock.',
    scenarios: [],
  },
  {
    name: 'Career District',
    accent: '#8A8A90',
    status: 'In design',
    live: false,
    blurb: 'Negotiations, credit, blame and the conversations people rehearse in the shower and then get wrong.',
    scenarios: [],
  },
];

export default function Districts() {
  return (
    <section className="section" id="districts">
      <div className="wrap">
        <p className="eyebrow">Districts</p>
        <h2>Four corners of ordinary life, each one playable.</h2>
        <p className="section-lead">
          Content is organised into districts, each with its own pace, medium and register.
          Two are built and playable today.
        </p>
        <div className="district-grid">
          {DISTRICTS.map((d) => (
            <article
              key={d.name}
              className={`district ${d.live ? 'district-live' : 'district-locked'}`}
              style={{ ['--accent' as string]: d.accent }}
            >
              <p className="district-status">{d.status}</p>
              <h3>{d.name}</h3>
              <p>{d.blurb}</p>
              {d.scenarios.length > 0 && (
                <div className="district-scenarios">
                  {d.scenarios.map((s) => (
                    <span className="chip" key={s}>{s}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
