# NakedTruth — Technický plán kola P0

> Zpracováno: 2026-06-01 · Větev: `claude/stoic-lamport-CbtDE`
> Rozsah kola: **Analytika · 18+/Privacy · Stripe · Autosave · Kratší free kolo · Lokalizované e-maily · i18n infrastruktura**

## Schválená rozhodnutí (vstup do plánu)

| Oblast | Rozhodnutí |
|---|---|
| **i18n** | Postavit kompletní infrastrukturu (next-intl, locale routing, překladová tabulka otázek v DB). Obsah teď jen **CZ**; EN a další jazyky se doplní jen daty, bez přepisu kódu. |
| **Identita / platby** | Zavést **Supabase Auth (magic link)**. Entitlement (nárok na placený obsah) vázaný na **účet**, ne na odkaz. |
| **Paywall** | **tier_1 (vztahová) kola zdarma neomezeně.** Platí se pouze za **tier_2 obsah** („pod peřinou") a tematické balíčky. |

---

## 0. Současný stav (co máme) — východisko

- **Datový model:** custom tabulka `public.users` (NE Supabase `auth.users`), `couples`, `couple_members`, `questions` (jeden text `prompt`, bez jazyka), `sessions`, `session_questions`, `answers`. Identita = anonymní/e-mailový uživatel + UUID access tokeny v URL.
- **Logika:** vše jede přes `service_role` klienta v Server Actions (`src/app/actions/session.ts`). RPC `create_next_session` (výběr otázek dle tier_pref, non-repeating) a `complete_partner_submission`.
- **Žádné:** RLS politiky (vše přes service role), auth, i18n, platby, analytika, age-gate, autosave, právní stránky.
- **Stringy:** napevno česky v komponentách. Otázky napevno česky v DB.
- **E-mail:** `src/lib/mail.ts` přes Resend, text **anglicky**, doména `onboarding@resend.dev`.

Tři rozhodnutí výše dohromady znamenají, že tohle kolo je **architektonicky nejvýznamnější** dosud — zejména zavedení auth a jeho smíření se stávajícím `users` modelem. Proto níže navrhuji i pořadí, aby se práce nezablokovala sama o sebe.

---

## 1. Architektura cílového stavu

### 1.1 Identita — sjednocení na Supabase Auth

**Problém:** Máme vlastní `public.users` (s anonymními řádky a access tokeny). Supabase Auth má vlastní `auth.users`. Nemůžeme mít dva zdroje pravdy.

**Řešení — `public.users` zůstává „profilová" tabulka, navázaná na `auth.users`:**
- Přidat `public.users.auth_user_id uuid references auth.users(id)` (nullable — anonymní zůstanou bez něj).
- Magic-link přihlášení vytvoří/spáruje `auth.users` ↔ `public.users` (přes e-mail; pokud `public.users` s tím e-mailem existuje z dřívějška, spárovat, jinak založit).
- **Anonymní flow zůstává zachován** (partner B přes odkaz se nemusí registrovat). Auth je *volitelná nadstavba*, která:
  - umožní vlastnit entitlement (placený tier_2),
  - dá historii a obnovu přístupu,
  - umožní „přihlásit se a nárok mám napořád".
- **Migrace dat:** stávající e-mailoví uživatelé se spárují při prvním přihlášení dle e-mailu (žádná destruktivní migrace).

> Důsledek: `getSupabaseAdmin()` (service role) zůstává pro serverové akce, ale přidáme **SSR auth klienta** (`@supabase/ssr`) pro čtení session přihlášeného uživatele.

### 1.2 Entitlements (nárok na placený obsah)

Nová tabulka `public.entitlements`:
```
id, user_id (-> public.users), product_code (text: 'tier_2' | 'pack_intimacy' | ...),
source (text: 'stripe' | 'grant'), stripe_payment_intent_id, granted_at, expires_at (null = napořád)
```
- Nárok **na úrovni uživatele** (rozhodnutí: vázané na účet).
- Tier_2 odemčení = `product_code = 'tier_2'`, `expires_at = null` (jednorázově napořád).
- Tematické balíčky = vlastní `product_code`.
- **Kontrola nároku** se přesune do RPC `create_next_session` (viz 1.4) — server-side, nepodvoditelné z klienta.

### 1.3 i18n datový model otázek

**Problém:** `questions.prompt` je jeden český text; škálové popisky jsou zaškatulkované přímo v textu (`(1 = …, 5 = …)`) a parsované regexem v UI. To je pro i18n neudržitelné.

**Řešení — překladová tabulka:**
```
public.question_translations (
  id, question_id (-> questions), locale text ('cs'|'en'|...),
  prompt text,
  scale_low text,   -- místo regexu z promptu
  scale_high text,
  unique(question_id, locale)
)
```
- `questions` si ponechá `tier`, `kind`, `is_active` (jazykově neutrální). `prompt` na `questions` zůstane jako fallback / „source" (CZ), ale UI bere text z `question_translations`.
- **Migrace:** skript přesune stávajících 300 CZ promptů do `question_translations(locale='cs')` a vyparsuje `scale_low/high` z regexu jednorázově (ne za běhu v UI).
- EN se přidá pozdějším `INSERT`em do `question_translations` — **bez zásahu do kódu**.
- RPC vrací `question_id`; UI dotáhne překlad pro aktuální locale (fallback na `cs`).

### 1.4 RPC `create_next_session` — úpravy

Rozšířit o:
1. **Free kolo:** session #1 (a obecně tier_1) = vždy povoleno. Default počet pro první kolo **10** (kratší free kolo).
2. **Paywall enforcement:** pokud `p_tier_pref ∈ {spicy, mixed}` (tj. žádá tier_2), zkontrolovat `entitlements` pro daného uživatele:
   - má nárok → normální výběr;
   - nemá nárok → buď `raise exception 'PAYWALL'` (UI přesměruje na checkout), nebo fallback na čistý tier_1 (rozhodnout v implementaci — preferuji explicitní PAYWALL signál, aby UI mohlo nabídnout upsell).
3. Nový parametr `p_user_id` pro kontrolu nároku (dnes RPC zná jen `partner_a_user_id`).

### 1.5 i18n routing (UI)

- **`next-intl`** + locale-prefixed routy: `src/app/[locale]/...`.
- Podporované locale: `['cs', 'en']` (en zatím prázdné překlady → fallback na cs), default `cs`.
- `middleware.ts` pro detekci locale (Accept-Language + cookie), redirect na `/cs/...`.
- Stringy z `messages/cs.json`, `messages/en.json`. Komponenty přepsat z napevno češtiny na `t('klíč')`.

---

## 2. Co konkrétně naprogramovat (po balíčcích)

### BALÍČEK A — i18n infrastruktura *(dělat první — obaluje vše ostatní)*
- [ ] `npm i next-intl`
- [ ] `src/i18n/routing.ts`, `src/i18n/request.ts` (konfigurace locales, default `cs`)
- [ ] `middleware.ts` — locale negotiation + (později hook na auth, viz E)
- [ ] Přesun `src/app/*` → `src/app/[locale]/*` (page, layout, session/…)
- [ ] `messages/cs.json` (+ prázdný `messages/en.json`) — extrahovat všechny stringy z `page.tsx`, `HomeForm.tsx`, `QuestionnaireForm.tsx`, `InvitePartner.tsx`, `ComparisonView.tsx`, error karty
- [ ] DB migrace `question_translations` + datová migrace 300 CZ promptů + parse `scale_low/high`
- [ ] Upravit dotazy v `session/[id]/page.tsx` a porovnání tak, aby braly `question_translations` dle locale (fallback cs)
- [ ] Odstranit `parseScaleLabels` regex z UI (`QuestionnaireForm`, `ComparisonView`) — číst `scale_low/high` z DB
- [ ] `<html lang>` z aktivní locale

### BALÍČEK B — Auth (Supabase magic link)
- [ ] `npm i @supabase/ssr`
- [ ] `src/lib/supabase/server.ts` (SSR klient, čte cookies), `src/lib/supabase/client.ts` (browser), zachovat `getSupabaseAdmin()`
- [ ] DB migrace: `public.users.auth_user_id` + politika párování dle e-mailu
- [ ] Stránky/akce: `/[locale]/login` (zadání e-mailu → magic link), `/[locale]/auth/callback` (výměna code za session)
- [ ] Server action `linkOrCreateProfile()` — po přihlášení spáruje/založí `public.users`, přepojí existující anonymní data dle e-mailu
- [ ] Doplnit `couple_members`/`sessions` napojení na přihlášeného uživatele (partner A se po loginu „přihlásí" ke svým couples)
- [ ] UI: nenásilné CTA „Uložit a mít přístup napořád" (ne tvrdá zeď pro free flow)

### BALÍČEK C — Entitlements + Stripe (paywall na tier_2)
- [ ] `npm i stripe`
- [ ] DB migrace: tabulka `entitlements`
- [ ] Stripe produkty (v Stripe dashboardu / přes API): `tier_2_unlock` (jednorázově, CZK), připravit i `pack_*`
- [ ] Server action `createCheckoutSession(productCode)` → Stripe Checkout (mode `payment`, CZK, success/cancel URL s locale)
- [ ] **Webhook** `POST /api/stripe/webhook`: na `checkout.session.completed` zapsat řádek do `entitlements` pro `user_id` z metadat. Ověření podpisu (`STRIPE_WEBHOOK_SECRET`). Idempotence dle `payment_intent`.
- [ ] Upravit RPC `create_next_session` o kontrolu nároku (viz 1.4) + nasadit migraci
- [ ] UI: upsell screen po free revealu (`ComparisonView` „Další kolo" / volba tier_2) → pokud bez nároku, zobrazit nabídku a `createCheckoutSession`
- [ ] Stripe Customer Portal odkaz (správa) — volitelně, nízká priorita pro one-time
- [ ] **Bezpečnostní pravidlo:** nárok ověřovat VŽDY server-side v RPC, klient slouží jen k zobrazení

### BALÍČEK D — Autosave kvízu
- [ ] Změna modelu odpovídání: místo držení v Reactu a hromadného insertu na konci → **upsert odpovědi po každé otázce**.
  - `answers` už má `unique(session_id, question_id, user_id)` → použít `upsert` (on conflict update).
  - Nová server action `saveAnswer(sessionId, userId, questionId, kind, value)` (upsert, bez `complete`).
  - `complete_partner_submission` se volá až na konci (beze změny).
- [ ] `QuestionnaireForm`: při příchodu načíst již uložené odpovědi (resume), předvyplnit stav, skočit na první nezodpovězenou.
- [ ] Indikátor „uloženo" + ošetření offline (retry, optimistic UI).
- [ ] Nahradit `window.location.reload()` po dokončení za `router.refresh()`.

### BALÍČEK E — 18+ / Privacy / GDPR
- [ ] **Age gate** (18+) — modal/stránka před vstupem do **tier_2** obsahu (ne nutně pro tier_1). Uložit souhlas (cookie + u přihlášených na účet).
- [ ] Stránky `/[locale]/privacy`, `/[locale]/terms` (CZ obsah, i18n-ready).
- [ ] **Mazání dat** (právo na výmaz): server action `deleteMyData()` + UI v účtu; kaskády v DB už z velké části jsou (`on delete cascade`).
- [ ] Cookie/consent banner (kvůli analytice — viz F). Lehký, bez 3rd-party CMP.
- [ ] Souhlas s ToS u registrace/age-gate (checkbox + timestamp).
- [ ] Schovat config-warning (ENV proměnné) za `process.env.NODE_ENV !== 'production'` — bezpečnostní/UX drobnost z auditu.

### BALÍČEK F — Analytika (PostHog)
- [ ] `npm i posthog-js` (+ volitelně server-side capture)
- [ ] `src/lib/analytics.ts` — wrapper, inicializace jen po cookie-souhlasu (balíček E)
- [ ] **Funnel eventy:** `landing_view`, `config_selected`, `round_started`, `question_answered`, `round_completed`, `invite_sent`, `partner_completed`, `reveal_viewed`, `share_clicked`, `paywall_viewed`, `checkout_started`, `purchase_completed`.
- [ ] Identifikace přihlášeného uživatele (po balíčku B), jinak anonymní distinct_id.
- [ ] Žádné PII v event properties (zejména žádné texty odpovědí).

### BALÍČEK G — Lokalizované e-maily + kratší free kolo
- [ ] `mail.ts`: přeložit pozvánku do **CZ**, parametrizovat dle locale (`sendInviteEmail(email, link, locale)`), připravit šablony v `messages` nebo samostatném mapě.
- [ ] Vlastní `from` doména (až bude ověřená v Resend) místo `onboarding@resend.dev`.
- [ ] **Kratší free kolo:** default počet otázek pro první (free, tier_1) kolo = **10**. Upravit default v `HomeForm`/`startSession`/RPC.
- [ ] (Připraveno pro P1: reminder po 24 h — mimo rozsah tohoto kola, ale e-mail vrstvu necháme rozšiřitelnou.)

---

## 3. Změnové soubory — přehled

| Soubor / cesta | Akce |
|---|---|
| `package.json` | + `next-intl`, `@supabase/ssr`, `stripe`, `posthog-js` |
| `middleware.ts` | NOVÝ — locale + (auth refresh) |
| `src/i18n/{routing,request}.ts` | NOVÝ |
| `messages/cs.json`, `messages/en.json` | NOVÝ |
| `src/app/[locale]/**` | PŘESUN celého `src/app/*` pod locale segment |
| `src/lib/supabase/{server,client}.ts` | NOVÝ (SSR/browser klient) |
| `src/lib/analytics.ts` | NOVÝ |
| `src/lib/mail.ts` | i18n + CZ text + locale param |
| `src/app/actions/session.ts` | autosave action, entitlement-aware volání RPC, auth-aware identita |
| `src/app/actions/{auth,billing,privacy}.ts` | NOVÉ (login, checkout, deleteMyData) |
| `src/app/api/stripe/webhook/route.ts` | NOVÝ |
| `src/app/[locale]/{login,auth/callback,privacy,terms,account}/page.tsx` | NOVÉ |
| `src/app/[locale]/session/[id]/QuestionnaireForm.tsx` | autosave + resume + scale z DB |
| `src/app/[locale]/session/[id]/ComparisonView.tsx` | upsell/paywall, scale z DB, sdílení (i18n) |
| `supabase/migrations/2026XXXX_*` | `question_translations`, `users.auth_user_id`, `entitlements`, úprava `create_next_session` |

---

## 4. Nové ENV proměnné

```
# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_TIER2=            # price ID pro tier_2 unlock
# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
# (stávající: NEXT_PUBLIC_SUPABASE_URL, _ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
#  NEXT_PUBLIC_APP_URL, RESEND_API_KEY)
```

---

## 5. Doporučené pořadí prací (závislosti)

```
A. i18n infra ──┐  (obaluje routy; udělat dřív, ať se nepřepisuje 2×)
                ├─→ B. Auth ──→ C. Entitlements + Stripe (závisí na user identitě)
D. Autosave ────┘            
E. 18+/Privacy ──→ F. Analytika (analytika smí běžet až po consentu)
G. E-maily + kratší free kolo  (nezávislé, kdykoliv)
```

**Konkrétní sekvence:** A → (D ‖ G paralelně) → B → C → E → F.
Důvod: i18n routing přesouvá soubory, takže ho udělat první ušetří dvojí přepis. Auth musí předcházet entitlements/Stripe. Analytika až po consent banneru z E.

---

## 6. Odhad náročnosti

| Balíček | Odhad (full-time) |
|---|---|
| A — i18n infra + migrace otázek | 2–3 dny |
| B — Auth (magic link, párování) | 1,5–2 dny |
| C — Entitlements + Stripe + webhook + RPC | 2–3 dny |
| D — Autosave + resume | 1 den |
| E — 18+/Privacy/GDPR/consent | 1–1,5 dne |
| F — Analytika (funnel eventy) | 0,5–1 den |
| G — Lokalizované e-maily + kratší free kolo | 0,5 dne |
| **Celkem** | **~9–12 dní full-time** (po večerech ~3–4 týdny) |

---

## 7. Rizika a na co si dát pozor

1. **Smíření `public.users` ↔ `auth.users`** — největší riziko. Párování dle e-mailu musí ošetřit kolize (stejný e-mail už existuje jako anonymní/e-mailový). Doporučení: idempotentní `linkOrCreateProfile` + transakce.
2. **RLS:** dnes vše jede přes service role bez RLS. Se zavedením auth a klientských čtení **musíme zapnout RLS** na citlivých tabulkách (`answers`, `entitlements`), jinak hrozí únik dat. Minimálně: čtení odpovědí jen pro členy daného couple / vlastníka.
3. **Stripe webhook idempotence** — duplicitní eventy nesmí udělit nárok 2×; klíčovat dle `payment_intent`.
4. **Paywall jen v UI = obejitelný.** Nárok ověřovat striktně v RPC (server), nikdy nevěřit klientovi.
5. **i18n migrace škálových popisků** — regex parse stávajících promptů musí pokrýt všechny varianty; nutné ověřit na všech 300 řádcích (které nematchnou → ruční doplnění).
6. **Age-gate vs. completion rate** — gate jen pro tier_2, ať netříští free tier_1 funnel.
7. **Anonymní partner B + placený tier_2** — pokud partner A koupil tier_2, jak to platí pro anonymního partnera B v session? Návrh: nárok kontrolovat u **tvůrce session** (partner A); partner B jen odpovídá v rámci už odemčené session. (Potvrdit při implementaci.)

---

## 8. Co je MIMO rozsah tohoto kola (P1+)

- OG obrázky výsledků, realtime stav partnera, reminder e-maily (P1).
- Skutečný EN/další překlady obsahu (jen infra teď).
- B2B terapeut dashboard, admin panel, affiliate (P3).
- Tematické balíčky jako plné produkty (infra `entitlements` je připraví, ale obsah/UI balíčků až po tier_2).
