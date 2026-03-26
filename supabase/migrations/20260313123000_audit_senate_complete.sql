-- Migration: Complete Audit Senate System Schema
-- Generated: 2026-03-13 12:30

ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS senate_votes JSONB,
ADD COLUMN IF NOT EXISTS senate_reasoning JSONB,
ADD COLUMN IF NOT EXISTS senate_agreement INTEGER,
ADD COLUMN IF NOT EXISTS dissent_note TEXT,
ADD COLUMN IF NOT EXISTS is_senate_eval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS senate_summary TEXT;

-- Index for filtering senate evaluations
CREATE INDEX IF NOT EXISTS submissions_is_senate_eval_idx ON submissions(is_senate_eval);

-- Comment for clarity
COMMENT ON TABLE public.submissions IS 'Stores technical project submissions and their multi-agent AI Senate evaluations.';
