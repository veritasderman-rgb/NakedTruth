import { stripe, REPORT_KIND, reportPricing } from '@/lib/stripe';
import { DEFAULT_LOCALE, isLocale, localePath } from '@/lib/i18n';
import { getKinkProfile } from '@/lib/kink-store';
import { getReport } from '@/lib/report-content';

export const dynamic = 'force-dynamic';

// Stripe Checkout for the detailed report of one Kinkometr result. The result
// is identified to Stripe by its shareable invite token, never by its private
// id. On return the report page verifies the payment itself, so the unlock
// does not depend on the webhook being configured.
export async function POST(req: Request) {
  if (!stripe) return Response.json({ error: 'stripe_not_configured' }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const locale = isLocale(body.locale) ? body.locale : DEFAULT_LOCALE;
  const profile = await getKinkProfile(body.id).catch(() => null);
  if (!profile) return Response.json({ error: 'not_found' }, { status: 404 });

  const origin = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`;
  const page = `${origin}${localePath(locale, `/kinkometr/rozbor/${profile.id}`)}`;
  if (profile.reportUnlocked) return Response.json({ url: page });

  const { currency, minor } = reportPricing(locale);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale,
      line_items: [
        {
          quantity: 1,
          price_data: { currency, unit_amount: minor, product_data: { name: getReport(locale).ui.productName } },
        },
      ],
      metadata: { kind: REPORT_KIND, profile: profile.inviteToken, locale },
      success_url: `${page}?paid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${page}?cancelled=1`,
    });
    return Response.json({ url: session.url });
  } catch (e) {
    console.error('[report] checkout failed', e);
    return Response.json({ error: 'checkout_failed' }, { status: 500 });
  }
}
