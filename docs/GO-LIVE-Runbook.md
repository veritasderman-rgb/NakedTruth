# NakedTruth — Go-Live Runbook (konfigurace P0)

> Kód je hotový a v PR #15. Tento runbook je **konfigurace prostředí**, bez které appka nepoběží.
> Pořadí dodržet: **1) Supabase migrace → 2) Supabase Auth → 3) Stripe → 4) Vercel ENV → 5) smoke test.**
> `<APP_URL>` = veřejná adresa nasazení (např. `https://naked-truth.vercel.app` nebo vlastní doména).

---

## Co budeš potřebovat (účty)
- Přístup do **Supabase** projektu (ten, který appka používá).
- Přístup do **Stripe** (Dashboard, ideálně nejdřív Test mode).
- Přístup do **Vercel** projektu `naked-truth`.
- (Volitelně) **PostHog** projekt pro analytiku.
- (Volitelně) **Resend** pro e-maily (jinak appka e-maily jen „mockuje" do logu).

---

## KROK 1 — Spustit SQL migrace v Supabase

**Kde:** Supabase Dashboard → vlevo **SQL Editor** → **New query** → vložit obsah → **Run** (Ctrl/Cmd+Enter).

Spusť **v tomto pořadí** obsah těchto souborů z repozitáře (každý jako samostatný query):

1. `supabase/migrations/20260601_question_translations.sql`
   — vytvoří tabulku `question_translations` a přesune 300 českých otázek + vyparsuje škály `(1=…,5=…)`.
2. `supabase/migrations/20260601_auth_and_entitlements.sql`
   — přidá `users.auth_user_id`, tabulku `entitlements`, funkci `has_entitlement` a **přepíše RPC `create_next_session`** (paywall pro tier_2).
3. `supabase/migrations/20260601_enable_rls.sql`
   — zapne Row Level Security (deny-by-default na citlivých tabulkách, veřejné čtení jen otázek).

> Pozn.: Pokud projekt ještě nemá základ, spusť nejdřív `supabase/schema.sql`, `supabase/seed_questions.sql` a `supabase/migrations/20260312_add_session_preferences.sql`.

### Ověření (spusť po migracích)
```sql
-- 1) Mělo by vrátit ~300 (počet otázek) s lokalizací 'cs'
select count(*) as cs_preklady from public.question_translations where locale = 'cs';

-- 2) U frequency otázek mají být vyplněné škály (cca 88 řádků)
select count(*) as se_skalami from public.question_translations where scale_low is not null;

-- 3) Sloupec auth_user_id existuje
select column_name from information_schema.columns
where table_schema='public' and table_name='users' and column_name='auth_user_id';

-- 4) Funkce a tabulka existují
select proname from pg_proc where proname in ('has_entitlement','create_next_session');
select to_regclass('public.entitlements') as entitlements_table;

-- 5) RLS je zapnuté na citlivých tabulkách (vše true)
select relname, relrowsecurity from pg_class
where relname in ('answers','sessions','entitlements','users') order by relname;
```
✅ Hotovo, když: bod 1 ≈ 300, bod 2 ≈ 88, body 3–4 vrací řádky, bod 5 má všude `true`.

---

## KROK 2 — Supabase Auth (magic link)

**A) Zapnout e-mailový provider**
- Authentication → **Sign In / Providers** (či **Providers**) → **Email** → zapnout.
- Magic link funguje přes Email provider; „Confirm email" může být zapnuté i vypnuté (pro magic link není potřeba heslo).

**B) Nastavit URL (klíčové pro callback)**
- Authentication → **URL Configuration**:
  - **Site URL:** `<APP_URL>`
  - **Redirect URLs** (Add URL) — přidej obě:
    - `<APP_URL>/auth/callback`
    - `<APP_URL>/**`  (wildcard, ať fungují i locale cesty)

**C) (volitelně) SMTP**
- Bez vlastního SMTP používá Supabase sdílený mailer s limity (na test stačí). Pro produkci nastav vlastní SMTP (Authentication → Emails → SMTP).

✅ Hotovo, když: v Redirect URLs je `<APP_URL>/auth/callback` a Email provider je `Enabled`.

---

## KROK 3 — Stripe (jednorázové odemčení tier_2)

> Doporučení: nejdřív vše ve **Test mode**, ověřit, pak přepnout do **Live** a zopakovat (klíče i webhook jsou pro test/live oddělené!).

**A) Vytvořit produkt a cenu**
- Stripe Dashboard → **Product catalog** → **Add product**.
- Name: `NakedTruth — Pod peřinou (odemčení)`.
- Pricing: **One-off / jednorázově**, měna **CZK**, částka např. **199**.
- Save → otevři vytvořenou cenu → **zkopíruj Price ID** (`price_…`). → půjde do `STRIPE_PRICE_TIER2`.

