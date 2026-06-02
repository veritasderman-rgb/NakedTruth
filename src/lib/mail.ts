import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Use a verified sending domain when available, otherwise Resend's sandbox.
const FROM = process.env.RESEND_FROM || 'NakedTruth <onboarding@resend.dev>';

type InviteCopy = { subject: string; heading: string; body: string; cta: string };

// Result so callers (and ultimately the UI) can react to failures instead of
// silently assuming success.
export type SendResult = { ok: boolean; mocked?: boolean; error?: string };

// Locale-keyed email copy. Adding a language = adding an entry here.
const INVITE_COPY: Record<string, InviteCopy> = {
  cs: {
    subject: 'Máte pozvánku do NakedTruth',
    heading: 'Poznejte se navzájem upřímně',
    body: 'Váš partner dokončil svou část kvízu NakedTruth a čeká na vás. Klikněte na odkaz níže a odpovězte na stejné otázky. Vaše odpovědi zůstanou skryté, dokud nedokončíte oba.',
    cta: 'Spustit kvíz',
  },
  en: {
    subject: 'You have a NakedTruth invitation',
    heading: 'Get closer with your partner',
    body: 'Your partner has completed their part of a NakedTruth quiz and is waiting for you. Click the link below to answer the same questions. Your answers stay hidden until you both finish.',
    cta: 'Start quiz',
  },
};

export async function sendInviteEmail(
  email: string,
  inviteLink: string,
  locale: string = 'cs'
): Promise<SendResult> {
  const copy = INVITE_COPY[locale] ?? INVITE_COPY.cs;

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key') {
    console.log('Resend API Key not set. Mocking email to:', email, 'Link:', inviteLink);
    return { ok: false, mocked: true, error: 'RESEND_API_KEY not configured' };
  }

  try {
    if (!resend) return { ok: false, error: 'Resend client not initialized' };

    // Resend does NOT throw on API errors — it returns { data, error }.
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: copy.subject,
      html: `
        <h1>${copy.heading}</h1>
        <p>${copy.body}</p>
        <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px;">${copy.cta}</a>
      `,
    });

    if (error) {
      console.error('Resend returned an error:', error);
      return { ok: false, error: error.message || String(error) };
    }

    console.log('Invite email sent:', data?.id);
    return { ok: true };
  } catch (err: any) {
    console.error('Failed to send email:', err);
    return { ok: false, error: err?.message || 'send failed' };
  }
}
