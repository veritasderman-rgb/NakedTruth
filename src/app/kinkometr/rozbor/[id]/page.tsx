import type { Metadata } from 'next';
import Link from 'next/link';
import KinkShell from '@/components/kink/Shell';
import CupGlass from '@/components/kink/CupGlass';
import PrintButton from '@/components/kink/PrintButton';
import Track from '@/components/Track';
import ReportOffer from '@/components/kink/ReportOffer';
import { fmt, localePath } from '@/lib/i18n';
import { getContent } from '@/lib/kink-content';
import { getKinkProfile } from '@/lib/kink-store';
import { fulfilReturn } from '@/lib/purchase';
import { getLocale } from '@/lib/locale';
import { getReport } from '@/lib/report-content';
import { getExtra } from '@/lib/extra-content';
import { reportPriceLabel } from '@/lib/stripe';
import { depthLevel, fillLevel, isUnexplored, rankedCups, stanceOf, type Cup, type CupResult, type Stance } from '@/lib/kink';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { ui } = getReport(await getLocale());
  return { title: ui.metaTitle, robots: { index: false, follow: false } };
}

type Ranked = { cup: Cup; result: CupResult };

// Up to four evenings: gentle first, the fullest cup last. A tender cup opens
// the plan when the person has one.
function planFor(ranked: Ranked[]): Ranked[] {
  const wanted = ranked.filter((r) => stanceOf(r.result) === 'yes');
  const pool = wanted.length >= 2 ? wanted : ranked.filter((r) => stanceOf(r.result) !== 'no');
  const plan = pool.slice(0, 4).reverse();
  const tender = pool.find((r) => r.cup.group === 'tender');
  if (tender && !plan.includes(tender) && plan.length > 0) plan[0] = tender;
  else if (tender && plan.includes(tender)) plan.sort((a, b) => Number(b === tender) - Number(a === tender));
  return plan;
}

