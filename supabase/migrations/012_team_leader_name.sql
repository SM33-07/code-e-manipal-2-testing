-- ============================================================
-- Migration 012: Add leader_name to teams
-- Allows teams to store a human-readable team leader name
-- separate from the auth user identity.
-- ============================================================

ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS leader_name TEXT;
