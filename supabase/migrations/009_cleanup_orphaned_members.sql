-- Safer cleanup: remove team_members whose team no longer exists.
-- Unlike the ctid-based approach, this won't accidentally delete
-- a user's current team membership.

DELETE FROM public.team_members
WHERE team_id NOT IN (SELECT id FROM public.teams);

-- Clean up teams that ended up with zero members
DELETE FROM public.teams
WHERE id NOT IN (SELECT DISTINCT team_id FROM public.team_members);
