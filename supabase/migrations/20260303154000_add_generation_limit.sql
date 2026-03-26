-- Add generation_count to track how many times 'load more' was used
ALTER TABLE public.practice_sessions ADD COLUMN IF NOT EXISTS generation_count INTEGER DEFAULT 0;
