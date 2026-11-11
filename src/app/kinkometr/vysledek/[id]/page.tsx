import type { Metadata } from 'next';
import Link from 'next/link';
import KinkShell from '@/components/kink/Shell';
import CupGlass from '@/components/kink/CupGlass';
import CopyLink from '@/components/kink/CopyLink';
import Tip from '@/components/kink/Tip';
import { fmt, localePath, plural } from '@/lib/i18n';
import { getContent } from '@/lib/kink-content';
import { getInvitedProfiles, getKinkProfile } from '@/lib/kink-store';
import { getLocale } from '@/lib/locale';
import {
  depthLevel,
  fillLevel,
  fullCupCount,
  groupSummaries,
  isUnexplored,
  matchDating,
  recommend,
  sideOf,
} from '@/lib/kink';

export const dynamic = 'force-dynamic';

// Private result — reachable only via its link, never indexed.
export async function generateMetadata(): Promise<Metadata> {
  const { ui } = getContent(await getLocale());
  return { title: ui.resultMetaTitle, robots: { index: false, follow: false } };
}

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
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden className="text-muted-foreground">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// "…makes you a {persona}." with the placeholder rendered in bold.
function Emph({ template, name, value }: { template: string; name: string; value: string }) {
  const [before, after = ''] = template.split(`{${name}}`);
  return (
    <>
      {before}
      <strong className="text-foreground">{value}</strong>
      {after}{' '}
    </>
  );
}

