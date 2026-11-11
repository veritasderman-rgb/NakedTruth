import Stripe from 'stripe';
import type { Locale } from '@/lib/i18n';

// Single Stripe client. Null when unconfigured so the app still builds/runs
// without keys; the checkout/webhook routes return 503 in that case.
export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// One-time premium unlock: 29 Kč on the Czech site, 1.49 € elsewhere. Amounts
// are in the minor unit (haléř / cent), as Stripe expects.
export const PREMIUM_PRODUCT_CODE = 'premium';

export function premiumPricing(locale: Locale): { currency: 'czk' | 'eur'; minor: number } {
  return locale === 'cs' ? { currency: 'czk', minor: 2900 } : { currency: 'eur', minor: 149 };
}

// "29 Kč" / "€1.49" for display.
export function premiumPriceLabel(locale: Locale): string {
  const { currency, minor } = premiumPricing(locale);
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: minor % 100 === 0 ? 0 : 2 }).format(minor / 100);
}

// Detailed Kinkometr report, unlocked per result: 79 Kč / 3.49 €.
export const REPORT_KIND = 'report';

export function reportPricing(locale: Locale): { currency: 'czk' | 'eur'; minor: number } {
  return locale === 'cs' ? { currency: 'czk', minor: 7900 } : { currency: 'eur', minor: 349 };
}

export function reportPriceLabel(locale: Locale): string {
  const { currency, minor } = reportPricing(locale);
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: minor % 100 === 0 ? 0 : 2 }).format(minor / 100);
}

// Voluntary "buy the author a coffee" tips. Three fixed tiers; Czech visitors
// pay in CZK, everybody else in EUR. Amounts are in major units.
export type TipTier = 's' | 'm' | 'l';
export const TIP_TIERS: TipTier[] = ['s', 'm', 'l'];

export function tipPricing(locale: Locale): { currency: 'czk' | 'eur'; amounts: Record<TipTier, number> } {
  return locale === 'cs'
    ? { currency: 'czk', amounts: { s: 49, m: 99, l: 199 } }
    : { currency: 'eur', amounts: { s: 2, m: 5, l: 10 } };
}

export function isTipTier(value: unknown): value is TipTier {
  return value === 's' || value === 'm' || value === 'l';
}
