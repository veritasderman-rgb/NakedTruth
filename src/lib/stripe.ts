import Stripe from 'stripe';
import type { Locale } from '@/lib/i18n';

// Single Stripe client. Null when unconfigured so the app still builds/runs
// without keys; the checkout/webhook routes return 503 in that case.
export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// One-time premium unlock. CZK is charged in haléř (the minor unit), so 29 Kč
// is 2900.
export const PREMIUM_PRICE_CZK = 29;
export const PREMIUM_PRICE_MINOR = PREMIUM_PRICE_CZK * 100;
export const PREMIUM_PRODUCT_CODE = 'premium';

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
