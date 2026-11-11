import type { Metadata } from 'next';
import KinkShell from '@/components/kink/Shell';
import { isDbConfigured } from '@/lib/db';
import { isKinkMode, type KinkMode } from '@/lib/kink';
import { getKinkProfileByInvite } from '@/lib/kink-store';
import KinkTest from './KinkTest';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kinkometr — jak plné máte poháry? | NakedTruth',
  description:
    'Anonymní test sexuálních preferencí: 23 pohárů od něhy po BDSM. Zjistěte, co vás láká, co ne a čím si nejste jistí — a dostaňte tipy na aktivity, polohy i místa.',
};

export default async function KinkometrPage({
  searchParams,
}: {
  searchParams: Promise<{ partner?: string; mode?: string }>;
}) {
  const { partner, mode } = await searchParams;

  // Coming from somebody's invite: take the same test so the cups line up.
  // `partner` is the inviter's shareable token, never their private id.
  let inviteToken: string | null = null;
  let lockedMode: KinkMode | null = null;
  if (partner && isDbConfigured()) {
    const inviter = await getKinkProfileByInvite(partner).catch(() => null);
    if (inviter) {
      inviteToken = inviter.inviteToken;
      lockedMode = inviter.mode;
    }
  }

  return (
    <KinkShell>
      <KinkTest
        initialMode={lockedMode ?? (isKinkMode(mode) ? mode : 'full')}
        lockedMode={lockedMode !== null}
        inviteToken={inviteToken}
        isConfigured={isDbConfigured()}
      />
    </KinkShell>
  );
}
