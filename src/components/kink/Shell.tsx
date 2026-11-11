import Link from 'next/link';
import LangSwitch from './LangSwitch';
import { localePath, type Locale } from '@/lib/i18n';

// Frame shared by all Kinkometr pages: brand pill + language switcher.
export default function KinkShell({
  locale,
  brand,
  languageLabel,
  children,
}: {
  locale: Locale;
  brand: string;
  languageLabel: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-md px-5 py-6">
      <div className="mb-7 flex items-center justify-between gap-3">
        <Link href={localePath(locale, '/')} className="brand-pill">
          {brand}
        </Link>
        <LangSwitch locale={locale} label={languageLabel} />
      </div>
      {children}
    </main>
  );
}
