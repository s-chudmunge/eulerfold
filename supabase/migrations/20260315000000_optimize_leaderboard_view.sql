-- Optimize Leaderboard Materialized View to include all required fields for fast API reads
-- This includes email, eulercoins, roadmaps_count, and top skill data.

DROP MATERIALIZED VIEW IF EXISTS public.leaderboard_rankings;

CREATE MATERIALIZED VIEW public.leaderboard_rankings AS
WITH user_stats AS (
    SELECT 
        p.supabase_uid AS id,
        p.username,
        p.display_name,
        p.email,
        p.eulercoins,
        COALESCE(p.current_streak, 0) AS streak,
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
        -- 4. Assessments (Count scored assessments)
        COALESCE((
            SELECT COUNT(*) 
            FROM public.assessment_sessions ass 
            WHERE ass.user_id = p.supabase_uid AND ass.status = 'scored'
        ), 0) AS assessments_count,
        -- 5. Top Skill Subquery
        (
            SELECT jsonb_build_object('name', cs.name, 'category', cs.category, 'score', us.confidence_score)
            FROM public.user_skills us
            JOIN public.canonical_skills cs ON us.canonical_skill_id = cs.id
            WHERE us.user_id = p.supabase_uid
            ORDER BY us.confidence_score DESC
            LIMIT 1
        ) AS top_skill_data
    FROM public.profiles p
)
SELECT 
    id,
    username,
    display_name,
    email,
    eulercoins,
    streak,
    roadmaps_count,
    (top_skill_data->>'name')::text AS top_skill_name,
    (top_skill_data->>'category')::text AS top_skill_category,
    (top_skill_data->>'score')::float AS top_skill_score,
    -- Normalized Composite Score Calculation (same weights as before)
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
CREATE INDEX IF NOT EXISTS idx_leaderboard_rankings_category ON public.leaderboard_rankings(top_skill_category);

-- Refresh every 5 minutes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.schedule('refresh-leaderboard', '*/5 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY public.leaderboard_rankings');
    END IF;
END $$;
