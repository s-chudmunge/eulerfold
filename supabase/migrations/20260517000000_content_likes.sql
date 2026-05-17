-- Create content_likes table
CREATE TABLE IF NOT EXISTS public.content_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_type TEXT NOT NULL,
    context_id TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(context_type, context_id, user_id)
);

-- Index for efficient lookup and count
CREATE INDEX IF NOT EXISTS idx_content_likes_context ON public.content_likes(context_type, context_id);

-- RLS Configuration
ALTER TABLE public.content_likes ENABLE ROW LEVEL SECURITY;

-- Deny direct write from public/authenticated (enforce server-side logic via Admin SDK)
CREATE POLICY "Deny INSERT for content_likes" ON public.content_likes FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny DELETE for content_likes" ON public.content_likes FOR DELETE USING (false);

-- Allow public SELECT (to see counts)
CREATE POLICY "Allow public SELECT on content_likes" ON public.content_likes FOR SELECT USING (true);
