import type { Metadata } from 'next';
import Link from 'next/link';
import KinkShell from '@/components/kink/Shell';
import CupGlass from '@/components/kink/CupGlass';
import Tip from '@/components/kink/Tip';
import Track from '@/components/Track';
import { fmt, localePath, plural } from '@/lib/i18n';
import { getContent } from '@/lib/kink-content';
import { areConnected, getKinkProfile, getKinkProfileByInvite, isPairReportUnlocked } from '@/lib/kink-store';
import ReportOffer from '@/components/kink/ReportOffer';
import { vipProps } from '@/lib/vip-texts';
import { getExtra } from '@/lib/extra-content';
import { getReport } from '@/lib/report-content';
import { pairOfferTexts } from '@/lib/pair-texts';
import { pairPriceLabel } from '@/lib/stripe';
import { getLocale } from '@/lib/locale';
import { compareProfiles, harmonyLevel, isUnexplored, type CupComparison, type CupResult } from '@/lib/kink';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { ui } = getContent(await getLocale());
  return { title: ui.cmpMetaTitle, robots: { index: false, follow: false } };
}

// `id` is the viewer's private profile id; `other` is the partner's shareable
// invite token. The partner's private id never appears in a URL.
export default async function KinkComparePage({ params }: { params: Promise<{ id: string; other: string }> }) {
  const { id, other } = await params;
  const locale = await getLocale();
  const c = getContent(locale);
  const t = c.ui;
  const href = (path: string) => localePath(locale, path);

  const [mine, theirs] = await Promise.all([
    getKinkProfile(id).catch(() => null),
    getKinkProfileByInvite(other).catch(() => null),
  ]);

  // Only profiles connected through an invite may be compared.
  if (!mine || !theirs || !areConnected(mine, theirs)) {
    return (
      <KinkShell locale={locale} brand={t.brand} languageLabel={t.language}>
        <div className="space-y-4 py-16 text-center">
          <h1 className="text-xl font-bold">{t.cmpNotFoundTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.cmpNotFoundText}</p>
          <Link href={href('/kinkometr')} className="btn-glow inline-flex rounded-md px-6 py-3 text-sm font-medium">
            {t.takeTest}
          </Link>
        </div>
      </KinkShell>
    );
  }

  const cmp = compareProfiles(mine.cups, theirs.cups);
  const pairUnlocked = await isPairReportUnlocked(mine.inviteToken, theirs.inviteToken).catch(() => false);
  const by = (kind: CupComparison['kind']) => cmp.rows.filter((r) => r.kind === kind);
  const shared = by('shared');
  const showSafety = cmp.rows.some((r) => r.cup.bdsm);

  const stanceWord = (r: CupResult) => (isUnexplored(r) ? t.stanceUnsure : r.fill >= 60 ? t.stanceYes : t.stanceMaybe);

  const Bars = ({ row }: { row: CupComparison }) => (
    <div className="space-y-1">
      {[
        { who: t.you, r: row.a },
        { who: t.partner, r: row.b },
      ].map(({ who, r }) => (
        <div key={who} className="flex items-center gap-2 text-[11px]">
          <span className="w-20 shrink-0 truncate text-muted-foreground">{who}</span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full rounded-full"
              style={{ width: `${r.fill}%`, backgroundColor: row.cup.color, boxShadow: `0 0 8px ${row.cup.color}`, opacity: isUnexplored(r) ? 0.45 : 1 }}
            />
          </span>
          <span className="w-16 shrink-0 text-right">{stanceWord(r)}</span>
        </div>
      ))}
    </div>
  );

  const Group = ({
    title,
    hint,
    rows,
    extra,
  }: {
    title: string;
    hint: string;
    rows: CupComparison[];
    extra?: (row: CupComparison) => React.ReactNode;
  }) =>
    rows.length === 0 ? null : (
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        {rows.map((row) => (
          <div key={row.cup.key} className="glass space-y-3 rounded-xl p-4" style={{ borderColor: `${row.cup.color}66` }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: row.cup.color }}>{c.cups[row.cup.key].label}</p>
              <p className="text-[11px] text-muted-foreground">{c.cups[row.cup.key].desc}</p>
            </div>
            <Bars row={row} />
            {extra?.(row)}
          </div>
        ))}
      </section>
    );

  return (
    <KinkShell locale={locale} brand={t.brand} languageLabel={t.language}>
      <Track name="kink_compare_view" />
      <div className="space-y-10">
        <header className="space-y-2 text-center">
          <p className="text-xs text-muted-foreground">{t.cmpKicker}</p>
          <p className="text-gradient text-7xl font-extrabold leading-none">{cmp.harmony}%</p>
          <h1 className="text-lg font-semibold">{c.harmony[harmonyLevel(cmp.harmony)]}</h1>
          <p className="text-xs text-muted-foreground">
            {shared.length > 0 ? fmt(t.sharedCount, { n: shared.length }) : cmp.rows.length > 0 ? t.noShared : t.noRows}
          </p>
        </header>

        {shared.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3">
            {shared.map((r) => (
              <div key={r.cup.key} className="flex w-20 flex-col items-center text-center">
                <CupGlass id={`s-${r.cup.key}`} fill={Math.round((r.a.fill + r.b.fill) / 2)} color={r.cup.color} size={64} />
                <p className="mt-1 text-[11px] font-semibold leading-tight">{c.cups[r.cup.key].label}</p>
              </div>
            ))}
          </div>
        )}

        {cmp.dynamic && <p className="glass-primary rounded-xl p-4 text-sm">{c.dynamic[cmp.dynamic]}</p>}

        <Group
          title={t.grpSharedTitle}
          hint={t.grpSharedHint}
          rows={shared}
          extra={(row) => {
            const text = c.cups[row.cup.key];
            return (
              <ul className="space-y-1.5 text-[13px]">
                {row.fit && <li className="font-medium">{fmt(c.fit[row.fit], { give: text.give ?? '', receive: text.receive ?? '' })}</li>}
                <li><span className="text-muted-foreground">{t.try} </span>{text.tips.activities[0]}</li>
                {text.tips.positions[0] && <li><span className="text-muted-foreground">{t.position} </span>{text.tips.positions[0]}</li>}
                {text.tips.places[0] && <li><span className="text-muted-foreground">{t.where} </span>{text.tips.places[0]}</li>}
              </ul>
            );
          }}
        />

        <Group
          title={t.grpInviteTitle}
          hint={t.grpInviteHint}
          rows={by('invite')}
          extra={(row) => (
            <p className="text-[13px]">
              <span className="text-muted-foreground">{t.firstStep} </span>
              {c.cups[row.cup.key].tips.firstStep}
            </p>
          )}
        />

        <Group
          title={t.grpExploreTitle}
          hint={t.grpExploreHint}
          rows={by('explore')}
          extra={(row) => <p className="text-[13px]">{c.cups[row.cup.key].tips.firstStep}</p>}
        />

        {cmp.hidden > 0 && (
          <section className="rounded-xl border border-dashed border-white/25 p-4 text-sm">
            <p className="font-semibold">{plural(locale, cmp.hidden, c.plurals.hidden)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.hiddenText}</p>
          </section>
        )}

        {showSafety && (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight">{t.safetyTitle}</h2>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {c.safety.map((r) => (
                <li key={r.title}>
                  <strong className="text-foreground">{r.title}:</strong> {r.text}
                </li>
              ))}
            </ul>
          </section>
        )}

        {cmp.rows.length > 0 && (
          <ReportOffer
            id={mine.id}
            other={theirs.inviteToken}
            locale={locale}
            price={pairPriceLabel(locale)}
            unlocked={pairUnlocked}
            reportPath={href(`/kinkometr/parovy-rozbor/${mine.id}/${theirs.inviteToken}`)}
            vip={await vipProps(getExtra(locale).ui)}
            t={pairOfferTexts(getReport(locale).ui, getExtra(locale).ui)}
          />
        )}

        <Tip locale={locale} t={t} />

        <footer className="flex flex-col gap-2 border-t border-white/10 pt-6 text-center">
          <Link href={href(`/kinkometr/vysledek/${mine.id}`)} className="rounded-md border border-white/15 px-4 py-2.5 text-sm font-medium hover:bg-white/5">
            {t.myCups}
          </Link>
          <Link href={`${href('/')}#parovy-kviz`} className="text-xs text-muted-foreground underline">
            {t.tryQuizToo}
          </Link>
        </footer>
      </div>
    </KinkShell>
  );
}
