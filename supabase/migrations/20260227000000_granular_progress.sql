-- Migration: Add granular progress tracking for Learning Mode
-- Generated: 2026-02-27

-- 1. Add current_topic_index to checkin_entries to track current position
ALTER TABLE public.checkin_entries 
ADD COLUMN IF NOT EXISTS current_topic_index INTEGER DEFAULT 0;

-- 2. Enhance module_progress to track topic-level completion
-- We'll add a topic_index column to module_progress
ALTER TABLE public.module_progress
ADD COLUMN IF NOT EXISTS topic_index INTEGER;

-- Create a unique constraint to prevent duplicate progress entries for the same topic
-- This allows us to track completion for each topic individually
ALTER TABLE public.module_progress
DROP CONSTRAINT IF EXISTS module_progress_roadmap_id_module_number_topic_index_key;

ALTER TABLE public.module_progress
ADD CONSTRAINT module_progress_roadmap_id_module_number_topic_index_key 
UNIQUE (roadmap_id, module_number, topic_index);
