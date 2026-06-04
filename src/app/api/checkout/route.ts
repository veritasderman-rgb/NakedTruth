import { stripe, PREMIUM_PRICE_MINOR, PREMIUM_PRODUCT_CODE } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

// Creates a Stripe Checkout session for the one-time premium unlock and returns
// its URL. The user_id is stored in metadata so the webhook can grant the
// entitlement to the right account after payment.
export async function POST(req: Request) {
  if (!stripe) return Response.json({ error: 'stripe_not_configured' }, { status: 503 });

  const { userId, email } = await req.json().catch(() => ({ userId: undefined, email: undefined }));
  if (!userId) return Response.json({ error: 'missing_user' }, { status: 400 });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`;
  const metadata = { user_id: String(userId), product_code: PREMIUM_PRODUCT_CODE };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'czk',
            unit_amount: PREMIUM_PRICE_MINOR,
            product_data: { name: 'NakedTruth Premium — odemčení prémiových balíčků' },
          },
        },
      ],
      customer_email: email || undefined,
      metadata,
      // Mirror metadata onto the PaymentIntent for easier reconciliation.
      payment_intent_data: { metadata },
      success_url: `${baseUrl}/?premium=success`,
      cancel_url: `${baseUrl}/?premium=cancelled`,
    });

    return Response.json({ url: session.url });
  } catch (e) {
    console.error('[checkout] failed', e);
    return Response.json({ error: 'checkout_failed' }, { status: 500 });
  }
}
