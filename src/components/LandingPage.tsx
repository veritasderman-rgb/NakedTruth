import type { Metadata } from 'next';
import Link from 'next/link';
import KinkShell from '@/components/kink/Shell';
import Track from '@/components/Track';
import { appUrl } from '@/lib/app-url';
import { DEFAULT_LOCALE, LOCALES, localePath } from '@/lib/i18n';
import { cupsFor, type KinkMode } from '@/lib/kink';
import { getContent } from '@/lib/kink-content';
import { getExtra, type LandingKey } from '@/lib/extra-content';
import { getLocale } from '@/lib/locale';

// Search landing pages. Each one answers a query people actually type and
// leads straight into the matching variant of the test.
export const LANDINGS: Record<LandingKey, { path: string; mode: KinkMode }> = {
  bdsm: { path: '/bdsm-test', mode: 'bdsm' },
  kink: { path: '/kink-test', mode: 'full' },
  domsub: { path: '/dom-sub-test', mode: 'bdsm' },
};

export async function landingMetadata(key: LandingKey): Promise<Metadata> {
  const locale = await getLocale();
  const page = getExtra(locale).landing[key];
  const { path } = LANDINGS[key];
  return {
    title: page.metaTitle,
    description: page.metaDesc,
    alternates: {
      canonical: localePath(locale, path),
      languages: { ...Object.fromEntries(LOCALES.map((l) => [l, localePath(l, path)])), 'x-default': localePath(DEFAULT_LOCALE, path) },
    },
    openGraph: { title: page.metaTitle, description: page.metaDesc, type: 'website', url: `${appUrl()}${localePath(locale, path)}` },
  };
}

export default async function LandingPage({ which }: { which: LandingKey }) {
  const locale = await getLocale();
  const c = getContent(locale);
  const x = getExtra(locale);
  const page = x.landing[which];
  const { mode } = LANDINGS[which];
  const start = localePath(locale, mode === 'full' ? '/kinkometr' : `/kinkometr?mode=${mode}`);
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  const Cta = () => (
    <Link href={start} className="btn-glow block rounded-xl px-6 py-3.5 text-center text-sm font-semibold">
      {page.cta}
    </Link>
  );

  return (
    <KinkShell locale={locale} brand={c.ui.brand} languageLabel={c.ui.language}>
      <Track name="landing_view" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, '\\u003c') }} />
      <article className="space-y-9">
        <header className="space-y-4">
          <h1 className="text-gradient text-balance text-4xl font-bold tracking-tight">{page.h1}</h1>
          <p className="text-pretty text-sm text-muted-foreground">{page.lead}</p>
          <Cta />
          <ul className="space-y-1.5 text-sm">
            {page.points.map((point) => (
              <li key={point} className="flex gap-2">
                <span aria-hidden className="text-primary">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </header>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">{x.ui.landingMeasures}</h2>
          <div className="flex flex-wrap gap-1.5">
            {cupsFor(mode).map((cup) => (
              <span key={cup.key} className="rounded-full border px-2.5 py-1 text-xs" style={{ borderColor: `${cup.color}88`, color: cup.color }}>
                {c.cups[cup.key].label}
              </span>
            ))}
          </div>
        </section>

        {page.sections.map((s) => (
          <section key={s.h} className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight">{s.h}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{s.p}</p>
          </section>
        ))}

        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">{x.ui.landingFaqTitle}</h2>
          {page.faq.map((f) => (
            <div key={f.q} className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold">{f.q}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </section>

        <Cta />

        <nav className="space-y-2 border-t border-white/10 pt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{x.ui.landingOther}</h2>
          <ul className="space-y-1 text-sm">
            {(Object.keys(LANDINGS) as LandingKey[]).filter((k) => k !== which).map((k) => (
              <li key={k}>
                <Link href={localePath(locale, LANDINGS[k].path)} className="underline">{x.landing[k].h1}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </article>
    </KinkShell>
  );
}
