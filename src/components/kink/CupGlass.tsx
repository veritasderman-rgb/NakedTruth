// A goblet that fills with glowing liquid. Pure SVG (SMIL animation), so it
// renders on the server and needs no client JS.

const BOWL = 'M14 8 H86 C86 52 70 78 50 80 C30 78 14 52 14 8 Z';
const TOP = 8;
const BOTTOM = 80;
// Two periods of a wave, 200 wide, so sliding it by 100 loops seamlessly.
const WAVE = 'M-100 0 Q-75 -5 -50 0 T0 0 T50 0 T100 0 T150 0 T200 0 V90 H-100 Z';

export default function CupGlass({
  id,
  fill,
  color,
  unexplored = false,
  size = 96,
  label,
}: {
  // Unique per page — used for the clip-path / gradient ids.
  id: string;
  fill: number;
  color: string;
  unexplored?: boolean;
  size?: number;
  // Accessible name, e.g. "Bondage: 75 %". Decorative when omitted.
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, fill));
  const level = BOTTOM - ((BOTTOM - TOP) * pct) / 100;
  const overflowing = pct >= 85 && !unexplored;
  const lit = pct > 0;
  const rise = { dur: '1.2s', fill: 'freeze' as const, calcMode: 'spline' as const, keySplines: '0.16 1 0.3 1', keyTimes: '0;1' };

  return (
    <svg
      viewBox="0 0 100 132"
      width={size}
      height={(size * 132) / 100}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ filter: lit ? `drop-shadow(0 0 ${unexplored ? 4 : 10}px ${color}${unexplored ? '55' : 'aa'})` : undefined, overflow: 'visible' }}
    >
      <defs>
        <clipPath id={`bowl-${id}`}>
          <path d={BOWL} />
        </clipPath>
        <linearGradient id={`liq-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={unexplored ? 0.5 : 1} />
          <stop offset="1" stopColor={color} stopOpacity={unexplored ? 0.18 : 0.45} />
        </linearGradient>
        <linearGradient id={`glass-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.02" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {/* glass body */}
      <path d={BOWL} fill={`url(#glass-${id})`} />

      {/* liquid with a gently moving surface */}
      {lit && (
        <g clipPath={`url(#bowl-${id})`}>
          <g transform={`translate(0 ${level})`}>
            <animateTransform attributeName="transform" type="translate" from={`0 ${BOTTOM}`} to={`0 ${level}`} {...rise} />
            <path d={WAVE} fill={`url(#liq-${id})`}>
              <animateTransform attributeName="transform" type="translate" from="0 0" to="100 0" dur="5s" repeatCount="indefinite" />
            </path>
            <path d={WAVE} fill={color} opacity="0.28" transform="translate(-30 2)">
              <animateTransform attributeName="transform" type="translate" from="-30 2" to="-130 2" dur="7s" repeatCount="indefinite" />
            </path>
          </g>
          {/* bubbles */}
          {!unexplored && pct >= 30 && (
            <g fill="#fff">
              {[38, 55, 64].map((x, i) => (
                <circle key={x} cx={x} cy={BOTTOM - 6} r={1 + (i % 2) * 0.5} opacity="0">
                  <animate attributeName="cy" from={BOTTOM - 6} to={level + 4} dur={`${2.6 + i * 0.9}s`} begin={`${1 + i * 0.7}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;0.7;0" dur={`${2.6 + i * 0.9}s`} begin={`${1 + i * 0.7}s`} repeatCount="indefinite" />
                </circle>
              ))}
            </g>
          )}
        </g>
      )}

      {/* drops spilling over the rim */}
      {overflowing && (
        <g fill={color}>
          <circle cx="11" cy="20" r="2.4">
            <animate attributeName="cy" values="12;46" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="89" cy="26" r="2">
            <animate attributeName="cy" values="12;42" dur="1.9s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="1.9s" begin="0.5s" repeatCount="indefinite" />
          </circle>
        </g>
      )}

      {/* outline, highlight, stem and foot */}
      <path
        d={BOWL}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeDasharray={unexplored ? '5 4' : undefined}
        opacity={lit ? 1 : 0.4}
      />
      <path d="M22 15 C22 38 28 55 38 66" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity={lit ? 0.35 : 0.15} />
      <path d="M50 80 V112" stroke={color} strokeWidth="3" strokeLinecap="round" opacity={lit ? 0.9 : 0.35} />
      <path d="M30 122 Q50 108 70 122 Z" fill={color} fillOpacity={lit ? 0.25 : 0.08} stroke={color} strokeWidth="2.5" strokeLinejoin="round" opacity={lit ? 0.9 : 0.35} />

      {unexplored && (
        <text x="50" y="46" textAnchor="middle" fontSize="26" fontWeight="700" fill="#fff" opacity="0.9">?</text>
      )}
    </svg>
  );
}
