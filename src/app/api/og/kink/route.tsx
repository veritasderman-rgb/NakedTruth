import { ImageResponse } from 'next/og';
import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n';
import { getContent } from '@/lib/kink-content';
import { getExtra } from '@/lib/extra-content';
import { parseSharedCups } from '@/lib/share-cups';

export const runtime = 'edge';

// Inter Bold (SIL Open Font License, see FONT-LICENSE.txt). The Latin
// Extended file adds the Czech letters the default image font lacks.
const fonts = Promise.all(
  [new URL('./inter-latin-700-normal.woff', import.meta.url), new URL('./inter-latin-ext-700-normal.woff', import.meta.url)].map((url) =>
    fetch(url).then((res) => res.arrayBuffer())
  )
);

// Share image for a Kinkometr result (1200×630): up to three cups, taken from
// the query string — ?c=bondage.80,oral.75&l=cs. Stateless and cacheable.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const l = searchParams.get('l');
  const locale = isLocale(l) ? l : DEFAULT_LOCALE;
  const c = getContent(locale);
  const t = getExtra(locale).ui;
  const cups = parseSharedCups(searchParams.get('c'));
  const [latin, latinExt] = await fonts;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundImage: 'linear-gradient(135deg, #1a0b2e 0%, #2b0f3f 55%, #4a1040 100%)',
          color: '#ffffff',
          fontFamily: 'Inter',
          padding: '48px 64px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontSize: 26, letterSpacing: 8, color: '#ff7ab8' }}>NAKEDTRUTH · KINKOMETR</div>
          <div style={{ display: 'flex', fontSize: 56, marginTop: 10 }}>{t.ogTitle}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          {cups.map(({ cup, fill }) => (
            <div key={cup.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 330 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  width: 150,
                  height: 210,
                  border: `6px solid ${cup.color}`,
                  borderTopWidth: 0,
                  borderRadius: '0 0 46px 46px',
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ display: 'flex', width: '100%', height: `${Math.max(6, fill)}%`, background: cup.color }} />
              </div>
              <div style={{ display: 'flex', fontSize: 34, marginTop: 14, color: cup.color, textAlign: 'center' }}>{c.cups[cup.key].label}</div>
              <div style={{ display: 'flex', fontSize: 26, opacity: 0.75 }}>{fill} %</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', fontSize: 32, background: 'linear-gradient(90deg, #ff3d8e, #b05cff)', borderRadius: 999, padding: '14px 40px' }}>
          {t.ogCta} →
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: latin, weight: 700, style: 'normal' },
        { name: 'Inter', data: latinExt, weight: 700, style: 'normal' },
      ],
    }
  );
}
