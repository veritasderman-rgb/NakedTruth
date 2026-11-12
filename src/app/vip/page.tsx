import type { Metadata } from 'next';
import Link from 'next/link';
import KinkShell from '@/components/kink/Shell';
import { fmt, localePath } from '@/lib/i18n';
import { getContent } from '@/lib/kink-content';
import { getExtra } from '@/lib/extra-content';
import { getLocale } from '@/lib/locale';
import { rememberedVip } from '@/lib/vip';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'VIP | NakedTruth', robots: { index: false, follow: false } };

// Where a VIP link lands: says whether the code is active in this browser.
export default async function VipPage() {
  const locale = await getLocale();
  const c = getContent(locale);
  const t = getExtra(locale).ui;
  const code = await rememberedVip();
  return (
    <KinkShell locale={locale} brand={c.ui.brand} languageLabel={c.ui.language}>
      <div className="space-y-5 py-10 text-center">
        {code && <span className="brand-pill">VIP</span>}
        <h1 className="text-gradient text-balance text-3xl font-bold tracking-tight">{code ? t.vipActiveTitle : t.vipInvalidTitle}</h1>
        <p className="text-pretty text-sm text-muted-foreground">{code ? fmt(t.vipActiveLead, { code }) : t.vipInvalidLead}</p>
        <Link href={localePath(locale, '/kinkometr')} className="btn-glow inline-flex w-full items-center justify-center rounded-md px-6 py-3 text-sm font-medium">
          {c.ui.takeTest}
        </Link>
      </div>
    </KinkShell>
  );
}
