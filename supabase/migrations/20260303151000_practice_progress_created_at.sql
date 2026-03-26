-- Add created_at to practice_progress
ALTER TABLE public.practice_progress ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
