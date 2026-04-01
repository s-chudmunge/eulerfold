-- 1. Add unsubscribed column to profiles for global unsubscription
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unsubscribed BOOLEAN DEFAULT false;

-- 2. Drop triggers that depend on checkin_entries
DROP TRIGGER IF EXISTS on_topic_completed ON public.module_progress;
DROP TRIGGER IF EXISTS on_roadmap_position_updated ON public.roadmaps;
DROP TRIGGER IF EXISTS on_practice_progress_updated ON public.practice_progress;

-- 3. Drop functions that depend on checkin_entries
DROP FUNCTION IF EXISTS public.update_last_activity_on_roadmap();
DROP FUNCTION IF EXISTS public.update_last_activity_on_practice();
DROP FUNCTION IF EXISTS public.update_last_activity_on_progress();

-- 4. Drop the checkin_entries table
DROP TABLE IF EXISTS public.checkin_entries CASCADE;
