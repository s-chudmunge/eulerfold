-- Migration: Add MCQ sessions and update roadmap_credits type
-- Date: 2026-04-17

-- 1. Update roadmap_credits to support decimal values (0.01 increments)
ALTER TABLE public.profiles 
ALTER COLUMN roadmap_credits TYPE NUMERIC(10, 2);

-- 2. Create mcq_sessions table to store generated questions and user progress
CREATE TABLE IF NOT EXISTS public.mcq_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    roadmap_id BIGINT NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    subtopic_id UUID NOT NULL,
    topic_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    week_number INTEGER NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    user_answers JSONB DEFAULT '[]'::jsonb,
    score FLOAT, -- Percentage 0.0 to 1.0, NULL until submitted
    credit_cost NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'abandoned'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.mcq_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Policies for mcq_sessions
CREATE POLICY "Users can manage their own MCQ sessions"
ON public.mcq_sessions
FOR ALL
USING (auth.uid() = user_id);

-- 5. Set up updated_at trigger
CREATE TRIGGER set_mcq_sessions_updated_at
BEFORE UPDATE ON public.mcq_sessions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
