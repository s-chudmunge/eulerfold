-- Enable pgvector extension if it's not already enabled
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- Create the curated_videos table
CREATE TABLE IF NOT EXISTS public.curated_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id TEXT UNIQUE NOT NULL,
    topic TEXT NOT NULL,          -- The broad roadmap topic (e.g., 'JavaScript Event Loop')
    clean_title TEXT NOT NULL,    -- The actual video title (e.g., 'What the heck is the event loop anyway?')
    channel TEXT NOT NULL,        -- The target channel (e.g., 'JSConf')
    duration_mins INTEGER NOT NULL,
    topic_embedding VECTOR(768),  -- For semantic similarity matching with Gemini (768 dimensions)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.curated_videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access (assuming the backend/frontend needs to query it)
CREATE POLICY "Allow public read access to curated_videos" 
    ON public.curated_videos 
    FOR SELECT 
    USING (true);

-- Create an HNSW index for ultra-fast semantic similarity searches
-- HNSW is the recommended index type in modern pgvector over IVFFlat
CREATE INDEX IF NOT EXISTS curated_videos_embedding_idx
    ON public.curated_videos 
    USING hnsw (topic_embedding vector_cosine_ops);
