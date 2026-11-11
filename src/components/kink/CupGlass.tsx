// A goblet that fills with glowing liquid. Pure SVG (SMIL animation), so it
// renders on the server and needs no client JS.

const BOWL = 'M14 8 H86 C86 52 70 78 50 80 C30 78 14 52 14 8 Z';
const TOP = 8;
const BOTTOM = 80;

export default function CupGlass({
  id,
  fill,
  color,
  unexplored = false,
  size = 96,
}: {
  // Unique per page — used for the clip-path / gradient ids.
  id: string;
  fill: number;
  color: string;
  unexplored?: boolean;
  size?: number;
}) {
  const pct = Math.max(0, Math.min(100, fill));
  const level = BOTTOM - ((BOTTOM - TOP) * pct) / 100;
  const overflowing = pct >= 85 && !unexplored;

  return (
    <svg
      viewBox="0 0 100 132"
      width={size}
      height={(size * 132) / 100}
      role="img"
      aria-label={unexplored ? `Neprozkoumaný pohár, ${pct} %` : `Pohár plný z ${pct} %`}
      style={{ filter: pct > 0 ? `drop-shadow(0 0 ${unexplored ? 4 : 9}px ${color}${unexplored ? '55' : '99'})` : undefined }}
    >
      <defs>
        <clipPath id={`bowl-${id}`}>
          <path d={BOWL} />
        </clipPath>
        <linearGradient id={`liq-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={unexplored ? 0.45 : 0.95} />
          <stop offset="1" stopColor={color} stopOpacity={unexplored ? 0.2 : 0.55} />
        </linearGradient>
      </defs>

      {/* liquid */}
      <g clipPath={`url(#bowl-${id})`}>
        <rect x="0" width="100" height="90" y={level} fill={`url(#liq-${id})`}>
          <animate attributeName="y" from={BOTTOM} to={level} dur="1.1s" fill="freeze" calcMode="spline" keySplines="0.16 1 0.3 1" keyTimes="0;1" />
        </rect>
        {pct > 0 && (
          <ellipse cx="50" cy={level} rx="40" ry="2.6" fill="#fff" opacity={unexplored ? 0.25 : 0.5}>
            <animate attributeName="cy" from={BOTTOM} to={level} dur="1.1s" fill="freeze" calcMode="spline" keySplines="0.16 1 0.3 1" keyTimes="0;1" />
          </ellipse>
        )}
      </g>

      {/* drops spilling over the rim */}
      {overflowing && (
        <g fill={color}>
          <circle cx="11" cy="20" r="2.4">
            <animate attributeName="cy" values="12;44" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="89" cy="26" r="2">
            <animate attributeName="cy" values="12;40" dur="1.9s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="1.9s" begin="0.5s" repeatCount="indefinite" />
          </circle>
        </g>
      )}

      {/* glass */}
      <path
        d={BOWL}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeDasharray={unexplored ? '5 4' : undefined}
        opacity={pct > 0 ? 1 : 0.45}
      />
      <path d="M50 80 V114" stroke={color} strokeWidth="3" strokeLinecap="round" opacity={pct > 0 ? 0.9 : 0.4} />
      <path d="M30 120 Q50 110 70 120" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity={pct > 0 ? 0.9 : 0.4} />

      {unexplored && (
        <text x="50" y="46" textAnchor="middle" fontSize="26" fontWeight="700" fill="#fff" opacity="0.85">?</text>
      )}
    </svg>
  );
}
