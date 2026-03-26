-- Migration: Fix module_progress unique constraint for upsert
-- Generated: 2026-03-07

-- The backend code uses upsert with on_conflict specifications.
-- We need to ensure a unique constraint exists that includes user_email and topic_index
-- to allow for granular progress tracking while supporting legacy module-level upserts.

ALTER TABLE public.module_progress
DROP CONSTRAINT IF EXISTS module_progress_roadmap_id_module_number_topic_index_key;

ALTER TABLE public.module_progress
DROP CONSTRAINT IF EXISTS module_progress_roadmap_id_user_email_module_number_topic_key;

ALTER TABLE public.module_progress
ADD CONSTRAINT module_progress_roadmap_id_user_email_module_number_topic_key 
UNIQUE (roadmap_id, user_email, module_number, topic_index);
