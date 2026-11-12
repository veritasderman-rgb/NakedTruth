import type { Metadata } from 'next';
import KinkShell from '@/components/kink/Shell';
import EmailLinkForm from '@/components/EmailLinkForm';
import { getContent } from '@/lib/kink-content';
import { getExtra } from '@/lib/extra-content';
import { getLocale } from '@/lib/locale';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return { title: getExtra(await getLocale()).ui.recoverMetaTitle, robots: { index: false, follow: true } };
}

// "I lost my link": mails every private link stored for an address.
export default async function RecoverPage() {
  const locale = await getLocale();
  const c = getContent(locale);
  const t = getExtra(locale).ui;
  return (
    <KinkShell locale={locale} brand={c.ui.brand} languageLabel={c.ui.language}>
      <div className="space-y-5 py-6">
        <div className="space-y-2">
          <h1 className="text-balance text-3xl font-semibold tracking-tight">{t.recoverTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.recoverLead}</p>
        </div>
        <EmailLinkForm locale={locale} button={t.recoverButton} sentText={t.recoverDone} t={t} />
        <p className="text-[11px] text-muted-foreground">{t.recoverNote}</p>
      </div>
    </KinkShell>
  );
}
