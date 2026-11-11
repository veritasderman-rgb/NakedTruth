'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { DEFAULT_LOCALE, LOCALES, LOCALE_NAMES, localePath, type Locale } from '@/lib/i18n';

// Links to the same page in every language. Plain <a> on purpose: a full
// navigation lets the middleware remember the choice.
export default function LangSwitch({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() || '/';
  const prefix = new RegExp(`^/(${LOCALES.filter((l) => l !== DEFAULT_LOCALE).join('|')})(?=/|$)`);
  const bare = pathname.replace(prefix, '') || '/';

  // Carry the query along (an invite's ?partner=…, ?mode=…) so switching
  // language does not turn an invited test into a solo one. Read after mount:
  // the server render has no access to it here.
  const [query, setQuery] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete('lang');
    params.delete('tip');
    setQuery(params.toString());
  }, [pathname]);

  const hrefFor = (l: Locale) => {
    const params = new URLSearchParams(query);
    if (l === DEFAULT_LOCALE) params.set('lang', DEFAULT_LOCALE);
    const qs = params.toString();
    return `${localePath(l, bare)}${qs ? `?${qs}` : ''}`;
  };

  return (
    <nav aria-label={label} className="flex flex-wrap items-center gap-1 text-[11px]">
      {LOCALES.map((l) => (
        <a
          key={l}
          href={hrefFor(l)}
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
