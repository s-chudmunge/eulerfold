-- Add roadmap_credits to track paid generation capacity
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roadmap_credits INTEGER DEFAULT 1;

-- Give existing users 1 credit so they aren't completely blocked immediately
UPDATE public.profiles SET roadmap_credits = 1 WHERE roadmap_credits IS NULL;