export default async function KinkResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getLocale();
  const c = getContent(locale);
  const t = c.ui;
  const href = (path: string) => localePath(locale, path);
  const profile = await getKinkProfile(id).catch(() => null);

  if (!profile) {
    return (
      <KinkShell locale={locale} brand={t.brand} languageLabel={t.language}>
        <div className="space-y-4 py-16 text-center">
          <h1 className="text-xl font-bold">{t.resultNotFoundTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.resultNotFoundText}</p>
          <Link href={href('/kinkometr')} className="btn-glow inline-flex rounded-md px-6 py-3 text-sm font-medium">
            {t.takeTest}
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
  const dating = matchDating(c.dating, rec.topKeys);
  const topCup = rec.top[0]?.cup;
  const topGroup = [...groups].sort((a, b) => b.avg - a.avg)[0];
  const podium = rec.top.slice(0, 3);
  const showSafety = [...rec.top, ...rec.explore].some((r) => r.cup.bdsm);
  const { single, lowDesire } = profile.context;

  return (
    <KinkShell locale={locale} brand={t.brand} languageLabel={t.language}>
      <div className="space-y-10">
        <header className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {c.modes[profile.mode].label} · {plural(locale, total, c.plurals.cupsTotal)}
          </p>
          <h1 className="text-gradient text-balance text-4xl font-bold tracking-tight">
            {full === 0 ? t.headlineNone : plural(locale, full, c.plurals.fullCups)}
          </h1>

          {/* The fullest cups, large */}
          {podium.length > 0 && (
            <div className="flex items-end justify-center gap-4 pt-3">
              {podium.map(({ cup, result }, i) => (
                <div key={cup.key} className={`flex flex-col items-center text-center ${i === 0 ? 'order-2' : i === 1 ? 'order-1' : 'order-3'}`}>
                  <CupGlass id={`p-${cup.key}`} fill={result.fill} color={cup.color} size={i === 0 ? 124 : 92} />
                  <p className="mt-1 max-w-[7rem] text-xs font-semibold leading-tight" style={{ color: cup.color }}>
                    {c.cups[cup.key].label}
                  </p>
                </div>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            {topCup && <Emph template={t.personaLine} name="persona" value={c.cups[topCup.key].persona} />}
            {topGroup && topGroup.avg >= 40 && <Emph template={t.groupLine} name="group" value={c.groups[topGroup.key].label} />}
            {unexploredCount > 0 && plural(locale, unexploredCount, c.plurals.unexplored)}
          </p>
          {(full === 0 || lowDesire) && (
            <p className="glass rounded-xl p-3 text-xs text-muted-foreground">{lowDesire ? t.noteLowDesire : t.noteEmpty}</p>
          )}
        </header>

        {/* All cups, by group */}
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.key} className="space-y-3">
              <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-1.5">
                <h2 className="text-sm font-semibold">{c.groups[g.key].label}</h2>
                <span className="text-[11px] tabular-nums text-muted-foreground">{fmt(t.avg, { n: g.avg })}</span>
              </div>
              <div className="grid grid-cols-3 gap-x-2 gap-y-5">
                {g.cups.map(({ cup, result }) => {
                  const text = c.cups[cup.key];
                  const side = cup.dir ? sideOf(result) : null;
                  const sideText =
                    side === 'both' ? `${text.give} + ${text.receive}` : side === 'give' ? text.give : side === 'receive' ? text.receive : null;
                  return (
                    <div key={cup.key} className="flex flex-col items-center text-center">
                      <CupGlass
                        id={cup.key}
                        fill={result.fill}
                        color={cup.color}
                        unexplored={isUnexplored(result)}
                        size={76}
                        label={`${text.label}: ${result.fill} %`}
                      />
                      <p className="mt-1 text-xs font-semibold leading-tight">{text.label}</p>
                      <p className="text-[11px] tabular-nums" style={{ color: cup.color }}>
                        {result.fill} % · {c.fill[fillLevel(result)]}
                      </p>
                      {result.depth !== undefined && (
                        <p className="text-[10px] leading-tight text-muted-foreground">
                          {c.depth[depthLevel(result.depth)]}
                          {sideText ? ` · ${sideText}` : ''}
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
          <section className="rounded-xl border border-dashed border-white/25 p-4">
            <h2 className="text-sm font-semibold">{t.ownCupTitle}</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm">{profile.missing}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">{t.ownCupNote}</p>
          </section>
        )}

        {/* Partner comparison */}
        <section className="glass-primary space-y-3 rounded-2xl p-4">
          <h2 className="text-base font-semibold">{t.compareTitle}</h2>
          {inviter && (
            <Link href={href(`/kinkometr/porovnani/${profile.id}/${inviter.inviteToken}`)} className="btn-glow block rounded-md px-4 py-2.5 text-center text-sm font-medium">
              {t.compareWithInviter}
            </Link>
          )}
          {invited.map((p, i) => (
            <Link key={p.inviteToken} href={href(`/kinkometr/porovnani/${profile.id}/${p.inviteToken}`)} className="btn-glow block rounded-md px-4 py-2.5 text-center text-sm font-medium">
              {t.partnerDone}
              {invited.length > 1 ? ` (${i + 1})` : ''}
            </Link>
          ))}
          <p className="text-xs text-muted-foreground">
            {single && invited.length === 0 && !inviter ? t.sendLinkSingle : t.sendLink} {t.compareLead}
          </p>
          <CopyLink
            path={href(`/kinkometr?partner=${profile.inviteToken}`)}
            label={invited.length > 0 ? t.copyInviteAgain : t.copyInvite}
            copiedLabel={t.copied}
            promptLabel={t.copyPrompt}
          />
        </section>

        {/* Recommendations for the fullest cups */}
        {rec.top.length > 0 && (
          <Section title={t.recTitle}>
            <div className="space-y-3">
              {rec.top.map(({ cup, result }, i) => {
                const text = c.cups[cup.key];
                return (
                  <details key={cup.key} open={i === 0} className="glass group rounded-xl p-4" style={{ borderColor: `${cup.color}66` }}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                      <span>
                        <span className="text-sm font-semibold" style={{ color: cup.color }}>{text.label}</span>
                        <span className="ml-2 text-[11px] text-muted-foreground">{result.fill} %</span>
                        <span className="block text-[11px] text-muted-foreground">{text.desc}</span>
                      </span>
                      <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-90">›</span>
                    </summary>
                    <div className="mt-4 space-y-4">
                      <TipList label={t.activities} items={text.tips.activities} />
                      <TipList label={t.positions} items={text.tips.positions} />
                      <TipList label={t.places} items={text.tips.places} />
                      {text.tips.deeper && (result.depth ?? 0) >= 45 && <TipList label={t.goFurther} items={[text.tips.deeper]} />}
                    </div>
                  </details>
                );
              })}
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">{c.placesNote}</p>
          </Section>
        )}

        {rec.related.length > 0 && (
          <Section title={t.relatedTitle}>
            <ul className="space-y-2">
              {rec.related.map(({ from, to }) => (
                <li key={`${from.key}-${to.key}`} className="glass rounded-xl p-3 text-sm">
                  <span style={{ color: from.color }}>{c.cups[from.key].label}</span>
                  <span className="text-muted-foreground"> → </span>
                  <strong style={{ color: to.color }}>{c.cups[to.key].label}</strong>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{c.cups[to.key].desc}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {rec.explore.length > 0 && (
          <Section title={t.exploreTitle}>
            <p className="text-xs text-muted-foreground">{t.exploreLead}</p>
            <ul className="space-y-2">
              {rec.explore.map(({ cup }) => (
                <li key={cup.key} className="rounded-xl border border-dashed p-3 text-sm" style={{ borderColor: `${cup.color}77` }}>
                  <strong style={{ color: cup.color }}>{c.cups[cup.key].label}</strong>
                  <span className="mt-1 block text-[13px]">{c.cups[cup.key].tips.firstStep}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {dating.length > 0 && (
          <Section title={single ? t.datingTitleSingle : t.datingTitle}>
            <ul className="space-y-2">
              {dating.map((d) => (
                <li key={d.name} className="glass rounded-xl p-3">
                  <p className="text-sm font-semibold">{d.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{d.desc}</p>
                </li>
              ))}
            </ul>
            <TipList label={t.inPerson} items={c.community} />
            <p className="text-[11px] leading-relaxed text-muted-foreground">{c.datingNote}</p>
          </Section>
        )}

        {showSafety && (
          <Section title={t.safetyTitle}>
            <dl className="space-y-2 text-sm">
              {c.safety.map((r) => (
                <div key={r.title} className="glass rounded-xl p-3">
                  <dt className="font-semibold">{r.title}</dt>
                  <dd className="mt-0.5 text-xs text-muted-foreground">{r.text}</dd>
                </div>
              ))}
            </dl>
          </Section>
        )}

        <Tip locale={locale} t={t} />

        <footer className="space-y-3 border-t border-white/10 pt-6 text-center">
          <p className="text-[11px] text-muted-foreground">{t.privateNote}</p>
          <div className="flex flex-col gap-2">
            <Link href={`${href('/')}#parovy-kviz`} className="rounded-md border border-white/15 px-4 py-2.5 text-sm font-medium hover:bg-white/5">
              {t.tryQuiz}
            </Link>
            <Link href={href('/kinkometr')} className="text-xs text-muted-foreground underline">
              {t.retake}
            </Link>
          </div>
        </footer>
      </div>
    </KinkShell>
  );
}
