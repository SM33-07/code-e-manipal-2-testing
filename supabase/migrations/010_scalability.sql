-- ============================================================
-- SCALABILITY OPTIMIZATIONS (zero data risk)
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Indexes ────────────────────────────────────────────────
-- These speed up the heaviest query patterns without changing data.

CREATE INDEX IF NOT EXISTS reviews_complete_submission_idx
  ON public.judge_reviews(submission_id)
  WHERE is_complete = true;

CREATE INDEX IF NOT EXISTS submissions_status_active_idx
  ON public.submissions(status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS reviews_judge_complete_idx
  ON public.judge_reviews(judge_id, submission_id)
  WHERE is_complete = true;

-- ── 2. Function: category breakdown ───────────────────────────
-- Replaces the JS .reduce() loop in analyticsService.ts.
-- Returns all categories with submission counts.

CREATE OR REPLACE FUNCTION public.get_category_counts()
RETURNS TABLE(category TEXT, count BIGINT)
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT s.category, COUNT(*)::BIGINT
  FROM public.submissions s
  WHERE s.deleted_at IS NULL
  GROUP BY s.category
  ORDER BY s.category;
$$;

-- ── 3. Function: status counts ────────────────────────────────
-- Replaces the JS .filter().length in analyticsService.ts.
-- Returns counts per submission status.

CREATE OR REPLACE FUNCTION public.get_status_counts()
RETURNS TABLE(status TEXT, count BIGINT)
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT s.status, COUNT(*)::BIGINT
  FROM public.submissions s
  WHERE s.deleted_at IS NULL
  GROUP BY s.status;
$$;

-- ── 4. Function: average scores across all completed reviews ──
-- Replaces the JS avg() computation in analyticsService.ts.

CREATE OR REPLACE FUNCTION public.get_avg_scores()
RETURNS TABLE(
  avg_innovation   NUMERIC,
  avg_technical    NUMERIC,
  avg_presentation NUMERIC,
  avg_impact       NUMERIC,
  total_reviews    BIGINT
)
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT
    ROUND(AVG(r.score_innovation)::numeric, 2),
    ROUND(AVG(r.score_technical)::numeric, 2),
    ROUND(AVG(r.score_presentation)::numeric, 2),
    ROUND(AVG(r.score_impact)::numeric, 2),
    COUNT(*)::BIGINT
  FROM public.judge_reviews r
  WHERE r.is_complete = true;
$$;

-- ── 5. Function: ranked results ───────────────────────────────
-- Replaces 4 separate queries + Map joins + JS sort in results/route.ts.
-- Returns reviewed submissions ranked by average total score.
-- Parameters:
--   category_filter — optional category to filter by (NULL = all)
--   min_reviews     — minimum number of complete reviews required (default 1)

CREATE OR REPLACE FUNCTION public.get_ranked_results(
  category_filter TEXT DEFAULT NULL,
  min_reviews INT DEFAULT 1
)
RETURNS TABLE(
  submission_id    UUID,
  title            TEXT,
  summary          TEXT,
  category         TEXT,
  status           TEXT,
  created_at       TIMESTAMPTZ,
  team_id          UUID,
  team_name        TEXT,
  avg_innovation   NUMERIC,
  avg_technical    NUMERIC,
  avg_presentation NUMERIC,
  avg_impact       NUMERIC,
  total_score      NUMERIC,
  review_count     BIGINT,
  rank_num         BIGINT
)
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  WITH score_data AS (
    SELECT
      s.id,
      s.title,
      s.summary,
      s.category,
      s.status,
      s.created_at,
      s.team_id,
      t.name AS team_name,
      COUNT(jr.id)::BIGINT AS review_count,
      ROUND(AVG(jr.score_innovation)::numeric, 2)   AS avg_innovation,
      ROUND(AVG(jr.score_technical)::numeric, 2)    AS avg_technical,
      ROUND(AVG(jr.score_presentation)::numeric, 2) AS avg_presentation,
      ROUND(AVG(jr.score_impact)::numeric, 2)       AS avg_impact,
      ROUND((
        AVG(jr.score_innovation) +
        AVG(jr.score_technical) +
        AVG(jr.score_presentation) +
        AVG(jr.score_impact)
      )::numeric, 2) AS total_score
    FROM public.submissions s
    JOIN public.teams t ON t.id = s.team_id
    JOIN public.judge_reviews jr ON jr.submission_id = s.id
    WHERE jr.is_complete = true
      AND s.deleted_at IS NULL
      AND (category_filter IS NULL OR s.category = category_filter)
    GROUP BY s.id, t.id
  )
  SELECT
    sd.id,
    sd.title,
    sd.summary,
    sd.category,
    sd.status,
    sd.created_at,
    sd.team_id,
    sd.team_name,
    sd.avg_innovation,
    sd.avg_technical,
    sd.avg_presentation,
    sd.avg_impact,
    sd.total_score,
    sd.review_count,
    RANK() OVER (ORDER BY sd.total_score DESC, sd.title ASC) AS rank_num
  FROM score_data sd
  WHERE sd.review_count >= min_reviews
  ORDER BY rank_num;
$$;