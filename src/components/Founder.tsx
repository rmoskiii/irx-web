import Mark from './Mark';

export default function Founder() {
  return (
    <section className="section" id="founder">
      <div className="wrap">
        <p className="eyebrow">Who is building it</p>
        <div className="founder-card">
          <Mark size={56} title="IRX mark" />
          <div>
            <p className="founder-name">Richard Magnus-Oyewole</p>
            <p className="founder-role">Technical Founder &amp; Product Engineer</p>
            <p className="founder-note">
              Designing the scenarios, writing the evaluation engine and shipping the client.
              If you invest in pre-seed consumer products and want to play a full scenario,
              the fastest route is a twenty-minute call.
            </p>
          </div>
        </div>
        <a className="cta" href="mailto:rmagnus98@gmail.com?subject=IRX%20—%20pre-seed">
          Request the deck
        </a>
      </div>
    </section>
  );
}
