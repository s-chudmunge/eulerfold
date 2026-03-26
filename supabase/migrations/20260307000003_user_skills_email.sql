-- Migration: Add user_email to user_skills
-- Generated: 2026-03-07

ALTER TABLE public.user_skills 
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Update existing records if any
UPDATE public.user_skills us
SET user_email = (SELECT email FROM auth.users u WHERE u.id = us.user_id)
WHERE user_email IS NULL;

-- Make email mandatory for future logic
ALTER TABLE public.user_skills ALTER COLUMN user_email SET NOT NULL;

-- Update unique constraint to include email just in case, though user_id should be enough
-- We'll keep it as user_id + canonical_skill_id for now as it's cleaner
