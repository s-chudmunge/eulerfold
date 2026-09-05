-- Migration: Add topic_checkpoints for instant adaptive micro-checks
-- Date: 2026-09-04

CREATE TABLE IF NOT EXISTS public.topic_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id BIGINT NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    module_number INTEGER NOT NULL,
    topic_index INTEGER NOT NULL,
    topic_title TEXT NOT NULL,
    question_data JSONB NOT NULL,
    selected_option INTEGER,
    is_correct BOOLEAN,
    time_spent_seconds INTEGER DEFAULT 0,
    pace_assessment TEXT DEFAULT 'standard',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.topic_checkpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their own checkpoints"
ON public.topic_checkpoints
FOR ALL
USING (auth.jwt() ->> 'email' = user_email OR auth.uid()::text = user_email);

CREATE INDEX IF NOT EXISTS idx_topic_checkpoints_lookup 
ON public.topic_checkpoints(roadmap_id, user_email, module_number, topic_index);

-- ── Global Reusable Curated Checkpoints (Vector Cache) ──
CREATE TABLE IF NOT EXISTS public.curated_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    topic_title TEXT NOT NULL,
    concept_key TEXT,
    question_data JSONB NOT NULL,
    topic_embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.curated_checkpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of curated checkpoints"
ON public.curated_checkpoints
FOR SELECT
USING (true);

-- RPC for cosine similarity search over cached checkpoints
CREATE OR REPLACE FUNCTION public.match_curated_checkpoints(
    query_embedding vector(768),
    match_threshold float,
    match_count int
)
RETURNS TABLE (
    id UUID,
    subject TEXT,
    topic_title TEXT,
    concept_key TEXT,
    question_data JSONB,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        cc.id,
        cc.subject,
        cc.topic_title,
        cc.concept_key,
        cc.question_data,
        1 - (cc.topic_embedding <=> query_embedding) AS similarity
    FROM public.curated_checkpoints cc
    WHERE 1 - (cc.topic_embedding <=> query_embedding) > match_threshold
    ORDER BY cc.topic_embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

