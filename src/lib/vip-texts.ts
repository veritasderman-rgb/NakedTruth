import { rememberedVip } from '@/lib/vip';

// What the paywall needs for its VIP field: wording plus the remembered code.
export async function vipProps(x: Record<string, string>) {
  return { have: x.vipHave, placeholder: x.vipPlaceholder, apply: x.vipApply, invalid: x.vipInvalid, code: await rememberedVip() };
}
