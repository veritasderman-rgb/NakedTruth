import type { Metadata } from 'next';
import Link from 'next/link';
import KinkShell from '@/components/kink/Shell';
import CupGlass from '@/components/kink/CupGlass';
import { getKinkProfile } from '@/lib/kink-store';
import { SAFETY_RULES, TIPS, compareProfiles, type CupComparison } from '@/lib/kink';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Porovnání pohárů | NakedTruth Kinkometr',
  robots: { index: false, follow: false },
};

function harmonyLabel(h: number): string {
  if (h >= 80) return 'Pijete ze stejných pohárů';
  if (h >= 65) return 'Hodně společného, pár překvapení';
  if (h >= 50) return 'Máte si co ukázat';
  return 'Každý jinde — o to víc je o čem mluvit';
}

function Bars({ row }: { row: CupComparison }) {
  return (
    <div className="space-y-1">
      {[
        { who: 'Ty', r: row.a },
        { who: 'Partner/ka', r: row.b },
      ].map(({ who, r }) => (
        <div key={who} className="flex items-center gap-2 text-[11px]">
          <span className="w-16 shrink-0 text-muted-foreground">{who}</span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full"
              style={{ width: `${r.fill}%`, backgroundColor: row.cup.color, boxShadow: `0 0 8px ${row.cup.color}` }}
            />
          </span>
          <span className="w-9 shrink-0 text-right tabular-nums">{r.fill} %</span>
        </div>
      ))}
    </div>
  );
}

function Group({
  title,
  hint,
  rows,
  extra,
}: {
  title: string;
  hint: string;
  rows: CupComparison[];
  extra?: (row: CupComparison) => React.ReactNode;
}) {
  if (rows.length === 0) return null;
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      {rows.map((row) => (
        <div key={row.cup.key} className="space-y-3 rounded-xl border bg-card/60 p-4" style={{ borderColor: `${row.cup.color}55` }}>
          <p className="text-sm font-semibold" style={{ color: row.cup.color }}>{row.cup.label}</p>
          <Bars row={row} />
          {extra?.(row)}
        </div>
      ))}
    </section>
  );
}

export default async function KinkComparePage({ params }: { params: Promise<{ id: string; other: string }> }) {
  const { id, other } = await params;
  const [mine, theirs] = await Promise.all([
    getKinkProfile(id).catch(() => null),
    getKinkProfile(other).catch(() => null),
  ]);

  // Only profiles connected through an invite may be compared.
  const linked = mine && theirs && (mine.partnerOf === theirs.id || theirs.partnerOf === mine.id);

  if (!mine || !theirs || !linked) {
    return (
      <KinkShell>
        <div className="space-y-4 py-16 text-center">
          <h1 className="text-xl font-bold">Porovnání nenalezeno</h1>
          <p className="text-sm text-muted-foreground">Odkaz je neúplný, nebo tyto dva výsledky k sobě nepatří.</p>
          <Link href="/kinkometr" className="inline-flex rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">
            Udělat si Kinkometr
          </Link>
        </div>
      </KinkShell>
    );
  }

  const cmp = compareProfiles(mine.cups, theirs.cups);
  const by = (kind: CupComparison['kind']) => cmp.rows.filter((r) => r.kind === kind);
  const shared = by('shared');
  const rest = [...by('neutral'), ...by('skip')];
  const showSafety = [...shared, ...by('explore')].some((r) => r.cup.bdsm);

  return (
    <KinkShell>
      <div className="space-y-10">
        <header className="space-y-2 text-center">
          <p className="text-xs text-muted-foreground">Vaše poháry vedle sebe</p>
          <p className="text-7xl font-extrabold leading-none text-primary">{cmp.harmony}%</p>
          <h1 className="text-lg font-semibold">{harmonyLabel(cmp.harmony)}</h1>
          <p className="text-xs text-muted-foreground">
            {shared.length > 0
              ? `Společně plných pohárů: ${shared.length}.`
              : 'Žádný pohár zatím nemáte plný oba — podívejte se, kde jste si nejblíž.'}
          </p>
        </header>

        {shared.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3">
            {shared.map((r) => (
              <div key={r.cup.key} className="flex w-20 flex-col items-center text-center">
                <CupGlass id={`s-${r.cup.key}`} fill={Math.round((r.a.fill + r.b.fill) / 2)} color={r.cup.color} size={64} />
                <p className="mt-1 text-[11px] font-semibold leading-tight">{r.cup.label}</p>
              </div>
            ))}
          </div>
        )}

        {cmp.dynamic && (
          <p className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm">{cmp.dynamic}</p>
        )}

        <Group
          title="Společné poháry"
          hint="Tohle láká vás oba. Není na co čekat."
          rows={shared}
          extra={(row) => (
            <ul className="space-y-1.5 text-[13px]">
              <li><span className="text-muted-foreground">Zkuste: </span>{TIPS[row.cup.key].activities[0]}</li>
              <li><span className="text-muted-foreground">Poloha: </span>{TIPS[row.cup.key].positions[0]}</li>
              <li><span className="text-muted-foreground">Kde: </span>{TIPS[row.cup.key].places[0]}</li>
            </ul>
          )}
        />

        <Group
          title="O čem si promluvit"
          hint="Jeden má plno, druhý skoro prázdno. Ne znamená ne — ale stojí za to vědět proč a jestli existuje verze, která by bavila oba."
          rows={by('talk')}
        />

        <Group
          title="Prozkoumejte spolu"
          hint="Tady si nejste jistí ani jeden. Ideální místo pro malý společný pokus."
          rows={by('explore')}
          extra={(row) => <p className="text-[13px]">{TIPS[row.cup.key].firstStep}</p>}
        />

        <Group title="Ostatní poháry" hint="Bez velkých rozdílů." rows={rest} />

        {showSafety && (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight">Než něco zkusíte</h2>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {SAFETY_RULES.map((r) => (
                <li key={r.title}>
                  <strong className="text-foreground">{r.title}:</strong> {r.text}
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="flex flex-col gap-2 border-t pt-6 text-center">
          <Link href={`/kinkometr/vysledek/${mine.id}`} className="rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-accent">
            Moje poháry a doporučení
          </Link>
          <Link href="/#parovy-kviz" className="text-xs text-muted-foreground underline">
            Zkusit i párový kvíz naslepo
          </Link>
        </footer>
      </div>
    </KinkShell>
  );
}
