import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Shareable result image (1200×630). Rendered text is kept diacritic-free so it
// renders reliably with the default font; the full Czech copy lives on the HTML
// share page. Values come from query params so the route stays stateless and
// cacheable: ?p=<percent>&m=<matchCount>&t=<total>.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const percent = clampInt(searchParams.get('p'), 0, 100, 0);
  const match = clampInt(searchParams.get('m'), 0, 9999, 0);
  const total = clampInt(searchParams.get('t'), 0, 9999, 0);

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
          backgroundImage: 'linear-gradient(135deg, #F55229 0%, #E11D48 100%)',
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
          {total > 0 ? `Shoda ${match} z ${total}` : 'Nase shoda'}
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
          Zkus to taky &#8594;
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
