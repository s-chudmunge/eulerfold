-- Migration: Add topic_mappings to user_skills
-- Generated: 2026-03-07

ALTER TABLE public.user_skills 
ADD COLUMN IF NOT EXISTS topic_mappings JSONB DEFAULT '{}'::jsonb;

-- Example structure: {"roadmap_id_1": ["topic_index_1", "topic_index_2"]}
