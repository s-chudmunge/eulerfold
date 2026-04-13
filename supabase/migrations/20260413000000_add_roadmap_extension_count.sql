-- Add extension_count column to roadmaps table
ALTER TABLE public.roadmaps 
ADD COLUMN IF NOT EXISTS extension_count INTEGER DEFAULT 0;

-- Comment for clarity
COMMENT ON COLUMN public.roadmaps.extension_count IS 'Number of times this roadmap has been extended by a Pro user (max 5)';
