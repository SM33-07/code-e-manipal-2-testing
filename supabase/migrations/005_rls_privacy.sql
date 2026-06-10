-- ============================================================
-- TIGHTEN RLS POLICIES — Role-based data access
-- 
-- Participants: see only their own team's submissions
-- Judges: see only assigned submissions + their own reviews
-- Admins: see everything
-- ============================================================

-- ── Submissions ──────────────────────────────────────────────
DROP POLICY IF EXISTS "submissions_public_read" ON public.submissions;

CREATE POLICY "submissions_role_based_read"
  ON public.submissions FOR SELECT
  USING (
    deleted_at IS NULL AND (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      OR
      EXISTS (SELECT 1 FROM public.team_members WHERE team_id = submissions.team_id AND user_id = auth.uid())
      OR
      EXISTS (SELECT 1 FROM public.judge_assignments WHERE submission_id = submissions.id AND judge_id = auth.uid())
    )
  );

-- ── Teams ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "teams_public_read" ON public.teams;

CREATE POLICY "teams_role_based_read"
  ON public.teams FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.team_members WHERE team_id = teams.id AND user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'judge'))
  );

-- ── Team Members ─────────────────────────────────────────────
DROP POLICY IF EXISTS "members_public_read" ON public.team_members;

CREATE POLICY "members_role_based_read"
  ON public.team_members FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (SELECT 1 FROM public.team_members AS tm WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'judge'))
  );
