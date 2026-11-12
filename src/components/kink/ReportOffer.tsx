'use client';

import { useState } from 'react';
import Link from 'next/link';
import { fmt, localePath, type Locale } from '@/lib/i18n';
import { track } from '@/lib/track';

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
  t: Record<string, string>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Required by law: explicit consent to immediate delivery of digital content.
  const [waiver, setWaiver] = useState(false);

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
        </>
      )}
      {(error || notice) && <p className="rounded-md bg-white/5 p-2 text-xs text-yellow-200">{error || notice}</p>}
    </section>
  );
}
