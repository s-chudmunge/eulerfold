-- Create assessment_sessions table
CREATE TABLE IF NOT EXISTS public.assessment_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    skill_id UUID REFERENCES public.canonical_skills(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'started' CHECK (status IN ('started', 'completed', 'expired', 'flagged')),
    score FLOAT DEFAULT 0.0,
    tab_switch_count INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    questions JSONB NOT NULL, -- Array of objects: {id, type, question, options, correct_answer, user_answer, explanation}
    evaluation_metadata JSONB DEFAULT '{}', -- Store AI feedback/reasoning
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_user_id ON public.assessment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_skill_id ON public.assessment_sessions(skill_id);

-- RLS Policies
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assessments"
    ON public.assessment_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments"
    ON public.assessment_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
    ON public.assessment_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- Add assessment_score to user_skills
ALTER TABLE public.user_skills
ADD COLUMN IF NOT EXISTS last_assessment_score FLOAT,
ADD COLUMN IF NOT EXISTS last_assessment_at TIMESTAMPTZ;
