const STEPS = [
  {
    n: 'Step one',
    title: 'A situation lands',
    body: 'An email, a text, a phone call, a friend who waits for the room to empty. It arrives in the medium it would really arrive in.',
  },
  {
    n: 'Step two',
    title: 'You answer, and it answers back',
    body: 'Three or four exchanges, not one click. Every response changes what the other person does next — there is no single right path through.',
  },
  {
    n: 'Step three',
    title: 'You find out why',
    body: 'Savvy, Street Smarts and Integrity, each movement explained in a plain sentence. Nothing is scored behind a curtain.',
  },
];

export default function Loop() {
  return (
    <section className="section">
      <div className="wrap">
        <p className="eyebrow">How a round works</p>
        <h2>Judgment is a skill. Skills need reps.</h2>
        <p className="section-lead">
          Most people meet a scam, a conflict of loyalty, or a pressured negotiation for the
          first time when it is already happening. IRX gives you the reps first.
        </p>
        <div className="loop-steps">
          {STEPS.map((step) => (
            <div className="loop-step" key={step.title}>
              <p className="loop-num">{step.n}</p>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
