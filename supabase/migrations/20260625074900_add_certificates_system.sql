-- Add certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    roadmap_id BIGINT REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    credential_id TEXT UNIQUE NOT NULL,
    grade TEXT NOT NULL,
    average_score FLOAT NOT NULL,
    time_invested_hours FLOAT NOT NULL,
    pdf_url TEXT,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, roadmap_id)
);

-- RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own certificates" 
ON public.certificates FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view certificates" 
ON public.certificates FOR SELECT 
USING (true); -- Public verification

-- Create storage bucket for certificates if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view certificates bucket"
ON storage.objects FOR SELECT
USING ( bucket_id = 'certificates' );

CREATE POLICY "Authenticated users can upload certificates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'certificates' );
