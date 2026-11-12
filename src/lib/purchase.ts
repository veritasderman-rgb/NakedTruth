import type Stripe from 'stripe';
import { appUrl } from '@/lib/app-url';
import { countEvent } from '@/lib/events';
import { getExtra } from '@/lib/extra-content';
import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from '@/lib/i18n';
import { getKinkProfileByInvite, unlockPairReport, unlockReport } from '@/lib/kink-store';
import { normalizeEmail, sendPurchaseEmail, type PurchaseKind } from '@/lib/mail';
import { getReport } from '@/lib/report-content';
import { PAIR_KIND, REPORT_KIND, moneyLabel, stripe } from '@/lib/stripe';

// What a paid Checkout session bought, read from its metadata.
export type Bought =
  | { kind: 'report'; profile: string }
  | { kind: 'pair'; buyer: string; partner: string };

export function boughtBy(session: Stripe.Checkout.Session): Bought | null {
  const m = session.metadata ?? {};
  if (session.payment_status !== 'paid') return null;
  if (m.kind === REPORT_KIND && m.profile) return { kind: 'report', profile: m.profile };
  if (m.kind === PAIR_KIND && m.profile && m.partner) return { kind: 'pair', buyer: m.profile, partner: m.partner };
  return null;
}

export function sessionLocale(session: Stripe.Checkout.Session): Locale {
  return isLocale(session.metadata?.locale) ? session.metadata.locale : DEFAULT_LOCALE;
}

export function buyerEmail(session: Stripe.Checkout.Session): string | null {
  return normalizeEmail(session.customer_details?.email);
}

// Sends the confirmation required for digital content delivered at once.
export async function confirmByEmail(session: Stripe.Checkout.Session, kind: PurchaseKind, product: string, link: string, stored: boolean): Promise<void> {
  const email = buyerEmail(session);
  if (!email) return;
  const locale = sessionLocale(session);
  await sendPurchaseEmail({
    kind,
    email,
    locale,
    product,
    price: moneyLabel(locale, session.currency ?? 'czk', session.amount_total ?? 0),
    paidAt: new Date(session.created * 1000),
    link,
    stored,
  });
}

// Unlocks whatever a paid session bought. Called by both the Stripe webhook
// and the page the buyer returns to; the unlock is idempotent and only the
// call that performs it counts the sale and e-mails the confirmation.
export async function fulfil(session: Stripe.Checkout.Session): Promise<Bought | null> {
  const bought = boughtBy(session);
  if (!bought) return null;
  const locale = sessionLocale(session);
  const payment = typeof session.payment_intent === 'string' ? session.payment_intent : session.id;

  if (bought.kind === 'report') {
    const id = await unlockReport(bought.profile, payment, buyerEmail(session));
    if (id) {
      await countEvent('report_paid', locale);
      const link = `${appUrl()}${localePath(locale, `/kinkometr/rozbor/${id}`)}`;
      await confirmByEmail(session, 'report', getReport(locale).ui.productName, link, true);
    }
  } else if (await unlockPairReport(bought.buyer, bought.partner, payment)) {
    await countEvent('pair_paid', locale);
    const buyer = await getKinkProfileByInvite(bought.buyer);
    if (buyer) {
      const link = `${appUrl()}${localePath(locale, `/kinkometr/parovy-rozbor/${buyer.id}/${bought.partner}`)}`;
      await confirmByEmail(session, 'pair', getExtra(locale).ui.pairProductName, link, false);
    }
  }
  return bought;
}

// For the page the buyer returns to: fetch the Checkout session named in the
// URL and unlock what it paid for. Null when it is not a paid report session.
export async function fulfilReturn(sessionId: string): Promise<Bought | null> {
  if (!stripe || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;
  try {
    return await fulfil(await stripe.checkout.sessions.retrieve(sessionId));
  } catch (e) {
    console.error('[purchase] could not verify payment', e);
    return null;
  }
}
