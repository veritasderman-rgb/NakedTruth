import { stripe, isTipTier, tipPricing } from '@/lib/stripe';
import { isLocale, DEFAULT_LOCALE } from '@/lib/i18n';
import { getContent } from '@/lib/kink-content';

export const dynamic = 'force-dynamic';

// Stripe Checkout for a voluntary tip. Nothing is unlocked by it, so there is
// no webhook to wait for: the visitor simply comes back with ?tip=thanks.
export async function POST(req: Request) {
  if (!stripe) return Response.json({ error: 'stripe_not_configured' }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  if (!isTipTier(body.tier)) return Response.json({ error: 'invalid_tier' }, { status: 400 });
  const locale = isLocale(body.locale) ? body.locale : DEFAULT_LOCALE;

  // Return to the page the tip came from — same origin only.
  const origin = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`;
  const back = typeof body.back === 'string' && /^\/[^/\\]/.test(body.back) ? body.back.split('?')[0] : '/';

  const { currency, amounts } = tipPricing(locale);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: locale === 'cs' ? 'cs' : locale,
      submit_type: 'donate',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amounts[body.tier as keyof typeof amounts] * 100,
            product_data: { name: getContent(locale).ui.tipProduct },
          },
        },
      ],
      metadata: { kind: 'tip', tier: body.tier, locale },
      success_url: `${origin}${back}?tip=thanks`,
      cancel_url: `${origin}${back}?tip=cancelled`,
    });
    return Response.json({ url: session.url });
  } catch (e) {
    console.error('[tip] failed', e);
    return Response.json({ error: 'checkout_failed' }, { status: 500 });
  }
}
