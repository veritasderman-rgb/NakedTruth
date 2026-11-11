import type { Metadata } from 'next';
import Link from 'next/link';
import KinkShell from '@/components/kink/Shell';
import CupGlass from '@/components/kink/CupGlass';
import { getKinkProfile, getKinkProfileByInvite } from '@/lib/kink-store';
import { SAFETY_RULES, TIPS, compareProfiles, isUnexplored, type CupComparison, type CupResult } from '@/lib/kink';

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

function stanceWord(r: CupResult): string {
  if (isUnexplored(r)) return 'neví';
  return r.fill >= 60 ? 'chce' : 'možná';
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
              style={{ width: `${r.fill}%`, backgroundColor: row.cup.color, boxShadow: `0 0 8px ${row.cup.color}`, opacity: isUnexplored(r) ? 0.45 : 1 }}
            />
          </span>
          <span className="w-12 shrink-0 text-right">{stanceWord(r)}</span>
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
          <div>
            <p className="text-sm font-semibold" style={{ color: row.cup.color }}>{row.cup.label}</p>
            <p className="text-[11px] text-muted-foreground">{row.cup.desc}</p>
          </div>
          <Bars row={row} />
          {extra?.(row)}
        </div>
      ))}
    </section>
  );
}

function NotFound() {
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

// `id` is the viewer's private profile id; `other` is the partner's shareable
// invite token. The partner's private id never appears in a URL.
export default async function KinkComparePage({ params }: { params: Promise<{ id: string; other: string }> }) {
  const { id, other } = await params;
  const [mine, theirs] = await Promise.all([
    getKinkProfile(id).catch(() => null),
    getKinkProfileByInvite(other).catch(() => null),
  ]);

  // Only profiles connected through an invite may be compared.
  if (!mine || !theirs || !(mine.partnerOf === theirs.id || theirs.partnerOf === mine.id)) {
    return <NotFound />;
  }

  const cmp = compareProfiles(mine.cups, theirs.cups);
  const by = (kind: CupComparison['kind']) => cmp.rows.filter((r) => r.kind === kind);
  const shared = by('shared');
  const showSafety = cmp.rows.some((r) => r.cup.bdsm);

  return (
    <KinkShell>
      <div className="space-y-10">
        <header className="space-y-2 text-center">
          <p className="text-xs text-muted-foreground">Vaše poháry vedle sebe</p>
          <p className="text-7xl font-extrabold leading-none text-primary">{cmp.harmony}%</p>
          <h1 className="text-lg font-semibold">{harmonyLabel(cmp.harmony)}</h1>
          <p className="text-xs text-muted-foreground">
            {shared.length > 0
              ? `Pohárů, které chcete oba: ${shared.length}.`
              : cmp.rows.length > 0
                ? 'Žádný pohár zatím nechcete naplno oba — ale je kde začít.'
                : 'Zatím jste se nepotkali v žádném poháru. I to je užitečné vědět — zkuste si o tom promluvit.'}
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
          title="Oba ano"
          hint="Tohle láká vás oba. Není na co čekat."
          rows={shared}
          extra={(row) => {
            const tips = TIPS[row.cup.key];
            return (
              <ul className="space-y-1.5 text-[13px]">
                {row.fit && <li className="font-medium">{row.fit}</li>}
                <li><span className="text-muted-foreground">Zkuste: </span>{tips.activities[0]}</li>
                {tips.positions[0] && <li><span className="text-muted-foreground">Poloha: </span>{tips.positions[0]}</li>}
                {tips.places[0] && <li><span className="text-muted-foreground">Kde: </span>{tips.places[0]}</li>}
              </ul>
            );
          }}
        />

        <Group
          title="Jeden ano, druhý možná"
          hint="Jeden z vás to chce, druhý váhá nebo neví. Tempo určuje ten, kdo váhá — a „možná“ se může kdykoli změnit v „ne“."
          rows={by('invite')}
          extra={(row) => <p className="text-[13px]"><span className="text-muted-foreground">Malý první krok: </span>{TIPS[row.cup.key].firstStep}</p>}
        />

        <Group
          title="Oba možná"
          hint="Tady váháte nebo nevíte oba. Ideální místo pro malý společný pokus — bez závazku."
          rows={by('explore')}
          extra={(row) => <p className="text-[13px]">{TIPS[row.cup.key].firstStep}</p>}
        />

        {cmp.hidden > 0 && (
          <section className="rounded-xl border border-dashed p-4 text-sm">
            <p className="font-semibold">
              {cmp.hidden} {cmp.hidden === 1 ? 'pohár zůstává skrytý' : cmp.hidden < 5 ? 'poháry zůstávají skryté' : 'pohárů zůstává skrytých'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Aspoň jeden z vás o ně nestojí. Neříkáme kdo — kdo po něčem touží, není vystaven tomu, kdo ne,
              a nikdo není tlačen do toho, co nechce. Jestli o nich chcete mluvit, je to na vás dvou.
            </p>
          </section>
        )}

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
