import type Stripe from 'stripe';
import { appUrl } from '@/lib/app-url';
import { countEvent } from '@/lib/events';
import { getExtra } from '@/lib/extra-content';
import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from '@/lib/i18n';
import { getKinkProfileByInvite, unlockPairReport, unlockReport } from '@/lib/kink-store';
import { isMailConfigured, normalizeEmail, sendPurchaseEmail, type PurchaseKind } from '@/lib/mail';
import { getSql } from '@/lib/db';
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

// Sends the confirmation required for digital content delivered at once —
// exactly once per Checkout session, however many times it is asked. Delivery
// is tracked apart from the unlock, so a send that failed is tried again by
// the next call. False means it is still owed and the caller should retry.
export async function confirmByEmail(session: Stripe.Checkout.Session, kind: PurchaseKind, product: string, link: string, stored: boolean): Promise<boolean> {
  const email = buyerEmail(session);
  // No address, or no mail service at all: nothing a retry could change.
  if (!email || !isMailConfigured()) return true;
  const sql = getSql();
  // Claim the send. A claim older than two minutes without a delivery is a
  // failed attempt and may be taken over.
  const claimed = await sql`
    insert into purchase_confirmations (session_id) values (${session.id})
    on conflict (session_id) do update set claimed_at = now()
      where purchase_confirmations.sent_at is null and purchase_confirmations.claimed_at < now() - interval '2 minutes'
    returning session_id`;
  if (claimed.length === 0) {
    const [row] = await sql`select sent_at from purchase_confirmations where session_id = ${session.id}`;
    return !!row?.sent_at;
  }
  const locale = sessionLocale(session);
  const sent = await sendPurchaseEmail({
    kind,
    email,
    locale,
    product,
    price: moneyLabel(locale, session.currency ?? 'czk', session.amount_total ?? 0),
    paidAt: new Date(session.created * 1000),
    link,
    stored,
    idempotencyKey: `purchase-confirmation/${session.id}`,
  });
  if (sent) await sql`update purchase_confirmations set sent_at = now() where session_id = ${session.id}`;
  return sent;
}

// Unlocks whatever a paid session bought and makes sure its confirmation went
// out. Called by both the Stripe webhook and the page the buyer returns to.
// The unlock is idempotent and only the call that performs it counts the
// sale. `confirmed` is false while the confirmation e-mail is still owed.
export async function fulfil(session: Stripe.Checkout.Session): Promise<{ bought: Bought; confirmed: boolean } | null> {
  const bought = boughtBy(session);
  if (!bought) return null;
  const locale = sessionLocale(session);
  const payment = typeof session.payment_intent === 'string' ? session.payment_intent : session.id;
  const url = (path: string) => `${appUrl()}${localePath(locale, path)}`;

  if (bought.kind === 'report') {
    const unlockedId = await unlockReport(bought.profile, payment, buyerEmail(session));
    if (unlockedId) await countEvent('report_paid', locale);
    const id = unlockedId ?? (await getKinkProfileByInvite(bought.profile))?.id;
    // The result may have been deleted since; then there is nothing to link to.
    const confirmed = id ? await confirmByEmail(session, 'report', getReport(locale).ui.productName, url(`/kinkometr/rozbor/${id}`), true) : true;
    return { bought, confirmed };
  }

  if (await unlockPairReport(bought.buyer, bought.partner, payment)) await countEvent('pair_paid', locale);
  const buyer = await getKinkProfileByInvite(bought.buyer);
  const confirmed = buyer
    ? await confirmByEmail(session, 'pair', getExtra(locale).ui.pairProductName, url(`/kinkometr/parovy-rozbor/${buyer.id}/${bought.partner}`), false)
    : true;
  return { bought, confirmed };
}

// For the page the buyer returns to: fetch the Checkout session named in the
// URL and unlock what it paid for. Null when it is not a paid report session.
export async function fulfilReturn(sessionId: string): Promise<Bought | null> {
  if (!stripe || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;
  try {
    return (await fulfil(await stripe.checkout.sessions.retrieve(sessionId)))?.bought ?? null;
  } catch (e) {
    console.error('[purchase] could not verify payment', e);
    return null;
  }
}
