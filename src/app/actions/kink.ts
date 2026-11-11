'use server';

import { getSql, isUuid } from '@/lib/db';
import { isKinkMode, scoreAnswers } from '@/lib/kink';

// Stores an anonymous Kinkometr result and returns its id — the private link
// to the result page. Cups are always recomputed on the server.
export async function saveKinkProfile(
  mode: string,
  answers: Record<string, unknown>,
  partnerOf?: string
): Promise<{ id: string }> {
  if (!isKinkMode(mode)) throw new Error('Neznámý typ testu');
  const scored = scoreAnswers(mode, answers ?? {});
  if (!scored) throw new Error('Test není kompletní. Zkuste to prosím znovu.');

  const sql = getSql();

  // Only link to an inviter that really exists.
  let partnerId: string | null = null;
  if (isUuid(partnerOf)) {
    const [inviter] = await sql`select id from kink_profiles where id = ${partnerOf}`;
    partnerId = inviter?.id ?? null;
  }

  const [row] = await sql`
    insert into kink_profiles (partner_of, mode, answers, cups)
    values (${partnerId}, ${mode}, ${JSON.stringify(scored.clean)}::jsonb, ${JSON.stringify(scored.cups)}::jsonb)
    returning id`;

  return { id: row.id };
}
