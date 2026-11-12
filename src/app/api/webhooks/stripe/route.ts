import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { getSql, isUuid } from '@/lib/db';
import { PAIR_KIND, REPORT_KIND } from '@/lib/stripe';
import { countEvent } from '@/lib/events';
import { confirmByEmail, fulfil, sessionLocale } from '@/lib/purchase';
import { appUrl } from '@/lib/app-url';
import { localePath } from '@/lib/i18n';
import { getQuiz } from '@/lib/quiz-content';

export const dynamic = 'force-dynamic';

// Stripe webhook. On a completed checkout, grant the purchased entitlement to
// the user from the session metadata. Idempotent: the entitlements table has a
// unique (user_id, product_code) constraint and duplicates are ignored, so retried
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

  // Stripe retries deliveries; handle each event only once.
  try {
    const first = await getSql()`insert into stripe_events (id) values (${event.id}) on conflict do nothing returning id`;
    if (first.length === 0) return Response.json({ received: true, duplicate: true });
  } catch (e) {
    console.error('[webhook] could not record event', e);
    return Response.json({ error: 'storage_failed' }, { status: 500 });
  }

  // False when something the event calls for is still owed (an unlock that
  // threw, a confirmation e-mail that did not go out): Stripe is then asked
  // to deliver the event again.
  let done = true;

  // async_payment_succeeded covers delayed payment methods, where the session
  // completes unpaid and the money arrives later.
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const productCode = session.metadata?.product_code || 'premium';
    const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : null;

    if (session.metadata?.kind === REPORT_KIND || session.metadata?.kind === PAIR_KIND) {
      // Detailed or couple report: unlock what the payment was made for.
      try {
        const result = await fulfil(session);
        if (result && !result.confirmed) done = false;
      } catch (e) {
        console.error('[webhook] failed to unlock report', e);
        done = false;
      }
    } else if (session.metadata?.kind === 'tip') {
      // Tips unlock nothing; a confirmed one is counted here, once.
      if (session.payment_status === 'paid') await countEvent('tip_paid', session.metadata.locale);
    } else if (session.payment_status === 'unpaid') {
      // A delayed payment that has not arrived yet: wait for the async event.
    } else if (isUuid(userId)) {
      try {
        const granted = await getSql()`
          insert into entitlements (user_id, product_code, source, stripe_payment_intent_id)
          values (${userId}, ${productCode}, 'stripe', ${paymentIntent})
          on conflict (user_id, product_code) do nothing returning user_id`;
        const locale = sessionLocale(session);
        if (granted.length > 0) await countEvent('premium_paid', locale);
        if (!(await confirmByEmail(session, 'premium', getQuiz(locale).premiumProduct, `${appUrl()}${localePath(locale, '/')}`, false))) done = false;
      } catch (error) {
        console.error('[webhook] failed to grant entitlement', error);
        done = false;
      }
    } else {
      console.warn('[webhook] checkout.session.completed without a valid user_id in metadata');
    }
  }

  if (!done) {
    // Forget the event so the retry is handled, and answer with an error so
    // Stripe retries. Every step above is idempotent.
    await getSql()`delete from stripe_events where id = ${event.id}`.catch((e) => console.error('[webhook] could not release event', e));
    return Response.json({ error: 'incomplete' }, { status: 500 });
  }

  return Response.json({ received: true });
}
