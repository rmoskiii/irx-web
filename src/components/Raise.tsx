const FACTS: { label: string; value: string }[] = [
  { label: 'Stage', value: 'Pre-seed' },
  { label: 'Product', value: 'Playable MVP, two districts live' },
  { label: 'Built with', value: 'Flutter client, Node backend' },
  { label: 'Now testing', value: 'Whether players come back tomorrow' },
];

export default function Raise() {
  return (
    <section className="section" id="raise">
      <div className="wrap">
        <p className="eyebrow">The raise</p>
        <div className="raise-grid">
          <p className="raise-statement">
            Raising pre-seed to prove that practising judgment can become a{' '}
            <em>daily consumer habit</em>.
          </p>
          <dl className="raise-facts">
            {FACTS.map((fact) => (
              <div className="raise-fact" key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
