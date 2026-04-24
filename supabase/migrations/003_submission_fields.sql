-- ============================================================
-- ADDITIONAL FIELDS FOR EXTENDED PROJECT WRITEUP
-- ============================================================

alter table public.submissions
  add column if not exists tagline               text,
  add column if not exists problem_solved        text,
  add column if not exists architecture_overview text,
  add column if not exists technical_challenges  text,
  add column if not exists video_url             text,
  add column if not exists docs_url              text,
  add column if not exists what_worked_well      text,
  add column if not exists challenges_faced      text,
  add column if not exists lessons_learned       text,
  add column if not exists future_roadmap        text;

create index if not exists submissions_search_idx
on public.submissions using gin (to_tsvector('english', title || ' ' || summary));