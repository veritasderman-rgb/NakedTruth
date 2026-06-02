# NakedTruth

Blind-comparison kvíz pro páry (Next.js 15 App Router, TypeScript, Tailwind, Shadcn UI, Supabase, Stripe, next-intl).

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in the values.
3. Start dev server:
   ```bash
   npm run dev
   ```

The app is served under a locale prefix, e.g. `http://localhost:3000/cs`.

## Structure

- `src/app/[locale]` - locale-prefixed App Router pages
- `src/app/actions` - server actions (session, auth, billing)
- `src/app/api/stripe/webhook` - Stripe webhook handler
- `src/app/auth/callback` - magic-link auth callback
- `src/components` - UI + cross-cutting components (AgeGate, ConsentBanner, AnalyticsProvider)
- `src/i18n` - next-intl routing/request config
- `src/lib` - Supabase clients, auth, questions i18n, analytics, stripe, mail
- `messages/{cs,en}.json` - UI translations (en falls back to cs)
- `supabase/` - schema, seed, migrations

## First-time setup (manual steps)

Run the SQL migrations in the Supabase SQL editor, in order:

1. `supabase/schema.sql` and `supabase/seed_questions.sql` (if not already applied)
2. `supabase/migrations/20260312_add_session_preferences.sql`
3. `supabase/migrations/20260601_question_translations.sql` — i18n table + backfill of Czech prompts
4. `supabase/migrations/20260601_auth_and_entitlements.sql` — auth link, entitlements, paywall RPC
5. `supabase/migrations/20260601_enable_rls.sql` — enable Row Level Security (defense-in-depth)
6. `supabase/migrations/20260601_harden_grants.sql` — drop stale RPC overloads, lock function EXECUTE / table grants to the service role
7. `supabase/migrations/20260602_intensity_themes.sql` — tier_2 intensity/theme columns, calibration questions, first-pass tagging
8. `supabase/migrations/20260602_session_intensity_rpc.sql` — create_next_session with intensity/theme filter + calibration prelude

Then configure:

- **Supabase Auth:** enable Email (magic link) provider; add `<APP_URL>/auth/callback` to the allowed redirect URLs.
- **Stripe:** create a one-time CZK price for the tier_2 unlock, set `STRIPE_PRICE_TIER2`; add a webhook endpoint pointing at `<APP_URL>/api/stripe/webhook` for the `checkout.session.completed` event and set `STRIPE_WEBHOOK_SECRET`.
- **PostHog (optional):** set `NEXT_PUBLIC_POSTHOG_KEY` to enable analytics (only fires after cookie consent).

## Adding a language

1. Add the locale to `src/i18n/routing.ts`.
2. Create `messages/<locale>.json` (missing keys fall back to `cs`).
3. Insert translated question rows into `question_translations` for that locale.

No application code changes are required for question content.
