-- Migration: Make roadmap_id and subtopic_id nullable in mcq_sessions for independent practice
-- Date: 2026-05-09

ALTER TABLE public.mcq_sessions 
ALTER COLUMN roadmap_id DROP NOT NULL,
ALTER COLUMN subtopic_id DROP NOT NULL;
