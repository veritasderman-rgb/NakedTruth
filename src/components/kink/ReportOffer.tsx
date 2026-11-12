'use client';

import { useState } from 'react';
import Link from 'next/link';
import { fmt, localePath, type Locale } from '@/lib/i18n';
import { track } from '@/lib/track';
import { useRouter } from 'next/navigation';
import { redeemVip } from '@/app/actions/vip';

// Teaser + buy button for the paid detailed report. When the report is already
// unlocked it turns into a plain link to it.
export default function ReportOffer({
  id,
  locale,
  price,
  unlocked,
  reportPath,
  notice,
  other,
  sampleLabel,
  vip,
  t,
}: {
  // The viewer's private result id.
  id: string;
  locale: Locale;
  price: string;
  unlocked: boolean;
  reportPath: string;
  notice?: string | null;
  // Partner's invite token: sells the couple report instead.
  other?: string;
  // Label of a link to the free sample (shown on the result page).
  sampleLabel?: string;
  // VIP wording, and the code remembered in this browser (if any).
  vip: { have: string; placeholder: string; apply: string; invalid: string; code: string | null };
  t: Record<string, string>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Required by law: explicit consent to immediate delivery of digital content.
  const [waiver, setWaiver] = useState(false);
  const router = useRouter();
  const [vipOpen, setVipOpen] = useState(!!vip.code);
  const [vipCode, setVipCode] = useState(vip.code ?? '');

  // A VIP code unlocks without payment; the page then shows the content.
  const redeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if ((await redeemVip(vipCode, id, other)) === 'ok') {
        if (window.location.pathname === reportPath) router.refresh();
        else router.push(reportPath);
        return;
      }
      setError(vip.invalid);
    } catch {
      setError(vip.invalid);
    }
    setBusy(false);
  };

  const buy = async () => {
    track(other ? 'pair_buy_click' : 'report_buy_click');
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, locale, other }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error === 'stripe_not_configured' ? t.unavailable : t.failed);
    } catch {
      setError(t.failed);
    }
    setBusy(false);
  };

  return (
    <section className="glass-primary space-y-3 rounded-2xl p-5 print:hidden">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight">{t.teaserTitle}</h2>
        {unlocked && <span className="brand-pill">{t.unlockedBadge}</span>}
      </div>
      <p className="text-sm text-muted-foreground">{t.teaserLead}</p>
      <ul className="space-y-1.5 text-sm">
        {[t.item1, t.item2, t.item3, t.item4, t.item5].map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden className="text-primary">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {unlocked ? (
        <Link href={reportPath} className="btn-glow block rounded-xl px-6 py-3.5 text-center text-sm font-semibold">
          {t.open}
        </Link>
      ) : (
        <>
          <label className="flex cursor-pointer items-start gap-2 text-[11px] text-muted-foreground">
            <input type="checkbox" checked={waiver} onChange={(e) => setWaiver(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]" />
            <span>
              {t.waiver}{' '}
              <a href={localePath(locale, '/podminky')} target="_blank" rel="noopener" className="underline">
                {t.termsLink}
              </a>
            </span>
          </label>
          <button type="button" onClick={buy} disabled={busy || !waiver} className="btn-glow w-full rounded-xl px-6 py-3.5 text-sm font-semibold disabled:opacity-60">
            {busy ? t.redirecting : fmt(t.buy, { price })}
          </button>
          <p className="text-[11px] text-muted-foreground">{t.oneTime}</p>
          {sampleLabel && (
            <Link href={reportPath} className="block rounded-xl border border-white/15 px-6 py-3 text-center text-sm font-medium hover:bg-white/5">
              {sampleLabel}
            </Link>
          )}
          {vipOpen ? (
            <form onSubmit={redeem} className="flex gap-2" data-testid="vip">
              <input
                value={vipCode}
                onChange={(e) => setVipCode(e.target.value)}
                placeholder={vip.placeholder}
                aria-label={vip.placeholder}
                autoCapitalize="characters"
                spellCheck={false}
                className="min-w-0 flex-1 rounded-md border border-white/15 bg-transparent px-3 py-2.5 text-sm uppercase outline-none focus:border-primary"
              />
              <button type="submit" disabled={busy || vipCode.trim() === ''} className="shrink-0 rounded-md border border-primary px-4 py-2.5 text-sm font-medium text-primary disabled:opacity-60">
                {vip.apply}
              </button>
            </form>
          ) : (
            <button type="button" onClick={() => setVipOpen(true)} className="block w-full text-center text-[11px] text-muted-foreground underline">
              {vip.have}
            </button>
          )}
        </>
      )}
      {(error || notice) && <p className="rounded-md bg-white/5 p-2 text-xs text-yellow-200">{error || notice}</p>}
    </section>
  );
}
