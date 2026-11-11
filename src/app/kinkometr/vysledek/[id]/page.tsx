import type { Metadata } from 'next';
import Link from 'next/link';
import KinkShell from '@/components/kink/Shell';
import CupGlass from '@/components/kink/CupGlass';
import CopyLink from '@/components/kink/CopyLink';
import { getInvitedProfiles, getKinkProfile } from '@/lib/kink-store';
import {
  COMMUNITY_TIPS,
  DATING_SAFETY_NOTE,
  MODES,
  PLACES_LEGAL_NOTE,
  SAFETY_RULES,
  fillLabel,
  fullCupCount,
  isUnexplored,
  rankedCups,
  recommend,
} from '@/lib/kink';

export const dynamic = 'force-dynamic';

// Private result — reachable only via its link, never indexed.
export const metadata: Metadata = {
  title: 'Moje poháry | NakedTruth Kinkometr',
  robots: { index: false, follow: false },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function TipList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <ul className="mt-1.5 space-y-1.5 text-sm">
        {items.map((t) => (
          <li key={t} className="flex gap-2">
            <span aria-hidden className="text-muted-foreground">·</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function KinkResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getKinkProfile(id).catch(() => null);

  if (!profile) {
    return (
      <KinkShell>
        <div className="space-y-4 py-16 text-center">
          <h1 className="text-xl font-bold">Výsledek nenalezen</h1>
          <p className="text-sm text-muted-foreground">Odkaz je neúplný nebo výsledek už neexistuje.</p>
          <Link href="/kinkometr" className="inline-flex rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">
            Udělat si Kinkometr
          </Link>
        </div>
      </KinkShell>
    );
  }

  const invited = await getInvitedProfiles(profile.id).catch(() => []);
  const ranked = rankedCups(profile.cups);
  const { full, total } = fullCupCount(profile.cups);
  const rec = recommend(profile.cups);
  const persona = rec.top[0]?.cup.persona;
  const unexploredCount = ranked.filter((r) => isUnexplored(r.result)).length;
  const showSafety = [...rec.top, ...rec.explore].some((t) => t.cup.bdsm);

  return (
    <KinkShell>
      <div className="space-y-10">
        <header className="space-y-2">
          <p className="text-xs text-muted-foreground">{MODES[profile.mode].label}</p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight">
            {full === 0 ? 'Žádný pohár zatím nepřetéká' : `${full} z ${total} pohárů máš plných`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {persona && <>Tvůj nejplnější pohár z tebe dělá typ <strong className="text-foreground">{persona}</strong>. </>}
            {unexploredCount > 0 &&
              `${unexploredCount} ${unexploredCount === 1 ? 'pohár je neprozkoumaný' : unexploredCount < 5 ? 'poháry jsou neprozkoumané' : 'pohárů je neprozkoumaných'} — a to je v pořádku.`}
          </p>
        </header>

        {/* The cups */}
        <div className="grid grid-cols-3 gap-x-2 gap-y-6">
          {ranked.map(({ cup, result }) => {
            const unexplored = isUnexplored(result);
            return (
              <div key={cup.key} className="flex flex-col items-center text-center">
                <CupGlass id={cup.key} fill={result.fill} color={cup.color} unexplored={unexplored} size={84} />
                <p className="mt-1 text-xs font-semibold leading-tight">{cup.label}</p>
                <p className="text-[11px] tabular-nums" style={{ color: cup.color }}>
                  {result.fill} % · {fillLabel(result)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Partner comparison */}
        <section className="space-y-3 rounded-xl border border-primary/30 bg-primary/10 p-4">
          <h2 className="text-base font-semibold">Porovnej poháry s partnerem</h2>
          {profile.partnerOf && (
            <Link
              href={`/kinkometr/porovnani/${profile.id}/${profile.partnerOf}`}
              className="block rounded-md bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground"
            >
              Zobrazit porovnání s tím, kdo tě pozval
            </Link>
          )}
          {invited.map((p, i) => (
            <Link
              key={p.id}
              href={`/kinkometr/porovnani/${profile.id}/${p.id}`}
              className="block rounded-md bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground"
            >
              Partner/ka má hotovo — zobrazit porovnání{invited.length > 1 ? ` (${i + 1})` : ''}
            </Link>
          ))}
          <p className="text-xs text-muted-foreground">
            Pošli odkaz. Partner/ka odpoví na stejné otázky a oba uvidíte, které poháry máte společné,
            kde se doplňujete a o čem si promluvit. Uvidí tvoje poháry, ne jednotlivé odpovědi.
          </p>
          <CopyLink
            path={`/kinkometr?partner=${profile.id}`}
            label={invited.length > 0 ? 'Zkopírovat pozvánku znovu' : 'Zkopírovat pozvánku pro partnera'}
          />
        </section>

        {/* Recommendations for the fullest cups */}
        {rec.top.length > 0 && (
          <Section title="Co by se ti mohlo líbit">
            <div className="space-y-3">
              {rec.top.map(({ cup, result, tips }, i) => (
                <details key={cup.key} open={i === 0} className="group rounded-xl border bg-card/60 p-4" style={{ borderColor: `${cup.color}55` }}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                    <span>
                      <span className="text-sm font-semibold" style={{ color: cup.color }}>{cup.label}</span>
                      <span className="ml-2 text-[11px] text-muted-foreground">{result.fill} %</span>
                      <span className="block text-[11px] text-muted-foreground">{cup.desc}</span>
                    </span>
                    <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-90">›</span>
                  </summary>
                  <div className="mt-4 space-y-4">
                    <TipList label="Aktivity" items={tips.activities} />
                    <TipList label="Polohy" items={tips.positions} />
                    <TipList label="Kde" items={tips.places} />
                  </div>
                </details>
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">{PLACES_LEGAL_NOTE}</p>
          </Section>
        )}

        {rec.related.length > 0 && (
          <Section title="Když se ti líbí tohle, zkus i…">
            <ul className="space-y-2">
              {rec.related.map(({ from, to }) => (
                <li key={`${from.key}-${to.key}`} className="rounded-xl border bg-card/60 p-3 text-sm">
                  <span style={{ color: from.color }}>{from.label}</span>
                  <span className="text-muted-foreground"> → </span>
                  <strong style={{ color: to.color }}>{to.label}</strong>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{to.desc}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {rec.explore.length > 0 && (
          <Section title="Neprozkoumané poháry: jak to zjistit">
            <p className="text-xs text-muted-foreground">
              U těchhle oblastí sis nebyl/a jistý/á. Nemusíš se rozhodovat hned — tady je vždy jeden malý,
              bezpečný krok, který ti napoví.
            </p>
            <ul className="space-y-2">
              {rec.explore.map(({ cup, tips }) => (
                <li key={cup.key} className="rounded-xl border border-dashed p-3 text-sm" style={{ borderColor: `${cup.color}77` }}>
                  <strong style={{ color: cup.color }}>{cup.label}</strong>
                  <span className="mt-1 block text-[13px]">{tips.firstStep}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {rec.dating.length > 0 && (
          <Section title="Kde potkat podobně naladěné">
            <ul className="space-y-2">
              {rec.dating.map((d) => (
                <li key={d.name} className="rounded-xl border bg-card/60 p-3">
                  <p className="text-sm font-semibold">{d.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{d.desc}</p>
                </li>
              ))}
            </ul>
            <TipList label="Naživo" items={COMMUNITY_TIPS} />
            <p className="text-[11px] leading-relaxed text-muted-foreground">{DATING_SAFETY_NOTE}</p>
          </Section>
        )}

        {showSafety && (
          <Section title="Než něco zkusíte">
            <dl className="space-y-2 text-sm">
              {SAFETY_RULES.map((r) => (
                <div key={r.title} className="rounded-xl border bg-card/60 p-3">
                  <dt className="font-semibold">{r.title}</dt>
                  <dd className="mt-0.5 text-xs text-muted-foreground">{r.text}</dd>
                </div>
              ))}
            </dl>
          </Section>
        )}

        <footer className="space-y-3 border-t pt-6 text-center">
          <p className="text-[11px] text-muted-foreground">
            Výsledek je anonymní a dostupný jen přes tento odkaz — ulož si ho, pokud se k němu chceš vrátit.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/#parovy-kviz" className="rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-accent">
              Zkusit párový kvíz naslepo
            </Link>
            <Link href="/kinkometr" className="text-xs text-muted-foreground underline">
              Udělat test znovu
            </Link>
          </div>
        </footer>
      </div>
    </KinkShell>
  );
}
