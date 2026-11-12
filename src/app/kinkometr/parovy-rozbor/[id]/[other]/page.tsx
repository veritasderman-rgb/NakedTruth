import type { Metadata } from 'next';
import Link from 'next/link';
import KinkShell from '@/components/kink/Shell';
import CupGlass from '@/components/kink/CupGlass';
import PrintButton from '@/components/kink/PrintButton';
import ReportOffer from '@/components/kink/ReportOffer';
import Track from '@/components/Track';
import { fmt, localePath } from '@/lib/i18n';
import { getContent } from '@/lib/kink-content';
import { getExtra } from '@/lib/extra-content';
import { getReport } from '@/lib/report-content';
import { areConnected, getKinkProfile, getKinkProfileByInvite, isPairReportUnlocked } from '@/lib/kink-store';
import { getLocale } from '@/lib/locale';
import { fulfilReturn } from '@/lib/purchase';
import { pairPriceLabel } from '@/lib/stripe';
import { pairOfferTexts } from '@/lib/pair-texts';
import { compareProfiles, stanceOf, type CupComparison } from '@/lib/kink';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return { title: getExtra(await getLocale()).ui.pairMetaTitle, robots: { index: false, follow: false } };
}

// `id` is the viewer's private result id; `other` is the partner's shareable
// invite token. One payment unlocks the plan for both of them.
export default async function PairReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; other: string }>;
  searchParams: Promise<{ paid?: string; cancelled?: string }>;
}) {
  const { id, other } = await params;
  const { paid, cancelled } = await searchParams;
  const locale = await getLocale();
  const c = getContent(locale);
  const r = getReport(locale);
  const x = getExtra(locale).ui;
  const href = (path: string) => localePath(locale, path);

  const [mine, theirs] = await Promise.all([
    getKinkProfile(id).catch(() => null),
    getKinkProfileByInvite(other).catch(() => null),
  ]);

  if (!mine || !theirs || !areConnected(mine, theirs)) {
    return (
      <KinkShell locale={locale} brand={c.ui.brand} languageLabel={c.ui.language}>
        <div className="space-y-4 py-16 text-center">
          <h1 className="text-xl font-bold">{c.ui.cmpNotFoundTitle}</h1>
          <p className="text-sm text-muted-foreground">{c.ui.cmpNotFoundText}</p>
          <Link href={href('/kinkometr')} className="btn-glow inline-flex rounded-md px-6 py-3 text-sm font-medium">
            {c.ui.takeTest}
          </Link>
        </div>
      </KinkShell>
    );
  }

  const comparePath = href(`/kinkometr/porovnani/${mine.id}/${theirs.inviteToken}`);
  const reportPath = href(`/kinkometr/parovy-rozbor/${mine.id}/${theirs.inviteToken}`);

  let unlocked = await isPairReportUnlocked(mine.inviteToken, theirs.inviteToken);
  let justPaid = false;
  if (!unlocked && paid) {
    const bought = await fulfilReturn(paid);
    const tokens = bought?.kind === 'pair' ? [bought.buyer, bought.partner] : [];
    if (tokens.includes(mine.inviteToken) && tokens.includes(theirs.inviteToken)) {
      unlocked = true;
      justPaid = true;
    }
  }

  if (!unlocked) {
    return (
      <KinkShell locale={locale} brand={c.ui.brand} languageLabel={c.ui.language}>
        <div className="space-y-6">
          <ReportOffer
            id={mine.id}
            other={theirs.inviteToken}
            locale={locale}
            price={pairPriceLabel(locale)}
            unlocked={false}
            reportPath={reportPath}
            notice={paid ? r.ui.notVerified : cancelled ? r.ui.cancelled : null}
            t={pairOfferTexts(r.ui, x)}
          />
          <Link href={comparePath} className="block text-center text-xs text-muted-foreground underline">
            {x.pairBack}
          </Link>
        </div>
      </KinkShell>
    );
  }

  const cmp = compareProfiles(mine.cups, theirs.cups);
  const by = (kind: CupComparison['kind']) => cmp.rows.filter((row) => row.kind === kind);
  // Gentlest first: tender cups, then the rest by how full they are for both.
  const avg = (row: CupComparison) => (row.a.fill + row.b.fill) / 2;
  const shared = by('shared').sort((p, q) => Number(q.cup.group === 'tender') - Number(p.cup.group === 'tender') || avg(p) - avg(q));
  const invites = by('invite');
  const explore = by('explore');

  const Card = ({ row, children }: { row: CupComparison; children: React.ReactNode }) => (
    <div className="glass break-inside-avoid space-y-3 rounded-xl p-4" style={{ borderColor: `${row.cup.color}66` }}>
      <div className="flex items-center gap-3">
        <CupGlass id={`pr-${row.cup.key}`} fill={Math.round(avg(row))} color={row.cup.color} size={44} />
        <div>
          <p className="text-base font-semibold" style={{ color: row.cup.color }}>{c.cups[row.cup.key].label}</p>
          <p className="text-[11px] text-muted-foreground">{c.cups[row.cup.key].desc}</p>
        </div>
      </div>
      {children}
    </div>
  );

  const Block = ({ label, text }: { label: string; text: string }) => (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{text}</p>
    </div>
  );

  return (
    <KinkShell locale={locale} brand={c.ui.brand} languageLabel={c.ui.language}>
      <Track name="pair_view" />
      <article className="space-y-10">
        <header className="space-y-3">
          <h1 className="text-gradient text-balance text-4xl font-bold tracking-tight">{x.pairTitle}</h1>
          {justPaid && <p className="glass-primary rounded-xl p-3 text-sm">{x.pairThanks}</p>}
          <p className="text-sm tabular-nums text-muted-foreground">
            {fmt(x.pairSummary, { shared: shared.length, invite: invites.length, explore: explore.length })}
          </p>
          {cmp.dynamic && <p className="glass-primary rounded-xl p-4 text-sm">{c.dynamic[cmp.dynamic]}</p>}
          <div className="flex flex-wrap gap-2">
            <PrintButton label={r.ui.print} />
            <Link href={comparePath} className="rounded-md border border-white/15 px-4 py-2.5 text-sm font-medium hover:bg-white/5 print:hidden">
              {x.pairBack}
            </Link>
          </div>
        </header>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">{x.pairAgreeTitle}</h2>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm">
            {[x.pairAgree1, x.pairAgree2, x.pairAgree3].map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{x.pairEveningsTitle}</h2>
            <p className="text-xs text-muted-foreground">{shared.length > 0 ? x.pairEveningsLead : x.pairEveningsEmpty}</p>
          </div>
          {shared.map((row, i) => {
            const text = c.cups[row.cup.key];
            return (
              <Card key={row.cup.key} row={row}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{fmt(r.ui.eveningN, { n: i + 1 })}</p>
                {row.fit && <Block label={x.pairRolesLabel} text={fmt(c.fit[row.fit], { give: text.give ?? '', receive: text.receive ?? '' })} />}
                <Block label={x.pairEveningLabel} text={r.cups[row.cup.key].evening} />
                <Block label={x.pairSayLabel} text={r.cups[row.cup.key].talk} />
              </Card>
            );
          })}
        </section>

        {invites.length > 0 && (
          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{x.pairInvitesTitle}</h2>
              <p className="text-xs text-muted-foreground">{x.pairInvitesLead}</p>
            </div>
            {invites.map((row) => (
              <Card key={row.cup.key} row={row}>
                <p className="brand-pill inline-block">{stanceOf(row.a) === 'yes' ? x.pairYouOpen : x.pairPartnerOpens}</p>
                <Block label={x.pairSayLabel} text={r.cups[row.cup.key].talk} />
                <Block label={x.pairFirstStepLabel} text={c.cups[row.cup.key].tips.firstStep} />
              </Card>
            ))}
          </section>
        )}

        {explore.length > 0 && (
          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{x.pairExploreTitle}</h2>
              <p className="text-xs text-muted-foreground">{x.pairExploreLead}</p>
            </div>
            {explore.map((row) => (
              <Card key={row.cup.key} row={row}>
                <Block label={x.pairFirstStepLabel} text={c.cups[row.cup.key].tips.firstStep} />
              </Card>
            ))}
          </section>
        )}

        {cmp.hidden > 0 && <p className="rounded-xl border border-dashed border-white/25 p-4 text-xs text-muted-foreground">{x.pairHiddenNote}</p>}

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">{c.ui.safetyTitle}</h2>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {c.safety.map((rule) => (
              <li key={rule.title}>
                <strong className="text-foreground">{rule.title}:</strong> {rule.text}
              </li>
            ))}
          </ul>
        </section>
      </article>
    </KinkShell>
  );
}
