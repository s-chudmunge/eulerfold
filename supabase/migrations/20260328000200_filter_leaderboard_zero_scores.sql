-- Filter Leaderboard to exclude users with zero composite scores
-- This ensures only active members with some progress are shown in the Top Performers list.

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
        -- 2. Roadmaps Started/Contributed
        COALESCE((
            SELECT COUNT(DISTINCT rid) 
            FROM public.user_skills us, 
                 LATERAL unnest(us.contributing_roadmap_ids) AS rid 
            WHERE us.user_id = p.supabase_uid
        ), 0) AS roadmaps_count,
        -- 3. Practice Points
        COALESCE((
            SELECT COUNT(*) 
            FROM public.practice_progress pp 
            WHERE pp.user_id = p.supabase_uid AND pp.completed = true
        ), 0) AS practice_points,
        -- 4. Assessments
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
),
calculated_stats AS (
    SELECT 
        *,
        (LEAST(avg_confidence, 100.0) * 0.30) +
        (LEAST(roadmaps_count * 10.0, 100.0) * 0.25) +
        (LEAST(practice_points * 0.2, 100.0) * 0.20) +
        (LEAST(streak * 1.0, 100.0) * 0.15) +
        (LEAST(assessments_count * 5.0, 100.0) * 0.10) AS composite_score
    FROM user_stats
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
    composite_score,
    RANK() OVER (ORDER BY composite_score DESC) AS rank
FROM calculated_stats
WHERE composite_score > 0; -- Only show users who have made progress

-- Re-create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_rankings_id ON public.leaderboard_rankings(id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rankings_rank ON public.leaderboard_rankings(rank);

-- Schedule refresh (if pg_cron is enabled)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.schedule('refresh-leaderboard', '*/5 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY public.leaderboard_rankings');
    END IF;
END $$;
