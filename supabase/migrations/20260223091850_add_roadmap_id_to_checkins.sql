-- Create roadmaps table
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    roadmap_plan JSONB NOT NULL,
    subject TEXT,
    goal TEXT,
    time_value INTEGER,
    time_unit TEXT,
    model TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add roadmap_id to checkin_entries
ALTER TABLE public.checkin_entries 
ADD COLUMN IF NOT EXISTS roadmap_id INTEGER REFERENCES public.roadmaps(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_checkin_entries_roadmap_id ON public.checkin_entries(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps(user_id);
