-- Add to roadmaps table
ALTER TABLE public.roadmaps ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE public.roadmaps ADD COLUMN IF NOT EXISTS show_author BOOLEAN DEFAULT true;
ALTER TABLE public.roadmaps ADD COLUMN IF NOT EXISTS cloned_from INTEGER REFERENCES public.roadmaps(id);
ALTER TABLE public.roadmaps ADD COLUMN IF NOT EXISTS clone_count INTEGER DEFAULT 0;
ALTER TABLE public.roadmaps ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;

-- Create roadmap_reports table
CREATE TABLE IF NOT EXISTS public.roadmap_reports (
  id SERIAL PRIMARY KEY,
  roadmap_id INTEGER REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  reporter_email TEXT,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: public roadmaps readable by everyone
-- Note: Checking if policy exists first is tricky in raw SQL, but standard practice in migrations.
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public roadmaps viewable by all'
    ) THEN
        CREATE POLICY "Public roadmaps viewable by all"
        ON public.roadmaps FOR SELECT
        USING (is_public = true OR email = auth.jwt() ->> 'email');
    END IF;
END $$;

-- RLS: only authenticated users can report
ALTER TABLE public.roadmap_reports ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can report'
    ) THEN
        CREATE POLICY "Authenticated users can report"
        ON public.roadmap_reports FOR INSERT
        WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

-- Indexes for exploration
CREATE INDEX IF NOT EXISTS idx_roadmaps_is_public ON public.roadmaps(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_roadmaps_clone_count ON public.roadmaps(clone_count DESC);
CREATE INDEX IF NOT EXISTS idx_roadmap_reports_roadmap_id ON public.roadmap_reports(roadmap_id);

-- RPC function for atomic increment of clone_count
CREATE OR REPLACE FUNCTION increment_clone_count(row_id INT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.roadmaps
    SET clone_count = clone_count + 1
    WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function for atomic increment of report_count
CREATE OR REPLACE FUNCTION increment_report_count(row_id INT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.roadmaps
    SET report_count = report_count + 1
    WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Explicitly restrict SELECT on reports (default is already deny if no policy exists, but this is clearer)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'No one can select reports'
    ) THEN
        CREATE POLICY "No one can select reports"
        ON public.roadmap_reports FOR SELECT
        USING (false);
    END IF;
END $$;
