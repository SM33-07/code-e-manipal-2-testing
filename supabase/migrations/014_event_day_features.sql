-- ============================================================
-- EVENT DAY FEATURES: Submission Freeze, Extensions & Announcements
-- ============================================================

-- 1. Alter public.teams to support deadline management
ALTER TABLE public.teams 
  ADD COLUMN IF NOT EXISTS submission_frozen BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deadline_extension TIMESTAMPTZ DEFAULT NULL;

-- 2. Create public.announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  content     TEXT         NOT NULL,
  type        TEXT         NOT NULL DEFAULT 'info' 
                           CHECK (type IN ('info', 'warning', 'urgent', 'success')),
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_by  UUID         REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Index for scanning active announcements
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements(is_active, created_at DESC);

-- Enable Row Level Security (RLS) on public.announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to ensure safe re-run)
DO $$
BEGIN
    DROP POLICY IF EXISTS announcements_public_read ON public.announcements;
    DROP POLICY IF EXISTS announcements_admin_all ON public.announcements;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Policies for public.announcements
CREATE POLICY announcements_public_read ON public.announcements
  FOR SELECT USING (true);

CREATE POLICY announcements_admin_all ON public.announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );
