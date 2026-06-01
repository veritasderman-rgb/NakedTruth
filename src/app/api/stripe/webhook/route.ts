import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Stripe webhook: grants entitlements on completed payment. Verifies the
// signature and is idempotent (unique index on stripe_payment_intent_id).
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'not configured' }, { status: 500 });
  }

  const stripe = getStripe();
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? '', secret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const profileId = session.metadata?.profile_id || session.client_reference_id;
    const productCode = session.metadata?.product_code || 'tier_2';
    const paymentIntent =
      typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

    if (profileId) {
      const admin = getSupabaseAdmin();
      const { error } = await admin.from('entitlements').upsert(
        {
          user_id: profileId,
          product_code: productCode,
          source: 'stripe',
          stripe_payment_intent_id: paymentIntent ?? null,
        },
        { onConflict: 'user_id,product_code' }
      );
      if (error) {
        console.error('Failed to grant entitlement:', error);
        return NextResponse.json({ error: 'db error' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
