/**
 * The IRX mark, rebuilt as inline SVG so it stays crisp at any size and
 * can inherit theme colours. Two crossing paths — one teal, one amber —
 * meeting at a single lit point: the moment a decision gets made.
 * The PNG originals live in /public for press and app-store use.
 */
type Props = { size?: number; title?: string };

export default function Mark({ size = 32, title = 'IRX' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={title}
      fill="none"
    >
      <g strokeWidth="15" strokeLinecap="round">
        <line x1="24" y1="24" x2="76" y2="76" stroke="#5EE6D0" />
        <line x1="76" y1="24" x2="24" y2="76" stroke="#FFC15E" />
      </g>
      <circle cx="50" cy="50" r="13.5" fill="#0B0B0C" />
      <circle cx="50" cy="50" r="6.5" fill="#E9E9E4" />
    </svg>
  );
}
