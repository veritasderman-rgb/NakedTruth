'use client';

import { useState } from 'react';
import { track } from '@/lib/track';

// Shares a link that carries only the three fullest cups — never the private
// result id. Uses the system share sheet where there is one.
export default function ShareCups({ path, t }: { path: string; t: Record<string, string> }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    track('kink_share_click');
    const url = `${window.location.origin}${path}`;
    try {
      if (navigator.share) {
        await navigator.share({ text: t.shareText, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // Share sheet dismissed: nothing to do. Clipboard blocked: show the link.
      if ((e as Error)?.name !== 'AbortError') window.prompt(t.shareText, url);
    }
  };

  return (
    <div className="space-y-1.5 text-center print:hidden">
      <button type="button" onClick={share} className="w-full rounded-md border border-white/15 px-4 py-2.5 text-sm font-medium hover:bg-white/5">
        {copied ? t.shareCopied : t.shareButton}
      </button>
      <p className="text-[11px] text-muted-foreground">{t.shareHint}</p>
    </div>
  );
}
