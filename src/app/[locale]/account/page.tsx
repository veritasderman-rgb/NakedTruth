import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser, hasEntitlement } from '@/lib/auth';
import { AccountActions } from './AccountActions';

export const dynamic = 'force-dynamic';

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('account');

  const profile = await getCurrentUser();
  if (!profile) {
    redirect({ href: '/login', locale });
  }

  const tier2 = await hasEntitlement(profile!.id, 'tier_2');

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12">
      <Card className="w-full border-none shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('signedInAs', { email: profile!.email ?? '—' })}
          </p>
          <p className="text-sm">
            {tier2 ? `✅ ${t('tier2Owned')}` : t('tier2NotOwned')}
          </p>
          <AccountActions />
        </CardContent>
      </Card>
    </main>
  );
}
