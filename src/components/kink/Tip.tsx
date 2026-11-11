import TipJar from './TipJar';
import { tipPricing } from '@/lib/stripe';
import type { Locale } from '@/lib/i18n';

// Server wrapper: resolves the tip prices for the locale.
export default function Tip({ locale, t }: { locale: Locale; t: Record<string, string> }) {
  const { currency, amounts } = tipPricing(locale);
  return <TipJar locale={locale} currency={currency} amounts={amounts} t={t} />;
}
