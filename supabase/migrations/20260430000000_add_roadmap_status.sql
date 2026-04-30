-- Add status column to roadmaps table
ALTER TABLE public.roadmaps
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Update existing roadmaps to 'active' if they don't have a status (though default handles it for new rows)
-- For existing rows, they will get 'active' by default because of the DEFAULT clause.

-- Add index on status for analytics
CREATE INDEX IF NOT EXISTS idx_roadmaps_status ON public.roadmaps(status);
