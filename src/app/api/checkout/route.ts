import { stripe, PREMIUM_PRODUCT_CODE, premiumPricing } from '@/lib/stripe';
import { DEFAULT_LOCALE, isLocale, localePath } from '@/lib/i18n';
import { getQuiz } from '@/lib/quiz-content';

export const dynamic = 'force-dynamic';

// Creates a Stripe Checkout session for the one-time premium unlock and returns
// its URL. The user_id is stored in metadata so the webhook can grant the
// entitlement to the right account after payment.
export async function POST(req: Request) {
  if (!stripe) return Response.json({ error: 'stripe_not_configured' }, { status: 503 });

  const { userId, email, locale: rawLocale } = await req.json().catch(() => ({ userId: undefined, email: undefined, locale: undefined }));
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const { currency, minor } = premiumPricing(locale);
  if (!userId) return Response.json({ error: 'missing_user' }, { status: 400 });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`;
  // The locale lets the confirmation e-mail go out in the buyer's language.
  const metadata = { user_id: String(userId), product_code: PREMIUM_PRODUCT_CODE, locale };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: minor,
            product_data: { name: getQuiz(locale).premiumProduct },
          },
        },
      ],
      customer_email: email || undefined,
      metadata,
      // Mirror metadata onto the PaymentIntent for easier reconciliation.
      payment_intent_data: { metadata },
      success_url: `${baseUrl}${localePath(locale, '/')}?premium=success`,
      cancel_url: `${baseUrl}${localePath(locale, '/')}?premium=cancelled`,
    });

    return Response.json({ url: session.url });
  } catch (e) {
    console.error('[checkout] failed', e);
    return Response.json({ error: 'checkout_failed' }, { status: 500 });
  }
}
