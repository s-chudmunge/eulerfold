-- Migration: Create study_tasks table for the Planner
-- Generated: 2026-04-30

CREATE TABLE IF NOT EXISTS public.study_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  roadmap_id INTEGER REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  module_number INTEGER,
  task_type TEXT NOT NULL CHECK (task_type IN ('module', 'practice', 'pow', 'video', 'custom')),
  title TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own study tasks"
  ON public.study_tasks FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert their own study tasks"
  ON public.study_tasks FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can update their own study tasks"
  ON public.study_tasks FOR UPDATE
  USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can delete their own study tasks"
  ON public.study_tasks FOR DELETE
  USING (auth.jwt() ->> 'email' = user_email);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_study_tasks_user_email ON public.study_tasks(user_email);
CREATE INDEX IF NOT EXISTS idx_study_tasks_date ON public.study_tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_study_tasks_roadmap_id ON public.study_tasks(roadmap_id);

-- Updated at trigger
CREATE TRIGGER set_study_tasks_updated_at
  BEFORE UPDATE ON public.study_tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
