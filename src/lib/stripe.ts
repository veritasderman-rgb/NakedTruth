import Stripe from 'stripe';

// Server-only Stripe client. Throws lazily so missing config doesn't break the
// build — only callers (checkout / webhook) require it.
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  cached = new Stripe(key);
  return cached;
}

export const PRODUCTS = {
  tier_2: () => process.env.STRIPE_PRICE_TIER2,
} as const;
