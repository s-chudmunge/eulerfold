-- Migration: Add re-evaluation tracking to submissions
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS re_eval_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dispute_context TEXT;
