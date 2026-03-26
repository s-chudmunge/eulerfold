-- Migration: Ensure module_progress has topic_index and correct constraints
-- Generated: 2026-03-13

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'module_progress' AND column_name = 'topic_index') THEN
        ALTER TABLE public.module_progress ADD COLUMN topic_index INTEGER DEFAULT 0;
    END IF;
END $$;

-- Drop existing unique constraints that might conflict
ALTER TABLE public.module_progress DROP CONSTRAINT IF EXISTS module_progress_roadmap_id_module_number_topic_index_key;
ALTER TABLE public.module_progress DROP CONSTRAINT IF EXISTS module_progress_roadmap_id_user_email_module_number_topic_index_key;

-- Add the definitive unique constraint for topic tracking per user
ALTER TABLE public.module_progress 
ADD CONSTRAINT module_progress_roadmap_user_module_topic_key 
UNIQUE (roadmap_id, user_email, module_number, topic_index);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_module_progress_topic_index ON public.module_progress(topic_index);
