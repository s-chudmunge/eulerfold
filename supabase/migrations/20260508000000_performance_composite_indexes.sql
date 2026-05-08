-- High-frequency lookup optimization for progress tracking
CREATE INDEX IF NOT EXISTS idx_module_progress_composite 
ON public.module_progress(user_email, roadmap_id, module_number);

-- Optimization for activity feed and stats
CREATE INDEX IF NOT EXISTS idx_submissions_user_activity 
ON public.submissions(user_email, submitted_at DESC);

-- Optimization for practice tracking
CREATE INDEX IF NOT EXISTS idx_practice_progress_composite 
ON public.practice_progress(user_id, session_id, completed);

-- Optimization for roadmap discovery
CREATE INDEX IF NOT EXISTS idx_roadmaps_discovery_composite 
ON public.roadmaps(is_public, created_at DESC) 
WHERE is_public = true;
