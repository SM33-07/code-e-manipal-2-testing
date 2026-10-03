-- ============================================================
-- DEVELOPMENT / STAGING ROLLBACK SCRIPT FOR MIGRATION 020
-- WARNING: STRICTLY FOR LOCAL DEV / STAGING REHEARSAL ONLY.
-- FOR PRODUCTION: Authoritative recovery is Azure PITR snapshot.
-- ============================================================

BEGIN;

DROP TABLE IF EXISTS public.login_attempts CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.results_awards CASCADE;
DROP TABLE IF EXISTS public.results_snapshot CASCADE;
DROP TABLE IF EXISTS public.review_history CASCADE;

-- Revert event_config singleton to event_config_kv if renamed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_config_kv') THEN
    DROP TABLE IF EXISTS public.event_config CASCADE;
    ALTER TABLE public.event_config_kv RENAME TO event_config;
  END IF;
END $$;

-- Revert judge_reviews
ALTER TABLE public.judge_reviews DROP COLUMN IF EXISTS version;

-- Revert submissions
ALTER TABLE public.submissions 
  DROP COLUMN IF EXISTS final_submitted_at,
  DROP COLUMN IF EXISTS is_locked,
  DROP CONSTRAINT IF EXISTS idx_submissions_team_id_unique;

ALTER TABLE public.submissions 
  DROP CONSTRAINT IF EXISTS submissions_status_check;
ALTER TABLE public.submissions 
  ADD CONSTRAINT submissions_status_check 
  CHECK (status = ANY (ARRAY['draft'::text, 'submitted'::text, 'under_review'::text, 'reviewed'::text]));

-- Revert profiles
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS identifier,
  DROP COLUMN IF EXISTS force_logout_before,
  DROP COLUMN IF EXISTS is_disabled,
  DROP COLUMN IF EXISTS team_id;

-- Revert teams
ALTER TABLE public.teams DROP COLUMN IF EXISTS track;

COMMIT;
