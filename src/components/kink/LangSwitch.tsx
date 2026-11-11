'use client';

import { usePathname } from 'next/navigation';
import { DEFAULT_LOCALE, LOCALES, LOCALE_NAMES, localePath, type Locale } from '@/lib/i18n';

// Links to the same page in every language. Plain <a> on purpose: a full
// navigation lets the middleware remember the choice.
export default function LangSwitch({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() || '/';
  const prefix = new RegExp(`^/(${LOCALES.filter((l) => l !== DEFAULT_LOCALE).join('|')})(?=/|$)`);
  const bare = pathname.replace(prefix, '') || '/';

  return (
    <nav aria-label={label} className="flex flex-wrap items-center gap-1 text-[11px]">
      {LOCALES.map((l) => (
        <a
          key={l}
          href={l === DEFAULT_LOCALE ? `${bare}?lang=${DEFAULT_LOCALE}` : localePath(l, bare)}
          hrefLang={l}
          lang={l}
          aria-current={l === locale ? 'true' : undefined}
          title={LOCALE_NAMES[l]}
          className={`rounded-full px-2 py-1 uppercase tracking-wide transition-colors ${
            l === locale ? 'bg-white/15 font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {l}
        </a>
      ))}
    </nav>
  );
}
