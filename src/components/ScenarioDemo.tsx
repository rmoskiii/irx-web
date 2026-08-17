import { useState } from 'react';

/**
 * The signature element: an actual beat from the app, playable in the
 * page. Investors and players both get the same answer to "what is this,
 * exactly?" — a situation lands, you respond, and it tells you why.
 * Content is lifted from the two live scenarios, trimmed for the web.
 */

type Choice = { label: string; stat: string; reason: string };
type Beat = {
  id: string;
  district: string;
  accent: string;
  medium: string;
  message: string;
  choices: Choice[];
};

const BEATS: Beat[] = [
  {
    id: 'digital',
    district: 'Digital District',
    accent: '#5EE6D0',
    medium: 'Email · The Prince',
    message:
      'Your email address was identified during our beneficiary verification process. You are entitled to a payment of £4,200,000. Please confirm that this address belongs to you so I can explain the next steps.',
    choices: [
      {
        label: "Yes, that's my email. Tell me more.",
        stat: 'Street Smarts −10',
        reason: 'Confirming without question let the sender keep steering the conversation.',
      },
      {
        label: 'How did you get my details?',
        stat: 'Savvy +10',
        reason: 'You questioned how they got your details — a fair first flag.',
      },
      {
        label: "I'll verify this independently before anything else.",
        stat: 'Savvy +15 · Street Smarts +15',
        reason: 'You set your own terms before engaging any further.',
      },
    ],
  },
  {
    id: 'neighbourhood',
    district: 'Neighbourhood District',
    accent: '#FFC15E',
    medium: 'Scene · The Secret',
    message:
      '"I kissed someone. At the work conference last month. It happened once. I ended it immediately." Their hands are flat on the counter. "I can\'t lose Alex over this. Please don\'t say anything."',
    choices: [
      {
        label: "I won't say anything — but you need to tell Alex yourself, and soon.",
        stat: 'Integrity +15',
        reason: "You separated \u201cI'll keep your confidence\u201d from \u201cI'll help you hide this.\u201d",
      },
      {
        label: 'How could you do that to Alex?',
        stat: 'Street Smarts −10',
        reason: 'Leading with judgment when someone is already frightened shuts a conversation down.',
      },
      {
        label: "That's between you and Alex. I'm staying out of it.",
        stat: 'Integrity −5',
        reason: "Neutrality isn't the absence of a position. It's just not saying it.",
      },
    ],
  },
];

export default function ScenarioDemo() {
  const [beatIndex, setBeatIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const beat = BEATS[beatIndex];

  const switchBeat = (index: number) => {
    setBeatIndex(index);
    setPicked(null);
  };

  return (
    <div className="demo" style={{ ['--accent' as string]: beat.accent }}>
      <div className="demo-tabs" role="tablist" aria-label="Try a scenario">
        {BEATS.map((b, i) => (
          <button
            key={b.id}
            role="tab"
            type="button"
            aria-selected={i === beatIndex}
            className="demo-tab"
            style={{ ['--accent' as string]: b.accent }}
            onClick={() => switchBeat(i)}
          >
            {b.district.split(' ')[0]}
          </button>
        ))}
      </div>

      <p className="demo-meta">{beat.medium}</p>
      <p className="demo-message">{beat.message}</p>

      <p className="demo-prompt">How do you respond?</p>
      {beat.choices.map((choice, i) => (
        <button
          key={choice.label}
          type="button"
          className="demo-choice"
          aria-pressed={picked === i}
          onClick={() => setPicked(i)}
        >
          {choice.label}
        </button>
      ))}

      {picked !== null && (
        <div className="demo-reason">
          <p className="demo-reason-stat">{beat.choices[picked].stat}</p>
          <p className="demo-reason-text">{beat.choices[picked].reason}</p>
        </div>
      )}
      {picked === null && (
        <p className="demo-footnote">Pick one. Every score shows its reason.</p>
      )}
    </div>
  );
}
