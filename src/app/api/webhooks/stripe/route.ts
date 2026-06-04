import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Stripe webhook. On a completed checkout, grant the purchased entitlement to
// the user from the session metadata. Idempotent: the entitlements table has a
// unique (user_id, product_code) constraint and we ignore duplicates, so retried
// webhooks are safe.
export async function POST(req: Request) {
  if (!stripe) return Response.json({ error: 'stripe_not_configured' }, { status: 503 });

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: 'webhook_secret_missing' }, { status: 503 });

  const signature = req.headers.get('stripe-signature');
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature ?? '', secret);
  } catch (e) {
    console.error('[webhook] signature verification failed', e);
    return Response.json({ error: 'invalid_signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const productCode = session.metadata?.product_code || 'premium';
    const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : null;

    if (userId) {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.from('entitlements').upsert(
        {
          user_id: userId,
          product_code: productCode,
          source: 'stripe',
          stripe_payment_intent_id: paymentIntent,
        },
        { onConflict: 'user_id,product_code', ignoreDuplicates: true }
      );
      if (error) console.error('[webhook] failed to grant entitlement', error);
    } else {
      console.warn('[webhook] checkout.session.completed without user_id metadata');
    }
  }

  return Response.json({ received: true });
}
