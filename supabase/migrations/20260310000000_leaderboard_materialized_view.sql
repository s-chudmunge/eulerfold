-- Materialized View for Leaderboard Rankings
-- This view aggregates user performance across multiple tables into a single composite score.

DROP MATERIALIZED VIEW IF EXISTS public.leaderboard_rankings;

CREATE MATERIALIZED VIEW public.leaderboard_rankings AS
WITH user_stats AS (
    SELECT 
        p.supabase_uid AS id,
        p.username,
        p.display_name,
        -- 1. Avg Confidence (0-100)
        COALESCE((
            SELECT AVG(us.confidence_score) 
            FROM public.user_skills us 
            WHERE us.user_id = p.supabase_uid
        ), 0) AS avg_confidence,
        -- 2. Roadmaps Started/Contributed (Count unique roadmap IDs in user_skills)
        COALESCE((
            SELECT COUNT(DISTINCT rid) 
            FROM public.user_skills us, 
                 LATERAL unnest(us.contributing_roadmap_ids) AS rid 
            WHERE us.user_id = p.supabase_uid
        ), 0) AS roadmaps_count,
        -- 3. Practice Points (Count completed practice resources)
        COALESCE((
            SELECT COUNT(*) 
            FROM public.practice_progress pp 
            WHERE pp.user_id = p.supabase_uid AND pp.completed = true
        ), 0) AS practice_points,
        -- 4. Streak (From profiles)
        COALESCE(p.current_streak, 0) AS streak,
        -- 5. Assessments (Count scored assessments)
        COALESCE((
            SELECT COUNT(*) 
            FROM public.assessment_sessions ass 
            WHERE ass.user_id = p.supabase_uid AND ass.status = 'scored'
        ), 0) AS assessments_count
    FROM public.profiles p
)
SELECT 
    id,
    username,
    display_name,
    -- Normalized Composite Score Calculation:
    -- Weights: Confidence (30%), Roadmaps (25%), Practice (20%), Streak (15%), Assessments (10%)
    -- Normalization Caps: Roadmaps (10), Practice (500), Streak (100), Assessments (20)
    -- Removed ROUND to avoid double precision type issues; rank handles raw precision.
    (LEAST(avg_confidence, 100.0) * 0.30) +
    (LEAST(roadmaps_count * 10.0, 100.0) * 0.25) +
    (LEAST(practice_points * 0.2, 100.0) * 0.20) +
    (LEAST(streak * 1.0, 100.0) * 0.15) +
    (LEAST(assessments_count * 5.0, 100.0) * 0.10) AS composite_score,
    -- Rankings
    RANK() OVER (ORDER BY (
        (LEAST(avg_confidence, 100.0) * 0.30) +
        (LEAST(roadmaps_count * 10.0, 100.0) * 0.25) +
        (LEAST(practice_points * 0.2, 100.0) * 0.20) +
        (LEAST(streak * 1.0, 100.0) * 0.15) +
        (LEAST(assessments_count * 5.0, 100.0) * 0.10)
    ) DESC) AS rank
FROM user_stats;

-- Indexes for instant reads
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_rankings_id ON public.leaderboard_rankings(id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rankings_rank ON public.leaderboard_rankings(rank);

-- Schedule refresh every 5 minutes using pg_cron (if extension is enabled)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        -- Schedule the refresh
        PERFORM cron.schedule('refresh-leaderboard', '*/5 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY public.leaderboard_rankings');
    END IF;
END $$;
