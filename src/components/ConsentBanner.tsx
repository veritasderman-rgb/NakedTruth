'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { hasConsentChoice, setAnalyticsConsent } from '@/lib/analytics';

// Lightweight consent banner. Analytics stays off until the user accepts,
// satisfying the "consent before tracking" requirement (package E + F).
export function ConsentBanner() {
  const t = useTranslations('consent');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!hasConsentChoice());
  }, []);

  if (!visible) return null;

  const choose = (granted: boolean) => {
    setAnalyticsConsent(granted);
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 p-4 backdrop-blur">
      <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {t('message')}{' '}
          <Link href="/privacy" className="underline hover:text-foreground">
            {t('privacyLink')}
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => choose(false)}>
            {t('reject')}
          </Button>
          <Button size="sm" onClick={() => choose(true)}>
            {t('accept')}
          </Button>
        </div>
      </div>
    </div>
  );
}
