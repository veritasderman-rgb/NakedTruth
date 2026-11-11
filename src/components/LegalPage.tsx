import Link from 'next/link';
import LangSwitch from '@/components/kink/LangSwitch';
import { fmt, localePath, type Locale } from '@/lib/i18n';
import { getLegal } from '@/lib/legal';
import { LEGAL_UPDATED, OPERATOR, OPERATOR_COMPLETE } from '@/lib/operator';

// Renders the terms or the privacy policy with the operator's details filled in.
export default function LegalPage({ locale, doc }: { locale: Locale; doc: 'terms' | 'privacy' }) {
  const legal = getLegal(locale);
  const content = legal[doc];
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(LEGAL_UPDATED));

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-6">
      <div className="mb-8 flex items-center justify-between gap-3 print:hidden">
        <Link href={localePath(locale, '/')} className="brand-pill">
          NakedTruth
        </Link>
        <LangSwitch locale={locale} label="Language" />
      </div>

      <article className="space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">{content.title}</h1>
          <p className="text-sm text-muted-foreground">{content.lead}</p>
          <p className="text-xs text-muted-foreground">{fmt(legal.updated, { date })}</p>
          {legal.fallbackNote && locale !== 'cs' && <p className="text-xs text-muted-foreground">{legal.fallbackNote}</p>}
          {!OPERATOR_COMPLETE && (
            <p className="rounded-md border border-yellow-500/40 bg-yellow-500/10 p-3 text-xs text-yellow-200">{legal.incomplete}</p>
          )}
        </header>

        {content.sections.map((section) => (
          <section key={section.h} className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight">{section.h}</h2>
            {section.p.map((p) => (
              <p key={p} className="text-sm leading-relaxed text-foreground/90">
                {fmt(p, OPERATOR)}
              </p>
            ))}
          </section>
        ))}
      </article>
    </main>
  );
}
