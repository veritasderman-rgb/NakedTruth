import type { Metadata } from 'next';
import KinkShell from '@/components/kink/Shell';
import { isDbConfigured } from '@/lib/db';
import { fmt } from '@/lib/i18n';
import { CUPS, isKinkMode, type CupKey, type KinkMode } from '@/lib/kink';
import { getContent } from '@/lib/kink-content';
import { getKinkProfileByInvite } from '@/lib/kink-store';
import { getLocale } from '@/lib/locale';
import KinkTest, { type TestContent } from './KinkTest';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { ui } = getContent(await getLocale());
  return { title: ui.kinkMetaTitle, description: fmt(ui.kinkMetaDesc, { n: CUPS.length }) };
}

export default async function KinkometrPage({
  searchParams,
}: {
  searchParams: Promise<{ partner?: string; mode?: string }>;
}) {
  const { partner, mode } = await searchParams;
  const locale = await getLocale();
  const content = getContent(locale);

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

  // Only what the test needs goes to the browser — no tips, no dating list.
  const test: TestContent = {
    ui: content.ui,
    groups: content.groups,
    modes: content.modes,
    answers: content.answers,
    cups: Object.fromEntries(
      (Object.keys(content.cups) as CupKey[]).map((k) => {
        const { label, desc, base, deep } = content.cups[k];
        return [k, { label, desc, base, deep }];
      })
    ) as TestContent['cups'],
  };

  return (
    <KinkShell locale={locale} brand={content.ui.brand} languageLabel={content.ui.language}>
      <KinkTest
        locale={locale}
        content={test}
        initialMode={lockedMode ?? (isKinkMode(mode) ? mode : 'full')}
        lockedMode={lockedMode !== null}
        inviteToken={inviteToken}
        isConfigured={isDbConfigured()}
      />
    </KinkShell>
  );
}
