import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendInviteEmail(email: string, inviteLink: string) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key') {
    console.log('Resend API Key not set. Mocking email to:', email, 'Link:', inviteLink);
    return;
  }

  try {
    if (!resend) throw new Error('Resend client not initialized');
    await resend.emails.send({
      from: 'NakedTruth <onboarding@resend.dev>',
      to: email,
      subject: 'You have been invited to a NakedTruth session',
      html: `
        <h1>Get closer with your partner</h1>
        <p>Your partner has completed their part of a NakedTruth session and is waiting for you.</p>
        <p>Click the link below to start your session. Your answers will be private until you both finish.</p>
        <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px;">Start Session</a>
      `,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}
