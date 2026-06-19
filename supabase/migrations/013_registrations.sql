-- ============================================================
-- HACKATHON REGISTRATIONS — Team Leader Registration
-- ============================================================

CREATE TABLE public.hackathon_registrations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,                -- Team leader full name
  team_name       TEXT        NOT NULL UNIQUE,          -- Enforced unique team name
  phone           TEXT        NOT NULL,                 -- Team leader phone
  email           TEXT        NOT NULL UNIQUE,           -- Team leader email (becomes login)
  round           INT         NOT NULL DEFAULT 1,        -- Registration round (1 or 2)
  status          TEXT        NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by     UUID        REFERENCES auth.users(id),
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX reg_status_idx ON public.hackathon_registrations(status);
CREATE INDEX reg_email_idx  ON public.hackathon_registrations(email);
CREATE INDEX reg_round_idx  ON public.hackathon_registrations(round);

-- Reuse existing updated_at trigger function
CREATE TRIGGER registrations_updated_at
  BEFORE UPDATE ON public.hackathon_registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Enforce unique team names in the teams table too
-- ============================================================
ALTER TABLE public.teams ADD CONSTRAINT teams_name_unique UNIQUE (name);
