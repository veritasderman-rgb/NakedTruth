import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function TermsPage({
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
      <h1 className="text-2xl font-bold">{t('termsTitle')}</h1>
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          NakedTruth je zábavní a komunikační nástroj pro páry. Není náhradou odborné psychologické
          ani párové terapie.
        </p>
        <p>
          <strong>Věkové omezení.</strong> Pikantní (intimní) obsah je určen výhradně osobám starším
          18 let. Používáním tohoto obsahu potvrzujete, že je vám alespoň 18 let.
        </p>
        <p>
          <strong>Obsah a chování.</strong> Odpovídáte za obsah, který do služby zadáváte. Zavazujete
          se nepoužívat službu k nezákonným účelům ani k obtěžování jiných osob.
        </p>
        <p>
          <strong>Placený obsah.</strong> Odemčení pikantního obsahu je jednorázový nákup vázaný na
          váš účet. Platby zpracovává Stripe.
        </p>
        <p>
          <strong>Odpovědnost.</strong> Služba je poskytována „tak, jak je". Provozovatel neodpovídá za
          případné důsledky vyplývající z používání služby mezi partnery.
        </p>
        <p>
          Provozovatel si vyhrazuje právo tyto podmínky aktualizovat. (Doplňte identifikaci
          provozovatele a kontaktní údaje.)
        </p>
      </div>
      <Link href="/" className="inline-block text-sm underline hover:text-foreground">
        {tc('backHome')}
      </Link>
    </main>
  );
}
