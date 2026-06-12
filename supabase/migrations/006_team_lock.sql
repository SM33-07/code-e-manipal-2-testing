-- ============================================================
-- Add is_locked column to teams table
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT FALSE;

-- Allow team leaders to update is_locked
-- (existing RLS policy "teams_leader_update" already covers this)

-- Update invite_code rotation trigger: rotate code on new member join
CREATE OR REPLACE FUNCTION public.rotate_invite_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.teams
  SET invite_code = substr(md5(random()::text), 0, 9)
  WHERE id = NEW.team_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER team_members_rotate_invite
  AFTER INSERT ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.rotate_invite_code();
