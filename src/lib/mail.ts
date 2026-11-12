import { Resend } from 'resend';
import type { Locale } from '@/lib/i18n';
import { getQuiz } from '@/lib/quiz-content';
import { getExtra } from '@/lib/extra-content';
import { fmt, localePath } from '@/lib/i18n';
import { appUrl } from '@/lib/app-url';
import { OPERATOR, OPERATOR_COMPLETE } from '@/lib/operator';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Configurable sender; defaults to Resend's shared onboarding domain so the app
// works before a custom domain is verified.
const FROM = process.env.EMAIL_FROM || 'NakedTruth <onboarding@resend.dev>';

export function isMailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your-resend-api-key';
}

// Shared, minimal email shell. `cta` is optional.
function layout(opts: { heading: string; body: string; footer: string; cta?: { label: string; href: string } }): string {
  const button = opts.cta
    ? `<a href="${opts.cta.href}" style="display:inline-block;margin-top:8px;padding:12px 28px;background-color:#F55229;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">${opts.cta.label}</a>`
    : '';
  return `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0a0a0a;">
      <p style="font-size:12px;letter-spacing:2px;color:#F55229;font-weight:700;margin:0 0 16px;">NAKEDTRUTH</p>
      <h1 style="font-size:22px;margin:0 0 12px;">${opts.heading}</h1>
      <div style="font-size:15px;line-height:1.6;color:#404040;">${opts.body}</div>
      ${button}
      <p style="font-size:11px;color:#a3a3a3;margin-top:32px;">${opts.footer}</p>
    </div>
  `;
}

// Resolves to whether the message was handed to Resend. Never throws: an
// e-mail failure must not break the request it belongs to.
async function send(to: string, subject: string, html: string): Promise<boolean> {
  if (!isMailConfigured()) {
    console.log('[mail] Resend not configured. Skipping email, subject:', subject);
    return false;
  }
  try {
    if (!resend) throw new Error('Resend client not initialized');
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[mail] Failed to send email, subject:', subject, error);
    return false;
  }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const email = raw.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

// Each e-mail is written in the language the session was started in.
type Kind = 'invite' | 'reminder' | 'results';

async function sendKind(kind: Kind, email: string, link: string, locale: Locale): Promise<void> {
  const t = getQuiz(locale);
  await send(
    email,
    t[`${kind}Subject`],
    layout({
      heading: t[`${kind}Heading`],
      body: `<p>${t[`${kind}Body`]}</p>`,
      footer: t.mailFooter,
      cta: { label: t[`${kind}Cta`], href: link },
    })
  );
}

export const sendInviteEmail = (email: string, link: string, locale: Locale) => sendKind('invite', email, link, locale);
export const sendReminderEmail = (email: string, link: string, locale: Locale) => sendKind('reminder', email, link, locale);
export const sendResultsReadyEmail = (email: string, link: string, locale: Locale) => sendKind('results', email, link, locale);

// Confirmation of a purchase in text form, as the Civil Code requires for
// digital content delivered at once: what was bought, for how much, when, and
// the buyer's consent to immediate delivery. `link` opens the bought content.
export type PurchaseKind = 'report' | 'pair' | 'premium';

export async function sendPurchaseEmail(opts: {
  kind: PurchaseKind;
  email: string;
  locale: Locale;
  product: string;
  price: string;
  paidAt: Date;
  link: string;
  // The address was stored with the result (report purchases).
  stored: boolean;
}): Promise<boolean> {
  const t = getExtra(opts.locale).ui;
  const K = ({ report: 'Report', pair: 'Pair', premium: 'Premium' } as const)[opts.kind];
  const date = new Intl.DateTimeFormat(opts.locale, { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Prague' }).format(opts.paidAt);
  const terms = `${appUrl()}${localePath(opts.locale, '/podminky')}`;
  const lines = [
    fmt(t.mailPurchaseBody, { product: esc(opts.product), price: esc(opts.price), date: esc(date) }),
    t.mailWaiver,
    ...(opts.kind === 'premium' ? [] : [t.mailKeepLink]),
    ...(opts.stored ? [t.mailStored] : []),
    ...(OPERATOR_COMPLETE ? [fmt(t.mailSeller, { seller: esc(`${OPERATOR.name}, IČO ${OPERATOR.id}, ${OPERATOR.address}`) })] : []),
    fmt(t.mailTerms, { url: `<a href="${terms}">${terms}</a>` }),
  ];
  return send(
    opts.email,
    t[`mail${K}Subject`],
    layout({
      heading: t[`mail${K}Heading`],
      body: lines.map((l) => `<p>${l}</p>`).join(''),
      footer: t.mailPurchaseFooter,
      cta: { label: t[`mail${K}Cta`], href: opts.link },
    })
  );
}

// Every private link we hold for an address.
export async function sendLinksEmail(email: string, locale: Locale, links: { label: string; href: string }[]): Promise<boolean> {
  const t = getExtra(locale).ui;
  const list = links.map((l) => `<li style="margin:0 0 8px;"><a href="${l.href}" style="color:#F55229;">${esc(l.label)}</a></li>`).join('');
  return send(
    email,
    t.mailLinksSubject,
    layout({ heading: t.mailLinksHeading, body: `<p>${t.mailLinksBody}</p><ul style="padding-left:18px;">${list}</ul>`, footer: t.mailLinksFooter })
  );
}
