-- Create discussion_threads table
CREATE TABLE IF NOT EXISTS public.discussion_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_type TEXT NOT NULL,
    context_id TEXT NOT NULL,
    author_id INTEGER NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
    content TEXT, -- Nullable to allow for server-side soft delete nulling
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient context-based lookups
CREATE INDEX IF NOT EXISTS idx_discussion_threads_context ON public.discussion_threads(context_type, context_id);
-- Index for efficient parent-based lookups
CREATE INDEX IF NOT EXISTS idx_discussion_threads_parent ON public.discussion_threads(parent_id);

-- Create discussion_reports table
CREATE TABLE IF NOT EXISTS public.discussion_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    comment_id UUID NOT NULL REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, comment_id)
);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to discussion_threads
CREATE TRIGGER update_discussion_threads_updated_at
    BEFORE UPDATE ON public.discussion_threads
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security (RLS) Configuration
ALTER TABLE public.discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_reports ENABLE ROW LEVEL SECURITY;

-- Explicitly deny ALL write operations for anon and authenticated roles
-- This ensures ONLY the Service Role (bypassing RLS) can write.
CREATE POLICY "Deny INSERT for public" ON public.discussion_threads FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny UPDATE for public" ON public.discussion_threads FOR UPDATE USING (false);
CREATE POLICY "Deny DELETE for public" ON public.discussion_threads FOR DELETE USING (false);

CREATE POLICY "Deny INSERT for reports" ON public.discussion_reports FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny UPDATE for reports" ON public.discussion_reports FOR UPDATE USING (false);
CREATE POLICY "Deny DELETE for reports" ON public.discussion_reports FOR DELETE USING (false);

-- Allow public and authenticated SELECT on discussion_threads
CREATE POLICY "Allow public SELECT on discussion_threads" 
ON public.discussion_threads FOR SELECT 
USING (true);

-- Allow authenticated users to SELECT their own reports
CREATE POLICY "Allow users to SELECT their own reports" 
ON public.discussion_reports FOR SELECT 
TO authenticated 
USING (user_id IN (SELECT id FROM public.profiles WHERE supabase_uid = auth.uid()));
