import { ImageResponse } from 'next/og';
import { DEFAULT_LOCALE, fmt, isLocale } from '@/lib/i18n';
import { getQuiz } from '@/lib/quiz-content';

export const runtime = 'edge';

// Shareable result image (1200×630). The default font has no Czech diacritics,
// so the Czech og* strings are written without them; the full copy lives on the
// HTML share page. Values come from query params so the route stays stateless
// and cacheable: ?p=<percent>&m=<matchCount>&t=<total>&l=<locale>.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const percent = clampInt(searchParams.get('p'), 0, 100, 0);
  const match = clampInt(searchParams.get('m'), 0, 9999, 0);
  const total = clampInt(searchParams.get('t'), 0, 9999, 0);
  const l = searchParams.get('l');
  const q = getQuiz(isLocale(l) ? l : DEFAULT_LOCALE);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(135deg, #ff3d8e 0%, #b05cff 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          padding: '64px',
        }}
      >
        <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, letterSpacing: 8, opacity: 0.92 }}>
          NAKEDTRUTH
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 24 }}>
          <span style={{ fontSize: 240, fontWeight: 800, lineHeight: 1 }}>{percent}</span>
          <span style={{ fontSize: 96, fontWeight: 800, marginLeft: 8 }}>%</span>
        </div>

        <div style={{ display: 'flex', fontSize: 44, fontWeight: 600, marginTop: 8, opacity: 0.95 }}>
          {total > 0 ? fmt(q.ogMatch, { m: match, t: total }) : q.ogOurs}
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 48,
            fontSize: 32,
            fontWeight: 700,
            background: 'rgba(255,255,255,0.18)',
            borderRadius: 999,
            padding: '16px 36px',
          }}
        >
          {q.ogCta} &#8594;
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

function clampInt(raw: string | null, min: number, max: number, fallback: number): number {
  const n = Number.parseInt(raw ?? '', 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
