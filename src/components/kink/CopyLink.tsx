'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { track } from '@/lib/track';

// Copies an app-relative link to the clipboard.
export default function CopyLink({
  path,
  label,
  copiedLabel,
  promptLabel,
}: {
  path: string;
  label: string;
  copiedLabel: string;
  promptLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    track('invite_copied');
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked — fall back to a prompt the user can copy from.
      window.prompt(promptLabel, url);
    }
  };

  return (
    <Button type="button" onClick={handle} className="w-full">
      {copied ? copiedLabel : label}
    </Button>
  );
}
