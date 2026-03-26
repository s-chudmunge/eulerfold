-- Migration: Ensure Cascading Deletes for Account Purge
-- Generated: 2026-03-13

-- 1. Link profiles to auth.users with cascade
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_supabase_uid_fkey,
ADD CONSTRAINT profiles_supabase_uid_fkey 
    FOREIGN KEY (supabase_uid) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- 2. Link roadmaps to profiles with cascade
-- First find the existing constraint name if any, or just drop and add
ALTER TABLE public.roadmaps
DROP CONSTRAINT IF EXISTS roadmaps_user_id_fkey,
ADD CONSTRAINT roadmaps_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;

-- 3. Ensure checkin_entries are linked to roadmaps (already has cascade from previous migration)
-- But some old entries might only have email. 
-- We'll handle those in the backend or just rely on roadmap cascade.

-- 4. Add index for performance on deletions
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id_cascade ON public.roadmaps(user_id);
