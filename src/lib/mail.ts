import { Resend } from 'resend';
import type { Locale } from '@/lib/i18n';
import { getQuiz } from '@/lib/quiz-content';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Configurable sender; defaults to Resend's shared onboarding domain so the app
// works before a custom domain is verified.
const FROM = process.env.EMAIL_FROM || 'NakedTruth <onboarding@resend.dev>';

function isConfigured(): boolean {
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

async function send(to: string, subject: string, html: string): Promise<void> {
  if (!isConfigured()) {
    console.log('[mail] Resend not configured. Skipping email to:', to, '| subject:', subject);
    return;
  }
  try {
    if (!resend) throw new Error('Resend client not initialized');
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (error) {
    // Never let email failures break the request flow.
    console.error('[mail] Failed to send email to', to, error);
  }
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
