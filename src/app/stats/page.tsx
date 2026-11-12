import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSql } from '@/lib/db';
import { EVENTS } from '@/lib/events';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Stats | NakedTruth', robots: { index: false, follow: false } };

// Steps of the Kinkometr funnel, in order, with the share of the previous step.
const FUNNEL = ['kink_intro_view', 'kink_start', 'kink_round1_done', 'kink_saved', 'kink_result_view', 'report_buy_click', 'report_paid'] as const;

// Owner-only overview of the anonymous counters: /stats?key=<STATS_KEY>.
export default async function StatsPage({ searchParams }: { searchParams: Promise<{ key?: string; days?: string }> }) {
  const { key, days: rawDays } = await searchParams;
  const secret = process.env.STATS_KEY;
  if (!secret || key !== secret) notFound();

  const days = Math.max(1, Math.min(365, Number.parseInt(rawDays ?? '30', 10) || 30));
  const sql = getSql();
  const totals = await sql`
    select name, sum(count)::int as n from events
    where day > current_date - ${days}::int group by name`;
  const byLocale = await sql`
    select locale, sum(count)::int as n from events
    where day > current_date - ${days}::int and name = 'kink_saved' group by locale order by n desc`;
  const daily = await sql`
    select to_char(day, 'YYYY-MM-DD') as day,
           coalesce(sum(count) filter (where name = 'home_view'), 0)::int as home,
           coalesce(sum(count) filter (where name = 'kink_start'), 0)::int as started,
           coalesce(sum(count) filter (where name in ('kink_saved', 'kink_saved_invited')), 0)::int as finished,
           coalesce(sum(count) filter (where name = 'report_paid'), 0)::int as reports,
           coalesce(sum(count) filter (where name = 'quiz_start'), 0)::int as quizzes
    from events where day > current_date - ${days}::int group by day order by day desc`;

  const total = (name: string) => totals.find((r) => r.name === name)?.n ?? 0;
  const cell = 'border-b border-white/10 px-2 py-1.5 text-right tabular-nums';

  return (
    <main className="mx-auto w-full max-w-3xl space-y-10 px-5 py-8">
      <header>
        <h1 className="text-2xl font-bold">Stats — last {days} days</h1>
        <p className="text-xs text-muted-foreground">Anonymous daily counters. Page views include reloads and some bots; actions do not. report_paid counts each unlocked report once; pair_paid likewise; tip_paid and premium_paid need the Stripe webhook and stay at zero without it.</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Kinkometr funnel</h2>
        <table className="w-full text-sm">
          <tbody>
            {FUNNEL.map((name, i) => {
              const n = total(name);
              const prev = i > 0 ? total(FUNNEL[i - 1]) : 0;
              return (
                <tr key={name}>
                  <td className="border-b border-white/10 px-2 py-1.5">{name}</td>
                  <td className={cell}>{n}</td>
                  <td className={`${cell} text-muted-foreground`}>{i > 0 && prev > 0 ? `${Math.round((n / prev) * 100)} %` : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">All events</h2>
        <table className="w-full text-sm">
          <tbody>
            {EVENTS.map((name) => (
              <tr key={name}>
                <td className="border-b border-white/10 px-2 py-1.5">{name}</td>
                <td className={cell}>{total(name)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Finished tests by language</h2>
        <p className="text-sm">{byLocale.length > 0 ? byLocale.map((r) => `${r.locale}: ${r.n}`).join(' · ') : '—'}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">By day</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="px-2 py-1.5 text-left font-medium">Day</th>
              {['Home', 'Started', 'Finished', 'Reports', 'Quizzes'].map((h) => (
                <th key={h} className="px-2 py-1.5 text-right font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {daily.map((r) => (
              <tr key={r.day}>
                <td className="border-b border-white/10 px-2 py-1.5">{r.day}</td>
                <td className={cell}>{r.home}</td>
                <td className={cell}>{r.started}</td>
                <td className={cell}>{r.finished}</td>
                <td className={cell}>{r.reports}</td>
                <td className={cell}>{r.quizzes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
