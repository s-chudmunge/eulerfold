-- Create practice_sessions table
CREATE TABLE IF NOT EXISTS public.practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    roadmap_id BIGINT NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    subtopic_id UUID NOT NULL,
    resources JSONB DEFAULT '[]'::jsonb,
    has_more BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, subtopic_id)
);

-- Create practice_progress table
CREATE TABLE IF NOT EXISTS public.practice_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL,
    completed BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, session_id, resource_id)
);

-- Enable RLS
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_progress ENABLE ROW LEVEL SECURITY;

-- Policies for practice_sessions
CREATE POLICY "Users can manage their own practice sessions"
ON public.practice_sessions
FOR ALL
USING (auth.uid() = user_id);

-- Policies for practice_progress
CREATE POLICY "Users can manage their own practice progress"
ON public.practice_progress
FOR ALL
USING (auth.uid() = user_id);

-- Updated at trigger for practice_sessions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_practice_sessions_updated_at
BEFORE UPDATE ON public.practice_sessions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_practice_progress_updated_at
BEFORE UPDATE ON public.practice_progress
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
