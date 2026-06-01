'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

const AGE_KEY = 'nt_age_ok';

export function hasAgeConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(AGE_KEY) === '1';
}

// 18+ confirmation modal, shown before any tier_2 ("pod peřinou") content.
// Persists the choice locally so users aren't re-prompted every time.
export function AgeGate({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations('age');
  const tl = useTranslations('legal');
  const [denied, setDenied] = useState(false);

  const confirm = () => {
    if (typeof window !== 'undefined') window.localStorage.setItem(AGE_KEY, '1');
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl">
        {denied ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">{t('denied')}</p>
            <Button variant="outline" className="w-full" onClick={onCancel}>
              {t('deny')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t('title')}</h2>
            <p className="text-sm text-muted-foreground">{t('desc')}</p>
            <p className="text-[11px] text-muted-foreground">
              {t.rich('legalNote', {
                terms: () => (
                  <Link href="/terms" className="underline" target="_blank">
                    {tl('termsLink')}
                  </Link>
                ),
                privacy: () => (
                  <Link href="/privacy" className="underline" target="_blank">
                    {tl('privacyLink')}
                  </Link>
                ),
              })}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDenied(true)}>
                {t('deny')}
              </Button>
              <Button className="flex-1" onClick={confirm}>
                {t('confirm')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
