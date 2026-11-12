import { revalidatePath } from 'next/cache';
import { appUrl } from '@/lib/app-url';
import { getSql } from '@/lib/db';
import { newVipCode, normalizeVipCode } from '@/lib/vip';

// The stats key doubles as the owner's password for these actions.
function allowed(form: FormData): boolean {
  const secret = process.env.STATS_KEY;
  return !!secret && form.get('key') === secret;
}

async function createCode(form: FormData) {
  'use server';
  if (!allowed(form)) return;
  const int = (name: string, max: number) => {
    const n = Number.parseInt(String(form.get(name) ?? ''), 10);
    return Number.isNaN(n) || n <= 0 ? null : Math.min(n, max);
  };
  const note = String(form.get('note') ?? '').trim().slice(0, 120) || null;
  const uses = int('uses', 100000);
  const days = int('days', 3650);
  await getSql()`
    insert into vip_codes (code, note, max_uses, expires_at)
    values (${newVipCode()}, ${note}, ${uses}, ${days ? new Date(Date.now() + days * 86400000).toISOString() : null})`;
  revalidatePath('/stats');
}

async function disableCode(form: FormData) {
  'use server';
  if (!allowed(form)) return;
  const code = normalizeVipCode(form.get('code'));
  if (code) await getSql()`update vip_codes set expires_at = now() where code = ${code}`;
  revalidatePath('/stats');
}

const field = 'rounded-md border border-white/15 bg-transparent px-2 py-1.5 text-sm';

// Owner-only: create VIP codes and see how much each has been used.
export default async function VipCodes({ statsKey }: { statsKey: string }) {
  const codes = await getSql()`
    select code, note, max_uses, uses, to_char(expires_at, 'YYYY-MM-DD') as expires,
           (expires_at is not null and expires_at <= now()) as expired
    from vip_codes order by created_at desc limit 200`;
  const cell = 'border-b border-white/10 px-2 py-1.5';

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">VIP codes</h2>
        <p className="text-xs text-muted-foreground">
          A code unlocks the detailed report, the couple report and the premium quiz packs without payment. Each unlock takes one use. Send the link: opening it stores the code in that browser for 30 days.
        </p>
      </div>
      <form action={createCode} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="key" value={statsKey} />
        <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-muted-foreground">
          Note (who it is for)
          <input name="note" className={field} maxLength={120} />
        </label>
        <label className="flex w-24 flex-col gap-1 text-xs text-muted-foreground">
          Max uses
          <input name="uses" type="number" min={1} defaultValue={10} className={field} />
        </label>
        <label className="flex w-28 flex-col gap-1 text-xs text-muted-foreground">
          Valid for days
          <input name="days" type="number" min={1} defaultValue={30} className={field} />
        </label>
        <button type="submit" className="btn-glow rounded-md px-4 py-2 text-sm font-medium">Create code</button>
      </form>
      <p className="text-[11px] text-muted-foreground">Leave “Max uses” or “Valid for days” empty for no limit.</p>
      {codes.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-2 py-1.5 font-medium">Link</th>
              <th className="px-2 py-1.5 font-medium">Note</th>
              <th className="px-2 py-1.5 text-right font-medium">Used</th>
              <th className="px-2 py-1.5 font-medium">Expires</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.code} className={c.expired ? 'opacity-50' : ''}>
                <td className={`${cell} select-all break-all font-mono text-xs`}>{`${appUrl()}/vip/${c.code}`}</td>
                <td className={cell}>{c.note ?? ''}</td>
                <td className={`${cell} text-right tabular-nums`}>{c.uses}{c.max_uses ? ` / ${c.max_uses}` : ''}</td>
                <td className={cell}>{c.expired ? 'disabled' : c.expires ?? 'never'}</td>
                <td className={cell}>
                  {!c.expired && (
                    <form action={disableCode}>
                      <input type="hidden" name="key" value={statsKey} />
                      <input type="hidden" name="code" value={c.code} />
                      <button type="submit" className="text-xs underline">Disable</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
