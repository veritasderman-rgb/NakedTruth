import Link from 'next/link';
import { localePath, type Locale } from '@/lib/i18n';
import { LEGAL_LINKS } from '@/lib/legal';

// Links every page needs: terms and privacy.
export default function SiteFooter({ locale }: { locale: Locale }) {
  const links = LEGAL_LINKS[locale];
  return (
    <footer className="mx-auto flex w-full max-w-md flex-wrap items-center justify-center gap-x-4 gap-y-1 px-5 pb-8 pt-4 text-[11px] text-muted-foreground print:hidden">
      <span>© NakedTruth · 18+</span>
      <Link href={localePath(locale, '/podminky')} className="underline hover:text-foreground">
        {links.terms}
      </Link>
      <Link href={localePath(locale, '/soukromi')} className="underline hover:text-foreground">
        {links.privacy}
      </Link>
    </footer>
  );
}
