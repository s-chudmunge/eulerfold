-- Migration: Correct position tracking and enhance progress tracking
-- Generated: 2026-02-27

-- 1. Add last_position JSONB to roadmaps table (Better place for high-frequency updates)
-- Format: {"mIdx": 0, "tIdx": 0}
ALTER TABLE public.roadmaps 
ADD COLUMN IF NOT EXISTS last_position JSONB DEFAULT '{"mIdx": 0, "tIdx": 0}';

-- 2. (Optional Cleanup) If previous migration ran, remove from checkin_entries to keep it clean for scheduling
ALTER TABLE public.checkin_entries 
DROP COLUMN IF EXISTS current_topic_index;

-- 3. Enhance module_progress with topic_index and ensure unique constraint
-- (Handling case where column might already exist from previous partial step)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'module_progress' AND column_name = 'topic_index') THEN
        ALTER TABLE public.module_progress ADD COLUMN topic_index INTEGER;
    END IF;
END $$;

-- Drop old constraint if exists and add refined unique constraint
ALTER TABLE public.module_progress
DROP CONSTRAINT IF EXISTS module_progress_roadmap_id_module_number_topic_index_key;

ALTER TABLE public.module_progress
ADD CONSTRAINT module_progress_roadmap_id_module_number_topic_index_key 
UNIQUE (roadmap_id, module_number, topic_index);

-- 4. Ensure RLS for module_progress allows UPSERT (INSERT + UPDATE)
-- The existing policies in enable_rls.sql already cover SELECT, INSERT, UPDATE based on user_email.
-- Supabase upsert requires both INSERT and UPDATE permissions.
-- We'll add a DELETE policy for module_progress just in case
CREATE POLICY "Users can delete own module progress" 
ON public.module_progress FOR DELETE 
USING (auth.jwt() ->> 'email' = user_email);
