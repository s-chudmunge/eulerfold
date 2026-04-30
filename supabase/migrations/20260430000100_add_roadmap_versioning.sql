-- Add versioning and snapshot tracking to roadmaps
ALTER TABLE public.roadmaps
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS snapshot_hash TEXT;

-- Index for version tracking
CREATE INDEX IF NOT EXISTS idx_roadmaps_version ON public.roadmaps(version);
