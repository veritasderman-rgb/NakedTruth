import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function BillingCancel({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('billing');

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <Card className="w-full border-none shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">{t('cancelTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">{t('cancelDesc')}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border px-6 py-3 text-sm font-medium hover:bg-accent"
          >
            {t('cancelCta')}
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
