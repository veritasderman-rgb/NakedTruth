'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { signOut, deleteMyData } from '@/app/actions/auth';

export function AccountActions() {
  const t = useTranslations('account');

  const confirmDelete = async () => {
    if (typeof window !== 'undefined' && !window.confirm(t('deleteConfirm'))) return;
    await deleteMyData();
  };

  return (
    <div className="space-y-2 pt-2">
      <form action={signOut}>
        <Button type="submit" variant="outline" className="w-full">
          {t('signOut')}
        </Button>
      </form>
      <Button variant="ghost" className="w-full text-destructive hover:text-destructive" onClick={confirmDelete}>
        {t('deleteData')}
      </Button>
    </div>
  );
}
