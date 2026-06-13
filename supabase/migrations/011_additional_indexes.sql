-- ============================================================
-- ADDITIONAL INDEXES FOR HIGH-LOAD OPTIMIZATION
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Index on teams(created_by)
-- Speeds up "get my team" lookups and owner-validation RLS checks.
CREATE INDEX IF NOT EXISTS teams_created_by_idx 
  ON public.teams(created_by);

-- 2. Index on profiles(role)
-- Speeds up authorization checks, role-based middleware filters,
-- and admin commands that query all judges/admins.
CREATE INDEX IF NOT EXISTS profiles_role_idx 
  ON public.profiles(role);

-- 3. Sort indexes for descending created_at queries
-- Speeds up pagination/sorting on team lists and news feeds.
CREATE INDEX IF NOT EXISTS teams_created_at_desc_idx 
  ON public.teams(created_at DESC);

CREATE INDEX IF NOT EXISTS posts_created_at_desc_idx 
  ON public.posts(created_at DESC);
