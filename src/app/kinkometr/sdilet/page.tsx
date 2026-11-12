import type { Metadata } from 'next';
import Link from 'next/link';
import KinkShell from '@/components/kink/Shell';
import CupGlass from '@/components/kink/CupGlass';
import Track from '@/components/Track';
import { fmt, localePath } from '@/lib/i18n';
import { CUPS } from '@/lib/kink';
import { getContent } from '@/lib/kink-content';
import { getExtra } from '@/lib/extra-content';
import { getLocale } from '@/lib/locale';
import { parseSharedCups } from '@/lib/share-cups';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ c?: string }>;

// Public landing for a shared result. It only ever receives the three cups
// the owner chose to share, so it is safe to pass around; its job is to show
// a tempting preview card and send the viewer to their own test.
export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { c: raw } = await searchParams;
  const locale = await getLocale();
  const c = getContent(locale);
  const t = getExtra(locale).ui;
  const cups = parseSharedCups(raw);
  const title = cups.length > 0 ? fmt(t.shareMetaTitle, { cups: cups.map((x) => c.cups[x.cup.key].label).join(', ') }) : c.ui.kinkMetaTitle;
  const description = fmt(t.shareMetaDesc, { n: CUPS.length });
  const image = `/api/og/kink?c=${encodeURIComponent(raw ?? '')}&l=${locale}`;
  return {
    title,
    description,
    robots: { index: false, follow: true },
    openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }], type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function KinkSharePage({ searchParams }: { searchParams: SearchParams }) {
  const { c: raw } = await searchParams;
  const locale = await getLocale();
  const c = getContent(locale);
  const t = getExtra(locale).ui;
  const cups = parseSharedCups(raw);

  return (
    <KinkShell locale={locale} brand={c.ui.brand} languageLabel={c.ui.language}>
      <Track name="kink_share_view" />
      <div className="space-y-8 py-6 text-center">
        {cups.length > 0 && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">{t.shareKicker}</p>
            <div className="flex items-end justify-center gap-4">
              {cups.map(({ cup, fill }, i) => (
                <div key={cup.key} className={`flex flex-col items-center ${i === 0 ? 'order-2' : i === 1 ? 'order-1' : 'order-3'}`}>
                  <CupGlass id={`sh-${cup.key}`} fill={fill} color={cup.color} size={i === 0 ? 124 : 92} />
                  <p className="mt-1 max-w-[7rem] text-xs font-semibold leading-tight" style={{ color: cup.color }}>
                    {c.cups[cup.key].label}
                  </p>
                  <p className="text-[11px] tabular-nums text-muted-foreground">{fill} %</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-3">
          <h1 className="text-gradient text-balance text-3xl font-bold tracking-tight">{t.shareHeading}</h1>
          <p className="text-pretty text-sm text-muted-foreground">{fmt(t.shareLead, { n: CUPS.length })}</p>
          <Link href={localePath(locale, '/kinkometr')} className="btn-glow inline-flex w-full items-center justify-center rounded-md px-6 py-3 text-sm font-medium">
            {t.shareCta}
          </Link>
        </div>
      </div>
    </KinkShell>
  );
}
