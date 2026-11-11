import type { Metadata } from 'next';
import KinkShell from '@/components/kink/Shell';
import { isDbConfigured } from '@/lib/db';
import { isKinkMode, type KinkMode } from '@/lib/kink';
import { getKinkProfile } from '@/lib/kink-store';
import KinkTest from './KinkTest';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kinkometr — jak plné máte poháry? | NakedTruth',
  description:
    'Anonymní test sexuálních preferencí: 12 pohárů od něhy po BDSM. Zjistěte, co vás láká, co ne a čím si nejste jistí — a dostaňte tipy na aktivity, polohy i místa.',
};

export default async function KinkometrPage({
  searchParams,
}: {
  searchParams: Promise<{ partner?: string; mode?: string }>;
}) {
  const { partner, mode } = await searchParams;

  // Coming from somebody's invite: take the same test so the cups line up.
  let partnerId: string | null = null;
  let lockedMode: KinkMode | null = null;
  if (partner && isDbConfigured()) {
    const inviter = await getKinkProfile(partner).catch(() => null);
    if (inviter) {
      partnerId = inviter.id;
      lockedMode = inviter.mode;
    }
  }

  return (
    <KinkShell>
      <KinkTest
        initialMode={lockedMode ?? (isKinkMode(mode) ? mode : 'full')}
        lockedMode={lockedMode !== null}
        partnerId={partnerId}
        isConfigured={isDbConfigured()}
      />
    </KinkShell>
  );
}
