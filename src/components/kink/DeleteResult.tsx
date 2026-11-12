'use client';

import { useState } from 'react';
import { deleteKinkProfile } from '@/app/actions/kink';
import type { Locale } from '@/lib/i18n';

// "Delete my result": the self-service way to erase everything we hold.
export default function DeleteResult({ id, locale, t }: { id: string; locale: Locale; t: Record<string, string> }) {
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    if (!window.confirm(t.deleteConfirm)) return;
    setBusy(true);
    await deleteKinkProfile(id, locale);
  };

  return (
    <button type="button" onClick={handle} disabled={busy} className="text-xs text-muted-foreground underline disabled:opacity-50 print:hidden">
      {busy ? t.deleting : t.deleteResult}
    </button>
  );
}
