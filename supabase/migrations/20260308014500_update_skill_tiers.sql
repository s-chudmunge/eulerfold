-- Update user_skills tier constraint to allow letter grades
ALTER TABLE public.user_skills DROP CONSTRAINT IF EXISTS user_skills_tier_check;

ALTER TABLE public.user_skills ADD CONSTRAINT user_skills_tier_check 
CHECK (tier IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'strong', 'developing', 'exposure'));
