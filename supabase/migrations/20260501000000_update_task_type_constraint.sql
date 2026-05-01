-- Migration: Update study_tasks task_type check constraint
-- Generated: 2026-05-01

-- Drop the old constraint
ALTER TABLE public.study_tasks DROP CONSTRAINT IF EXISTS study_tasks_task_type_check;

-- Add the new constraint with 'research' and 'article'
ALTER TABLE public.study_tasks ADD CONSTRAINT study_tasks_task_type_check 
  CHECK (task_type IN ('module', 'practice', 'pow', 'video', 'custom', 'research', 'article'));
