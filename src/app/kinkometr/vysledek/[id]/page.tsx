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
  depthLabel,
  fillLabel,
  fullCupCount,
  groupSummaries,
  isUnexplored,
  recommend,
  sideLabel,
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
  if (items.length === 0) return null;
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
  const inviter = profile.partnerOf ? await getKinkProfile(profile.partnerOf).catch(() => null) : null;
  const groups = groupSummaries(profile.cups);
  const { full, unexplored: unexploredCount, total } = fullCupCount(profile.cups);
  const rec = recommend(profile.cups);
  const persona = rec.top[0]?.cup.persona;
  const topGroup = [...groups].sort((a, b) => b.avg - a.avg)[0];
  const showSafety = [...rec.top, ...rec.explore].some((t) => t.cup.bdsm);
  const { single, lowDesire } = profile.context;

  // The headline never reads as a score out of N — an empty cup is not a failure.
  const headline =
    full === 0
      ? 'Žádný pohár zatím nepřetéká'
      : full === 1
        ? 'Jeden pohár máš plný'
        : `${full} ${full < 5 ? 'poháry máš plné' : 'pohárů máš plných'}`;

  return (
    <KinkShell>
      <div className="space-y-10">
        <header className="space-y-2">
          <p className="text-xs text-muted-foreground">{MODES[profile.mode].label} · {total} pohárů</p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight">{headline}</h1>
          <p className="text-sm text-muted-foreground">
            {persona && <>Tvůj nejplnější pohár z tebe dělá typ <strong className="text-foreground">{persona}</strong>. </>}
            {topGroup && topGroup.avg >= 40 && <>Nejvíc tě to táhne do oblasti <strong className="text-foreground">{topGroup.label}</strong>. </>}
            {unexploredCount > 0 &&
              `${unexploredCount} ${unexploredCount === 1 ? 'pohár je neprozkoumaný' : unexploredCount < 5 ? 'poháry jsou neprozkoumané' : 'pohárů je neprozkoumaných'} — a to je v pořádku.`}
          </p>
          {(full === 0 || lowDesire) && (
            <p className="rounded-xl border bg-card/60 p-3 text-xs text-muted-foreground">
              {lowDesire
                ? 'Psal/a jsi, že sex pro tebe není moc důležitý. Prázdné poháry pak nejsou mezera, kterou je potřeba zaplnit — jsou prostě tvoje odpověď. Vezmi si odsud jen to, co tě opravdu zajímá.'
                : 'Prázdné poháry nejsou špatný výsledek. Znamenají jen, že tě tyhle věci nelákají — a to je užitečné vědět stejně jako opak.'}
            </p>
          )}
        </header>

        {/* The cups, by group */}
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.key} className="space-y-3">
              <div className="flex items-baseline justify-between gap-3 border-b pb-1.5">
                <h2 className="text-sm font-semibold">{g.label}</h2>
                <span className="text-[11px] tabular-nums text-muted-foreground">průměr {g.avg} %</span>
              </div>
              <div className="grid grid-cols-3 gap-x-2 gap-y-5">
                {g.cups.map(({ cup, result }) => {
                  const unexplored = isUnexplored(result);
                  const side = sideLabel(cup, result);
                  return (
                    <div key={cup.key} className="flex flex-col items-center text-center">
                      <CupGlass id={cup.key} fill={result.fill} color={cup.color} unexplored={unexplored} size={76} />
                      <p className="mt-1 text-xs font-semibold leading-tight">{cup.label}</p>
                      <p className="text-[11px] tabular-nums" style={{ color: cup.color }}>
                        {result.fill} % · {fillLabel(result)}
                      </p>
                      {result.depth !== undefined && (
                        <p className="text-[10px] leading-tight text-muted-foreground">
                          {depthLabel(result.depth)}{side ? ` · ${side}` : ''}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {profile.missing && (
          <section className="rounded-xl border border-dashed p-4">
            <h2 className="text-sm font-semibold">Tvůj vlastní pohár</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm">{profile.missing}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">Tohle jsme neměřili. Vidíš to jen ty — partnerovi se to v porovnání neukáže.</p>
          </section>
        )}

        {/* Partner comparison */}
        <section className="space-y-3 rounded-xl border border-primary/30 bg-primary/10 p-4">
          <h2 className="text-base font-semibold">Porovnej poháry s partnerem</h2>
          {inviter && (
            <Link
              href={`/kinkometr/porovnani/${profile.id}/${inviter.inviteToken}`}
              className="block rounded-md bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground"
            >
              Zobrazit porovnání s tím, kdo tě pozval
            </Link>
          )}
          {invited.map((p, i) => (
            <Link
              key={p.inviteToken}
              href={`/kinkometr/porovnani/${profile.id}/${p.inviteToken}`}
              className="block rounded-md bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground"
            >
              Partner/ka má hotovo — zobrazit porovnání{invited.length > 1 ? ` (${i + 1})` : ''}
            </Link>
          ))}
          <p className="text-xs text-muted-foreground">
            {single && invited.length === 0 && !inviter
              ? 'Až někoho potkáš, pošli mu odkaz. '
              : 'Pošli odkaz. '}
            Druhý odpoví na stejné otázky a oba uvidíte jen to, na čem se shodnete: poháry, které chcete oba,
            a ty, kde aspoň jeden váhá. Co jeden z vás nechce, zůstane skryté — a nikdo se nedozví, kdo to byl.
            Tenhle tvůj výsledek partner neuvidí.
          </p>
          <CopyLink
            path={`/kinkometr?partner=${profile.inviteToken}`}
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
                    {tips.deeper && (result.depth ?? 0) >= 45 && <TipList label="Když chceš dál" items={[tips.deeper]} />}
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

        {(rec.dating.length > 0) && (
          <Section title={single ? "Kde potkat někoho naladěného podobně" : "Kde potkat podobně naladěné"}>
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
            Výsledek je anonymní a dostupný jen přes tento odkaz — ulož si ho a nikomu ho neposílej. Pro partnera je určená pozvánka výše.
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
