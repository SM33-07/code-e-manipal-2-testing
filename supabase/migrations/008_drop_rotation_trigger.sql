-- Drop the auto-rotation trigger on team_members INSERT
-- It breaks the multi-member join flow: every join changes the code,
-- so the leader's displayed code becomes stale immediately.

DROP TRIGGER IF EXISTS team_members_rotate_invite ON public.team_members;
DROP FUNCTION IF EXISTS public.rotate_invite_code;
