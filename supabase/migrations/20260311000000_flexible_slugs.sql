-- Migration: Flexible slugs for shared content
-- Allows multiple users to have the same slug (for public clones),
-- but prevents a single user from having duplicate slugs.

-- 1. Remove the global unique constraint
ALTER TABLE public.roadmaps DROP CONSTRAINT IF EXISTS roadmaps_slug_unique;

-- 2. Add composite unique constraint (email, slug)
-- This ensures one user cannot have two roadmaps with the same slug,
-- but different users CAN share a slug (e.g. for a public roadmap they cloned).
ALTER TABLE public.roadmaps ADD CONSTRAINT roadmaps_email_slug_unique UNIQUE (email, slug);
