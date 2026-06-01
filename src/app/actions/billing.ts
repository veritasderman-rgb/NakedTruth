'use server';

import { getStripe, PRODUCTS } from '@/lib/stripe';
import { getCurrentUser } from '@/lib/auth';
import { getLocale } from 'next-intl/server';
import { headers } from 'next/headers';

// Returned to the client so it can react (open checkout, or send to login).
export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; reason: 'auth_required' | 'error' };

async function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL !== 'undefined') {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  const host = (await headers()).get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

// Starts a Stripe Checkout for the tier_2 unlock. Entitlements are account-
// level, so an account is required first.
export async function createTier2Checkout(): Promise<CheckoutResult> {
  const profile = await getCurrentUser();
  if (!profile) return { ok: false, reason: 'auth_required' };

  const priceId = PRODUCTS.tier_2();
  if (!priceId) return { ok: false, reason: 'error' };

  try {
    const stripe = getStripe();
    const locale = await getLocale();
    const baseUrl = await getBaseUrl();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/${locale}/billing/success`,
      cancel_url: `${baseUrl}/${locale}/billing/cancel`,
      client_reference_id: profile.id,
      customer_email: profile.email ?? undefined,
      metadata: { profile_id: profile.id, product_code: 'tier_2' },
    });

    if (!session.url) return { ok: false, reason: 'error' };
    return { ok: true, url: session.url };
  } catch (err) {
    console.error('createTier2Checkout failed:', err);
    return { ok: false, reason: 'error' };
  }
}
