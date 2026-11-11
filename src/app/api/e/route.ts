import { countEvent, isEventName } from '@/lib/events';

export const dynamic = 'force-dynamic';

// Counts one anonymous event. Only names from the allowlist are accepted and
// nothing about the caller is stored.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!isEventName(body.name)) return new Response(null, { status: 400 });
  await countEvent(body.name, body.locale);
  return new Response(null, { status: 204 });
}
