# NakedTruth

Testy a porovnání pro páry i jednotlivce. Next.js 15 (App Router), React 19, TypeScript, Tailwind, Neon Postgres.

- **Kinkometr** (`/kinkometr`) — anonymní solo test. 12 oblastí („pohárů“) se plní podle odpovědí; výsledek nabídne aktivity, polohy, místa a tipy, kde potkat podobně naladěné lidi. Poháry jde porovnat s partnerem přes pozvánku.
- **Párový kvíz naslepo** (`/`) — oba partneři odpoví zvlášť na stejné otázky, odpovědi se odhalí až po dokončení obou.

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
- `src/lib/kink.ts` - Kinkometr cups, questions, scoring and recommendations
- `db/schema.sql`, `db/seed_questions.sql` - database schema and question bank
