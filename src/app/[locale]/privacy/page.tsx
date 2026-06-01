import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal');
  const tc = await getTranslations('common');

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12 space-y-6">
      <h1 className="text-2xl font-bold">{t('privacyTitle')}</h1>
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          NakedTruth zpracovává pouze údaje nezbytné pro fungování služby: e-mailovou adresu
          (pokud ji zadáte), vaše odpovědi v kvízu a technické identifikátory relace. Odpovědi
          jsou viditelné výhradně vám a vašemu partnerovi v rámci dané relace.
        </p>
        <p>
          <strong>Analytika.</strong> Anonymní statistiky používání sbíráme jen s vaším souhlasem
          (cookie lišta). Do analytiky nikdy neposíláme obsah vašich odpovědí.
        </p>
        <p>
          <strong>Platby.</strong> Platby zpracovává Stripe; neukládáme údaje o platebních kartách.
        </p>
        <p>
          <strong>Vaše práva (GDPR).</strong> Máte právo na přístup k údajům a na jejich výmaz.
          Smazání všech dat provedete kdykoliv v sekci „Můj účet". Po smazání jsou data nevratně
          odstraněna.
        </p>
        <p>
          <strong>Uchování.</strong> Data uchováváme po dobu používání služby. Anonymní relace bez
          účtu mohou být po čase automaticky odstraněny.
        </p>
        <p>
          Kontakt pro ochranu údajů: nakedtruth podpora (doplňte kontaktní e-mail provozovatele).
        </p>
      </div>
      <Link href="/" className="inline-block text-sm underline hover:text-foreground">
        {tc('backHome')}
      </Link>
    </main>
  );
}
