'use client';

import { useState } from 'react';
import { requestLinks, saveResultEmail, type AccessResult } from '@/app/actions/access';
import type { Locale } from '@/lib/i18n';

// One e-mail field and a button. With `resultId` it stores the address with
// that Kinkometr result and mails the link; without it, it mails every link
// already stored for the address.
export default function EmailLinkForm({
  locale,
  resultId,
  button,
  sentText,
  t,
}: {
  locale: Locale;
  resultId?: string;
  button: string;
  sentText: string;
  t: Record<string, string>;
}) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<AccessResult | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setState(null);
    try {
      setState(resultId ? await saveResultEmail(resultId, email, locale) : await requestLinks(email, locale));
    } catch {
      setState('failed');
    }
    setBusy(false);
  };

  if (state === 'sent') return <p className="rounded-md bg-white/5 p-3 text-sm">{sentText}</p>;

  const message = { invalid: t.invalidEmail, throttled: t.tooMany, unavailable: t.mailUnavailable, failed: t.mailFailed };
  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.emailPlaceholder}
          aria-label="E-mail"
          className="min-w-0 flex-1 rounded-md border border-white/15 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button type="submit" disabled={busy} className="btn-glow shrink-0 rounded-md px-4 py-2.5 text-sm font-medium disabled:opacity-60">
          {busy ? t.sending : button}
        </button>
      </div>
      {state && <p className="rounded-md bg-white/5 p-2 text-xs text-yellow-200">{message[state]}</p>}
    </form>
  );
}