**B) API klíče**
- Developers → **API keys**:
  - **Secret key** (`sk_…`) → `STRIPE_SECRET_KEY`
  - **Publishable key** (`pk_…`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**C) Webhook**
- Developers → **Webhooks** → **Add endpoint**.
- Endpoint URL: `<APP_URL>/api/stripe/webhook`
- **Select events:** přidej **`checkout.session.completed`** (stačí tento).
- Add endpoint → otevři ho → **Reveal signing secret** (`whsec_…`) → `STRIPE_WEBHOOK_SECRET`.

✅ Hotovo, když: máš 4 hodnoty — `price_…`, `sk_…`, `pk_…`, `whsec_…`.

---

## KROK 4 — ENV proměnné na Vercelu

**Kde:** Vercel → projekt `naked-truth` → **Settings** → **Environment Variables**.
Pro každou: Name + Value, scope zaškrtni **Production** (a klidně i **Preview**). Předloha je `.env.example`.

| Name | Hodnota / kde ji vzít |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → **API** → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → **anon public** key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → **service_role** (tajné!) |
| `NEXT_PUBLIC_APP_URL` | `<APP_URL>` (bez lomítka na konci) |
| `STRIPE_SECRET_KEY` | Stripe `sk_…` |
| `STRIPE_WEBHOOK_SECRET` | Stripe `whsec_…` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe `pk_…` |
| `STRIPE_PRICE_TIER2` | Stripe `price_…` |
| `RESEND_API_KEY` | Resend → API Keys (volitelné; bez něj se e-maily jen logují) |
| `RESEND_FROM` | např. `NakedTruth <ahoj@tvojedomena.cz>` (volitelné, jen u ověřené domény) |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog → Project Settings → Project API Key `phc_…` (volitelné) |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://eu.i.posthog.com` (nebo us; volitelné) |

**Po uložení proveď redeploy**, aby se nové proměnné načetly:
- Vercel → **Deployments** → poslední deployment → **⋯** → **Redeploy** (necho „Use existing build cache" odškrtnuté).

✅ Hotovo, když: na úvodní stránce **nezobrazí** žlutý box „Chybí konfigurace" (ten je beztak jen mimo produkci) a stránka jde otevřít.

---

## KROK 5 — Smoke test (po nasazení)

1. Otevři `<APP_URL>` → přesměruje na `<APP_URL>/cs`. ✅
2. **Free kolo:** zvol „Vztahy & soužití", 10 otázek, „Začít anonymně" → vyplň → na konci je obrazovka pozvánky s odkazem. ✅
3. **Autosave:** uprostřed kvízu obnov stránku (F5) → kvíz pokračuje tam, kde jsi skončil/a. ✅
4. **Druhý partner:** otevři invite odkaz v anonymním okně → vyplň → u prvního partnera (po obnovení) se zobrazí **reveal s % shody**. ✅
5. **Paywall:** na úvodu zvol „Pod peřinou" → po potvrzení 18+ tě to pošle na přihlášení / Stripe checkout (ne dovnitř zdarma). ✅
6. **Auth:** `<APP_URL>/cs/login` → zadej e-mail → přijde magic link → po kliknutí jsi na `/cs/account`. ✅
7. **Platba (test):** projdi Stripe checkout test kartou `4242 4242 4242 4242` → po úspěchu na `/billing/success`; v Supabase přibude řádek v `entitlements`. ✅
8. **Po platbě** lze spustit tier_2 kolo bez paywallu. ✅

> Když bod 7 neudělí nárok: zkontroluj v Stripe → Webhooks → tvůj endpoint → **záložku s pokusy**, jestli `checkout.session.completed` vrací `200`. Když ne, ověř `STRIPE_WEBHOOK_SECRET` a že URL je přesně `<APP_URL>/api/stripe/webhook`.

---

## Časté chyby
- **Webhook 400 „invalid signature":** špatný/chybějící `STRIPE_WEBHOOK_SECRET`, nebo test secret u live klíčů (a naopak).
- **Magic link nikam nevede:** chybí `<APP_URL>/auth/callback` v Supabase Redirect URLs.
- **Otázky obsahují „(1=…,5=…)" v textu:** nespuštěná migrace `question_translations`.
- **„PAYWALL" i pro vanilla:** spustila se jen část migrace `auth_and_entitlements` — pusť celý soubor znovu (je idempotentní).
- **Nové ENV se neprojevily:** chybí redeploy.
