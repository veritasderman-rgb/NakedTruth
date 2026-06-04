-- Migration: tracking columns for transactional emails.
--
-- results_email_sent_at: set when the "results are ready" email goes out (both
--   partners finished), so it is sent at most once even under concurrent submits.
-- reminder_sent_at: set when the 24h "your partner is waiting" reminder is sent
--   to partner B, so the hourly cron never reminds the same session twice.
--
-- Idempotent so it is safe to re-run / apply to the already-migrated production DB.

alter table public.sessions
  add column if not exists results_email_sent_at timestamptz,
  add column if not exists reminder_sent_at timestamptz;