export default async function KinkReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string; cancelled?: string }>;
}) {
  const { id } = await params;
  const { paid, cancelled } = await searchParams;
  const locale = await getLocale();
  const c = getContent(locale);
  const r = getReport(locale);
  const t = r.ui;
  const x = getExtra(locale).ui;
  const href = (path: string) => localePath(locale, path);
  const profile = await getKinkProfile(id).catch(() => null);

  if (!profile) {
    return (
      <KinkShell locale={locale} brand={c.ui.brand} languageLabel={c.ui.language}>
        <div className="space-y-4 py-16 text-center">
          <h1 className="text-xl font-bold">{c.ui.resultNotFoundTitle}</h1>
          <p className="text-sm text-muted-foreground">{c.ui.resultNotFoundText}</p>
          <Link href={href('/kinkometr')} className="btn-glow inline-flex rounded-md px-6 py-3 text-sm font-medium">
            {c.ui.takeTest}
          </Link>
        </div>
      </KinkShell>
    );
  }

  // Returning from Checkout: verify the payment and unlock.
  let unlocked = profile.reportUnlocked;
  let justPaid = false;
  if (!unlocked && paid) {
    const bought = await fulfilReturn(paid);
    if (bought?.kind === 'report' && bought.profile === profile.inviteToken) {
      unlocked = true;
      justPaid = true;
    }
  }

  const resultPath = href(`/kinkometr/vysledek/${profile.id}`);

  const ranked = rankedCups(profile.cups);
  const by = (s: Stance) => ranked.filter((x) => stanceOf(x.result) === s);
  const [yes, maybe, no] = [by('yes'), by('maybe'), by('no')];
  const open = [...yes, ...maybe];
  const plan = planFor(ranked);

  const isYes = (x?: CupResult) => !!x && stanceOf(x) === 'yes';
  const [dom, sub] = [isYes(profile.cups.dominance), isYes(profile.cups.submission)];
  const hasPower = !!profile.cups.dominance;
  const role = dom && sub ? t.roleSwitch : dom ? t.roleDom : sub ? t.roleSub : t.roleNone;

  const depths = ranked.map((x) => x.result.depth).filter((d): d is number => d !== undefined);
  const avgDepth = depths.length > 0 ? Math.round(depths.reduce((a, b) => a + b, 0) / depths.length) : null;

  const names = (list: Ranked[]) => (list.length > 0 ? list.map((x) => c.cups[x.cup.key].label).join(' · ') : t.mapEmpty);

  // One cup in full: how to bring it up, what to try, and an evening.
  const CupCard = ({ cup, result }: Ranked) => {
    const text = c.cups[cup.key];
    const blocks: { label: string; items: string[] }[] = [
      { label: t.talkLabel, items: [r.cups[cup.key].talk] },
      { label: c.ui.activities, items: text.tips.activities },
      { label: c.ui.positions, items: text.tips.positions },
      { label: c.ui.places, items: text.tips.places },
      { label: c.ui.goFurther, items: text.tips.deeper ? [text.tips.deeper] : [] },
      { label: t.eveningLabel, items: [r.cups[cup.key].evening] },
    ];
    return (
      <div className="glass break-inside-avoid space-y-4 rounded-xl p-4" style={{ borderColor: `${cup.color}66` }}>
        <div className="flex items-center gap-3">
          <CupGlass id={`r-${cup.key}`} fill={result.fill} color={cup.color} unexplored={isUnexplored(result)} size={44} />
          <div>
            <p className="text-base font-semibold" style={{ color: cup.color }}>{text.label}</p>
            <p className="text-[11px] text-muted-foreground">
              {result.fill} % · {c.fill[fillLevel(result)]} · {text.desc}
            </p>
          </div>
        </div>
        {isUnexplored(result) && <p className="text-sm">{text.tips.firstStep}</p>}
        {blocks.filter((b) => b.items.length > 0).map((b) => (
          <div key={b.label}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{b.label}</p>
            <ul className="mt-1.5 space-y-1.5 text-sm">
              {b.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="text-muted-foreground">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  if (!unlocked) {
    // Free sample: the fullest cup in full. Everything else is shown by name
    // only — the paid text is never sent to the browser.
    const [sample, ...locked] = open;
    const offer = (
      <ReportOffer
        id={profile.id}
        locale={locale}
        price={reportPriceLabel(locale)}
        unlocked={false}
        reportPath={href(`/kinkometr/rozbor/${profile.id}`)}
        notice={paid ? t.notVerified : cancelled ? t.cancelled : null}
        t={t}
      />
    );
    return (
      <KinkShell locale={locale} brand={c.ui.brand} languageLabel={c.ui.language}>
        <Track name="report_sample_view" />
        <div className="space-y-6">
          {sample && (
            <>
              <header className="space-y-2">
                <span className="brand-pill">{x.sampleKicker}</span>
                <h1 className="text-gradient text-balance text-3xl font-bold tracking-tight">{x.sampleTitle}</h1>
                <p className="text-sm text-muted-foreground">{fmt(x.sampleLead, { n: open.length })}</p>
              </header>
              <CupCard {...sample} />
              <section className="space-y-2" data-testid="locked">
                <h2 className="text-sm font-semibold">{x.sampleMore}</h2>
                <ul className="space-y-2">
                  {[...locked.map((l) => ({ key: l.cup.key as string, label: c.cups[l.cup.key].label, color: l.cup.color })), { key: 'map', label: t.mapTitle, color: '#94a3b8' }, { key: 'plan', label: t.planTitle, color: '#94a3b8' }].map((row) => (
                    <li key={row.key} className="glass flex items-center justify-between gap-3 rounded-xl p-3" style={{ borderColor: `${row.color}44` }}>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold" style={{ color: row.color }}>{row.label}</span>
                        <span aria-hidden className="mt-1.5 block h-2 w-40 max-w-full rounded-full bg-white/10 blur-[2px]" />
                        <span aria-hidden className="mt-1 block h-2 w-28 max-w-full rounded-full bg-white/10 blur-[2px]" />
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">🔒 {x.sampleLocked}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
          {offer}
          <Link href={resultPath} className="block text-center text-xs text-muted-foreground underline">
            {t.backToResult}
          </Link>
        </div>
      </KinkShell>
    );
  }

  return (
    <KinkShell locale={locale} brand={c.ui.brand} languageLabel={c.ui.language}>
      <Track name="report_view" />
      <article className="space-y-10">
        <header className="space-y-3">
          <h1 className="text-gradient text-balance text-4xl font-bold tracking-tight">{t.title}</h1>
          {justPaid && <p className="glass-primary rounded-xl p-3 text-sm">{t.thanks}</p>}
          <div className="flex flex-wrap gap-2">
            <PrintButton label={t.print} />
            <Link href={resultPath} className="rounded-md border border-white/15 px-4 py-2.5 text-sm font-medium hover:bg-white/5 print:hidden">
              {t.backToResult}
            </Link>
          </div>
        </header>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">{t.summaryTitle}</h2>
          <p className="text-2xl font-bold tabular-nums">{fmt(t.countsLine, { yes: yes.length, maybe: maybe.length, no: no.length })}</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {yes[0] && <li>{fmt(c.ui.personaLine, { persona: c.cups[yes[0].cup.key].persona })}</li>}
            {hasPower && <li>{role}</li>}
            {avgDepth !== null && <li>{fmt(t.depthLine, { depth: c.depth[depthLevel(avgDepth)] })}</li>}
          </ul>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{t.mapTitle}</h2>
            <p className="text-xs text-muted-foreground">{t.mapHint}</p>
          </div>
          <dl className="space-y-2 text-sm">
            {[
              { label: t.mapYes, list: yes, color: '#34d399' },
              { label: t.mapMaybe, list: maybe, color: '#fbbf24' },
              { label: t.mapNo, list: no, color: '#94a3b8' },
            ].map((row) => (
              <div key={row.label} className="glass break-inside-avoid rounded-xl p-3">
                <dt className="text-xs font-bold uppercase tracking-wider" style={{ color: row.color }}>
                  {row.label} · {row.list.length}
                </dt>
                <dd className="mt-1">{names(row.list)}</dd>
              </div>
            ))}
          </dl>
        </section>

        {plan.length > 0 && (
          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{t.planTitle}</h2>
              <p className="text-xs text-muted-foreground">{plan.length < 4 ? t.planShort : t.planLead}</p>
            </div>
            <ol className="space-y-3">
              {plan.map(({ cup }, i) => (
                <li key={cup.key} className="glass break-inside-avoid rounded-xl p-4" style={{ borderColor: `${cup.color}66` }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{fmt(t.eveningN, { n: i + 1 })}</p>
                  <p className="text-sm font-semibold" style={{ color: cup.color }}>{c.cups[cup.key].label}</p>
                  <p className="mt-1.5 text-sm">{r.cups[cup.key].evening}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {open.length > 0 && (
          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{t.cupsTitle}</h2>
              <p className="text-xs text-muted-foreground">{t.cupsLead}</p>
            </div>
            {open.map((item) => (
              <CupCard key={item.cup.key} {...item} />
            ))}
            <p className="text-[11px] leading-relaxed text-muted-foreground">{c.placesNote}</p>
          </section>
        )}

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
