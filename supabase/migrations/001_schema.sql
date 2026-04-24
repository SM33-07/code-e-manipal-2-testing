-- ============================================================
-- LEARNIT SUBMISSION PORTAL — Database Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- Auto-created by trigger when a new auth.users row is inserted.
-- ============================================================
CREATE TABLE public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL DEFAULT '',
  email       TEXT,
  avatar_url  TEXT,
  role        TEXT        NOT NULL DEFAULT 'participant'
              CHECK (role IN ('participant', 'judge', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TEAMS
-- ============================================================
CREATE TABLE public.teams (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  hackathon   TEXT        NOT NULL DEFAULT 'LearnIT 2025',
  invite_code TEXT        UNIQUE DEFAULT substr(md5(random()::text), 0, 9),
  created_by  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TEAM MEMBERS (junction)
-- ============================================================
CREATE TABLE public.team_members (
  team_id   UUID        NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id   UUID        NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  role      TEXT        NOT NULL DEFAULT 'member'
            CHECK (role IN ('leader', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

CREATE INDEX team_members_user_id_idx ON public.team_members(user_id);

-- ============================================================
-- SUBMISSIONS
-- ============================================================
CREATE TABLE public.submissions (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id         UUID        NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  summary         TEXT        NOT NULL CHECK (char_length(summary) BETWEEN 1 AND 500),
  description     TEXT,
  category        TEXT        NOT NULL,
  technologies    TEXT[]      NOT NULL DEFAULT '{}',
  github_url      TEXT,
  demo_url        TEXT,
  docs_url        TEXT,
  demo_video_url  TEXT,
  status          TEXT        NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'submitted', 'under_review', 'reviewed')),
  submitted_at    TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX submissions_team_id_idx     ON public.submissions(team_id);
CREATE INDEX submissions_status_idx      ON public.submissions(status);
CREATE INDEX submissions_category_idx    ON public.submissions(category);
CREATE INDEX submissions_submitted_at_idx ON public.submissions(submitted_at DESC);
CREATE INDEX submissions_deleted_at_idx  ON public.submissions(deleted_at)
  WHERE deleted_at IS NULL;

-- ============================================================
-- JUDGE REVIEWS
-- ============================================================
CREATE TABLE public.judge_reviews (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id        UUID        NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  judge_id             UUID        NOT NULL REFERENCES auth.users(id)         ON DELETE CASCADE,
  score_innovation     INT         CHECK (score_innovation   BETWEEN 1 AND 10),
  score_technical      INT         CHECK (score_technical    BETWEEN 1 AND 10),
  score_presentation   INT         CHECK (score_presentation BETWEEN 1 AND 10),
  score_impact         INT         CHECK (score_impact       BETWEEN 1 AND 10),
  feedback             TEXT,
  is_complete          BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (submission_id, judge_id)
);

CREATE INDEX reviews_submission_id_idx ON public.judge_reviews(submission_id);
CREATE INDEX reviews_judge_id_idx      ON public.judge_reviews(judge_id);
CREATE INDEX reviews_is_complete_idx   ON public.judge_reviews(is_complete);

-- ============================================================
-- JUDGE ASSIGNMENTS
-- ============================================================
CREATE TABLE public.judge_assignments (
  judge_id      UUID        NOT NULL REFERENCES auth.users(id)          ON DELETE CASCADE,
  submission_id UUID        NOT NULL REFERENCES public.submissions(id)  ON DELETE CASCADE,
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (judge_id, submission_id)
);

CREATE INDEX assignments_judge_id_idx      ON public.judge_assignments(judge_id);
CREATE INDEX assignments_submission_id_idx ON public.judge_assignments(submission_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create a profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-set updated_at on every UPDATE
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.judge_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- ── Profiles ─────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_public_read"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_owner_update"
  ON public.profiles FOR UPDATE
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── Teams ─────────────────────────────────────────────────────
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teams_public_read"
  ON public.teams FOR SELECT
  USING (true);

CREATE POLICY "teams_auth_insert"
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "teams_leader_update"
  ON public.teams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = id
        AND user_id = auth.uid()
        AND role    = 'leader'
    )
  );

-- ── Team Members ──────────────────────────────────────────────
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_public_read"
  ON public.team_members FOR SELECT
  USING (true);

CREATE POLICY "members_auth_insert"
  ON public.team_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "members_owner_delete"
  ON public.team_members FOR DELETE
  USING (
    -- Self-leave
    auth.uid() = user_id
    -- OR team leader removing someone else
    OR EXISTS (
      SELECT 1 FROM public.team_members AS tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.role    = 'leader'
    )
  );

-- ── Submissions ───────────────────────────────────────────────
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "submissions_public_read"
  ON public.submissions FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "submissions_team_insert"
  ON public.submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = submissions.team_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "submissions_team_update"
  ON public.submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = submissions.team_id
        AND user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "submissions_team_or_admin_delete"
  ON public.submissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = submissions.team_id
        AND user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id   = auth.uid()
        AND role = 'admin'
    )
  );

-- ── Judge Reviews ─────────────────────────────────────────────
ALTER TABLE public.judge_reviews ENABLE ROW LEVEL SECURITY;

-- Judges see and manage their own reviews
CREATE POLICY "reviews_judge_own"
  ON public.judge_reviews FOR ALL
  USING  (auth.uid() = judge_id)
  WITH CHECK (auth.uid() = judge_id);

-- Admins can read all reviews
CREATE POLICY "reviews_admin_read"
  ON public.judge_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id   = auth.uid()
        AND role = 'admin'
    )
  );

-- ── Judge Assignments ─────────────────────────────────────────
ALTER TABLE public.judge_assignments ENABLE ROW LEVEL SECURITY;

-- Judges see their own assignments
CREATE POLICY "assignments_judge_read"
  ON public.judge_assignments FOR SELECT
  USING (auth.uid() = judge_id);

-- Admins have full control
CREATE POLICY "assignments_admin_all"
  ON public.judge_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id   = auth.uid()
        AND role = 'admin'
    )
  );

-- ============================================================
-- STORAGE BUCKETS (run separately in Supabase dashboard or via CLI)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('demo-videos', 'demo-videos', false);
--
-- Storage policies:
-- CREATE POLICY "avatars_public_read"  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- CREATE POLICY "avatars_owner_upload" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
