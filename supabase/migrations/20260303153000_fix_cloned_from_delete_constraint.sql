-- Fix the self-referencing foreign key constraint on the roadmaps table
-- This allows deleting a roadmap even if other roadmaps have been cloned from it.

-- 1. Drop the existing constraint (if it exists)
ALTER TABLE public.roadmaps DROP CONSTRAINT IF EXISTS roadmaps_cloned_from_fkey;

-- 2. Re-add the constraint with ON DELETE SET NULL
ALTER TABLE public.roadmaps
ADD CONSTRAINT roadmaps_cloned_from_fkey
FOREIGN KEY (cloned_from)
REFERENCES public.roadmaps(id)
ON DELETE SET NULL;
