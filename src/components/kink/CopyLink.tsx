'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

// Copies (or natively shares) an app-relative link.
export default function CopyLink({ path, label, shareText }: { path: string; label: string; shareText?: string }) {
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    const url = `${window.location.origin}${path}`;
    try {
      if (shareText && navigator.share) {
        await navigator.share({ text: shareText, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Share sheet dismissed or clipboard blocked — fall back to a prompt.
      window.prompt('Zkopírujte odkaz:', url);
    }
  };

  return (
    <Button type="button" onClick={handle} className="w-full">
      {copied ? 'Odkaz zkopírován ✓' : label}
    </Button>
  );
}
