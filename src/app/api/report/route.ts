import { stripe, PAIR_KIND, REPORT_KIND, pairPricing, reportPricing } from '@/lib/stripe';
import { DEFAULT_LOCALE, isLocale, localePath } from '@/lib/i18n';
import { areConnected, getKinkProfile, getKinkProfileByInvite, isPairReportUnlocked } from '@/lib/kink-store';
import { getReport } from '@/lib/report-content';
import { getExtra } from '@/lib/extra-content';
import { appUrl } from '@/lib/app-url';

export const dynamic = 'force-dynamic';

// Stripe Checkout for a paid report. Without `other` it is the detailed report
// of one Kinkometr result; with `other` (the partner's invite token) it is the
// couple report for the two connected results. Results are identified to
// Stripe by their shareable invite tokens, never by a private id. On return
// the report page verifies the payment itself, so the unlock does not depend
// on the webhook being configured.
export async function POST(req: Request) {
  if (!stripe) return Response.json({ error: 'stripe_not_configured' }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const locale = isLocale(body.locale) ? body.locale : DEFAULT_LOCALE;
  const profile = await getKinkProfile(body.id).catch(() => null);
  if (!profile) return Response.json({ error: 'not_found' }, { status: 404 });

  const pair = typeof body.other === 'string';
  const partner = pair ? await getKinkProfileByInvite(body.other).catch(() => null) : null;
  if (pair && (!partner || !areConnected(profile, partner))) return Response.json({ error: 'not_found' }, { status: 404 });

  const path = partner ? `/kinkometr/parovy-rozbor/${profile.id}/${partner.inviteToken}` : `/kinkometr/rozbor/${profile.id}`;
  const page = `${appUrl()}${localePath(locale, path)}`;
  const unlocked = partner ? await isPairReportUnlocked(profile.inviteToken, partner.inviteToken) : profile.reportUnlocked;
  if (unlocked) return Response.json({ url: page });

  const { currency, minor } = partner ? pairPricing(locale) : reportPricing(locale);
  const name = partner ? getExtra(locale).ui.pairProductName : getReport(locale).ui.productName;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale,
      // Cards only: they settle at once, so the return page can verify and
      // unlock without waiting for a webhook. Delayed methods (bank debits,
      // vouchers) would leave a paying customer behind the paywall.
      payment_method_types: ['card'],
      line_items: [{ quantity: 1, price_data: { currency, unit_amount: minor, product_data: { name } } }],
      // The buy button is enabled only after the buyer ticks the consent to
      // immediate delivery; keep a record of it with the payment.
      metadata: {
        kind: partner ? PAIR_KIND : REPORT_KIND,
        profile: profile.inviteToken,
        ...(partner ? { partner: partner.inviteToken } : {}),
        locale,
        immediate_delivery_consent: 'yes',
      },
      success_url: `${page}?paid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${page}?cancelled=1`,
    });
    return Response.json({ url: session.url });
  } catch (e) {
    console.error('[report] checkout failed', e);
    return Response.json({ error: 'checkout_failed' }, { status: 500 });
  }
}
