-- Migration: Enable public read access for profiles, skills and submissions
-- This allows the public profile page to work without being logged in as the owner

-- 1. Profiles: Allow public to view any profile by username
-- We already have "Users can view own profile", let's add a public one.
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (TRUE);

-- 2. User Skills: Allow public to view skills
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User skills are viewable by everyone" 
ON public.user_skills FOR SELECT 
USING (TRUE);

CREATE POLICY "Users can insert own skills" 
ON public.user_skills FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills" 
ON public.user_skills FOR UPDATE 
USING (auth.uid() = user_id);

-- 3. Submissions: Allow public to view accepted submissions
-- Existing policy: "Users can view own submissions"
DROP POLICY IF EXISTS "Users can view own submissions" ON public.submissions;

CREATE POLICY "Accepted submissions are viewable by everyone" 
ON public.submissions FOR SELECT 
USING (evaluation_level IN ('Solid', 'Developing') OR auth.jwt() ->> 'email' = user_email);

-- 4. Canonical Skills: Ensure these are viewable
ALTER TABLE public.canonical_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Canonical skills are viewable by everyone" 
ON public.canonical_skills FOR SELECT 
USING (TRUE);
