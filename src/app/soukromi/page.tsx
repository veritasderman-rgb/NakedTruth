import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import { getLegal } from '@/lib/legal';
import { getLocale } from '@/lib/locale';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${getLegal(await getLocale()).privacy.title} | NakedTruth` };
}

export default async function Page() {
  return <LegalPage locale={await getLocale()} doc="privacy" />;
}
