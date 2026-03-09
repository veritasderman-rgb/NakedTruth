# NakedTruth

Step 1 bootstrap for a Next.js 14+/15 App Router project using TypeScript, Tailwind CSS, and Shadcn UI conventions.

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start dev server:
   ```bash
   npm run dev
   ```

## Structure

- `src/app` - App Router pages and global styles
- `src/components/ui` - Shadcn-compatible UI primitives
- `src/lib` - shared utilities
- `components.json` - Shadcn configuration

## STEP 2 (Supabase): Schema setup

1. Open your Supabase project dashboard.
2. Navigate to **SQL Editor**.
3. Run `supabase/schema.sql` in one execution.

This creates:
- `users`, `couples`, `couple_members`, `questions`, `sessions`, `session_questions`, `answers`
- enums for tiers/kinds/statuses
- triggers and RPCs for session generation + completion logic
