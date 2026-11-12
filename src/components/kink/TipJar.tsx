'use client';

import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/i18n';
import { track } from '@/lib/track';

type Tier = 's' | 'm' | 'l';

// Voluntary tip: three fixed amounts, paid through Stripe Checkout.
export default function TipJar({
  locale,
  currency,
  amounts,
  t,
}: {
  locale: Locale;
  currency: string;
  amounts: Record<Tier, number>;
  t: Record<string, string>;
}) {
  const [busy, setBusy] = useState<Tier | null>(null);
  const [notice, setNotice] = useState<'thanks' | 'cancelled' | 'unavailable' | null>(null);

  // Outcome of a returning Stripe Checkout redirect.
  useEffect(() => {
    const tip = new URLSearchParams(window.location.search).get('tip');
    if (tip === 'thanks' || tip === 'cancelled') setNotice(tip);
  }, []);

  const price = (tier: Tier) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amounts[tier]);

  const pay = async (tier: Tier) => {
    track('tip_click');
    setBusy(tier);
    setNotice(null);
    try {
      const res = await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, locale, back: window.location.pathname }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setNotice('unavailable');
    } catch {
      setNotice('unavailable');
    }
    setBusy(null);
  };

  const tiers: { tier: Tier; emoji: string; label: string }[] = [
    { tier: 's', emoji: '☕', label: t.tipS },
    { tier: 'm', emoji: '🥛', label: t.tipM },
    { tier: 'l', emoji: '🍰', label: t.tipL },
  ];

  return (
    <section id="tip" className="glass space-y-3 rounded-2xl p-4 text-center">
      {notice === 'thanks' ? (
        <p className="py-3 text-base font-semibold">{t.tipThanks}</p>
      ) : (
        <>
          <h2 className="text-base font-semibold">{t.tipTitle}</h2>
          <p className="text-xs text-muted-foreground">{t.tipLead}</p>
          <div className="grid grid-cols-3 gap-2">
            {tiers.map(({ tier, emoji, label }) => (
              <button
                key={tier}
                type="button"
                disabled={busy !== null}
                onClick={() => pay(tier)}
                className="rounded-xl border border-white/15 bg-white/5 px-2 py-3 transition-all hover:border-primary hover:bg-primary/10 disabled:opacity-50"
              >
                <span aria-hidden className="block text-xl">{emoji}</span>
                <span className="mt-1 block text-sm font-semibold">{busy === tier ? '…' : price(tier)}</span>
                <span className="block text-[10px] leading-tight text-muted-foreground">{label}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">
            {busy ? t.tipRedirect : notice === 'cancelled' ? t.tipCancelled : notice === 'unavailable' ? t.tipUnavailable : t.tipSecure}
          </p>
        </>
      )}
    </section>
  );
}
