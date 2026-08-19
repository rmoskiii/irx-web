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
        'Halloway & Finch Probate Research. Our records indicate you may be an entitled beneficiary of the late Margaret Ellen Prince (est. £312,000) through your maternal line. We work on contingency — you owe nothing unless you receive. Please do not contact the Probate Registry directly until verification is complete. Confirm this email is yours to proceed.',
    choices: [
      {
        label: "Sure — this is my email. Send the questionnaire.",
        stat: 'Savvy −10 · Street Smarts −10',
        reason: 'You confirmed your identity and invited more contact before verifying a single detail.',
      },
      {
        label: "I'll look up Halloway & Finch independently before responding.",
        stat: 'Savvy +20 · Street Smarts +15',
        reason: "You ignored the instruction telling you not to verify independently. That instruction was the tell.",
      },
      {
        label: "Why shouldn't I contact the Probate Registry directly?",
        stat: 'Savvy +20 · Street Smarts +10',
        reason: "You named the most suspicious line in the email back at the sender. A legitimate firm doesn't need you to avoid their regulator.",
      },
      {
        label: "I'm not responding to this.",
        stat: 'Street Smarts +10',
        reason: 'You protected yourself — but probate researchers are real, and this could have been one. Not a clean win.',
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
  {
    id: 'career',
    district: 'Career District',
    accent: '#B4A0FF',
    medium: 'Email · The Instruction',
    message:
        '"I need you to update the April delivery log — move the Northstar shipment to show confirmed receipt on the 14th. It\'s a formality, the client\'s already happy. Just needs to reflect that in the system."',
    choices: [
      {
        label: "Sure, I'll update it now.",
        stat: 'Street Smarts −15',
        reason: 'You complied without establishing what you were actually agreeing to. Ray noted that.',
      },
      {
        label: "Can you walk me through why the record needs to change?",
        stat: 'Savvy +15 · Street Smarts +10',
        reason: 'You made the ask legible before you answered it. That buys you both information and cover.',
      },
      {
        label: "I'm not comfortable changing a confirmed delivery date.",
        stat: 'Integrity +15 · Street Smarts −5',
        reason: "You held the line. Ray has more leverage than you, and this conversation isn't over.",
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