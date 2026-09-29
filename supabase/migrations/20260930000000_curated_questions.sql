-- Migration: Add curated_questions table and match_curated_questions RPC for semantic vector practice
-- Date: 2026-09-30

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

CREATE TABLE IF NOT EXISTS public.curated_questions (
    id TEXT PRIMARY KEY,
    domain TEXT NOT NULL,
    subtopic TEXT,
    subject TEXT,
    difficulty TEXT NOT NULL,
    momentum_stage TEXT,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer_index INTEGER NOT NULL,
    explanation TEXT NOT NULL,
    concepts_tested JSONB DEFAULT '[]'::jsonb,
    misconception_map JSONB DEFAULT '{}'::jsonb,
    source TEXT DEFAULT 'eulerfold-benchmark',
    question_embedding VECTOR(1024),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.curated_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to curated_questions"
    ON public.curated_questions
    FOR SELECT
    USING (true);

CREATE INDEX IF NOT EXISTS curated_questions_embedding_idx
    ON public.curated_questions
    USING hnsw (question_embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS curated_questions_domain_idx
    ON public.curated_questions (domain);

CREATE INDEX IF NOT EXISTS curated_questions_difficulty_idx
    ON public.curated_questions (difficulty);

-- RPC for cosine similarity search over curated benchmark questions
CREATE OR REPLACE FUNCTION public.match_curated_questions(
    query_embedding VECTOR(1024),
    match_threshold FLOAT DEFAULT 0.40,
    match_count INT DEFAULT 30,
    filter_domain TEXT DEFAULT NULL
)
RETURNS TABLE (
    id TEXT,
    domain TEXT,
    subtopic TEXT,
    subject TEXT,
    difficulty TEXT,
    momentum_stage TEXT,
    question TEXT,
    options JSONB,
    correct_answer_index INTEGER,
    explanation TEXT,
    concepts_tested JSONB,
    misconception_map JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        cq.id,
        cq.domain,
        cq.subtopic,
        cq.subject,
        cq.difficulty,
        cq.momentum_stage,
        cq.question,
        cq.options,
        cq.correct_answer_index,
        cq.explanation,
        cq.concepts_tested,
        cq.misconception_map,
        1 - (cq.question_embedding <=> query_embedding) AS similarity
    FROM public.curated_questions cq
    WHERE 
        (filter_domain IS NULL OR cq.domain = filter_domain)
        AND (1 - (cq.question_embedding <=> query_embedding)) >= match_threshold
    ORDER BY cq.question_embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
