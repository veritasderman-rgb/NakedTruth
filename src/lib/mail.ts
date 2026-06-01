import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Use a verified sending domain when available, otherwise Resend's sandbox.
const FROM = process.env.RESEND_FROM || 'NakedTruth <onboarding@resend.dev>';

type InviteCopy = { subject: string; heading: string; body: string; cta: string };

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

export async function sendInviteEmail(email: string, inviteLink: string, locale: string = 'cs') {
  const copy = INVITE_COPY[locale] ?? INVITE_COPY.cs;

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key') {
    console.log('Resend API Key not set. Mocking email to:', email, 'Link:', inviteLink);
    return;
  }

  try {
    if (!resend) throw new Error('Resend client not initialized');
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: copy.subject,
      html: `
        <h1>${copy.heading}</h1>
        <p>${copy.body}</p>
        <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px;">${copy.cta}</a>
      `,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}
