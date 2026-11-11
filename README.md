# NakedTruth

Testy a porovnání pro páry i jednotlivce. Next.js 15 (App Router), React 19, TypeScript, Tailwind, Neon Postgres.

- **Kinkometr** (`/kinkometr`) — anonymní solo test. 23 oblastí („pohárů“) v pěti skupinách se plní podle odpovědí. První kolo je krátké a mírné, druhé jde u vybraných pohárů do hloubky a měří i směr (dávat / přijímat). Výsledek nabídne aktivity, polohy, místa a tipy, kde potkat podobně naladěné lidi. Poháry jde porovnat s partnerem přes pozvánku; porovnání ukáže jen to, na čem se oba shodnou.
- **Párový kvíz naslepo** (`/`) — oba partneři odpoví zvlášť na stejné otázky, odpovědi se odhalí až po dokončení obou.

## Languages

The whole site exists in Czech, English, German, French and Spanish: Kinkometr, the blind couples quiz (interface, 330 questions, e-mails) and the share page. Czech is the source language. Wording lives in `src/lib/kink-content/` and `src/lib/quiz-content/`; question translations are in `db/seed_question_translations.sql` and are loaded in the viewer's language, so two partners can answer the same session in different languages.

## Payments

Stripe Checkout, enabled by `STRIPE_SECRET_KEY`: the one-time premium unlock for the couples quiz (needs the webhook and `STRIPE_WEBHOOK_SECRET`) and a voluntary tip jar (`/api/tip`, no webhook needed).

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL` (pooled connection string from the Neon console).
3. Create the schema and seed the question bank (idempotent, runs over HTTPS):
   ```bash
   npm run db:setup
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

## Structure

- `src/app` - App Router pages, server actions (`actions/`) and API routes
- `src/app/kinkometr` - Kinkometr test, result and comparison pages
- `src/components/ui` - Shadcn-compatible UI primitives
- `src/lib/db.ts` - Neon client (`getSql()`), server-side only
- `src/lib/kink.ts` - Kinkometr structure and scoring (language-neutral)
- `src/lib/kink-content/` - all Kinkometr wording, one file per language (`cs` is the source)
- `src/lib/i18n.ts`, `src/middleware.ts` - locales: Czech at the root, `/en`, `/de`, `/fr`, `/es` as prefixes
- `db/schema.sql`, `db/seed_questions.sql` - database schema and question bank
