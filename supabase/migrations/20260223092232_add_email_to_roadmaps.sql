ALTER TABLE public.roadmaps
ADD COLUMN email TEXT;

CREATE INDEX IF NOT EXISTS idx_roadmaps_email ON public.roadmaps(email);
