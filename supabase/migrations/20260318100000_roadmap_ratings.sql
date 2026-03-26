-- Create roadmap_ratings table
CREATE TABLE IF NOT EXISTS public.roadmap_ratings (
    id SERIAL PRIMARY KEY,
    roadmap_id INTEGER REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(roadmap_id, user_id)
);

-- Add aggregate columns to roadmaps table
ALTER TABLE public.roadmaps ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE public.roadmaps ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- Function to update roadmap aggregates
CREATE OR REPLACE FUNCTION update_roadmap_rating_aggregates()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE public.roadmaps
        SET 
            average_rating = (
                SELECT ROUND(AVG(rating)::numeric, 2)
                FROM public.roadmap_ratings
                WHERE roadmap_id = NEW.roadmap_id
            ),
            rating_count = (
                SELECT COUNT(*)
                FROM public.roadmap_ratings
                WHERE roadmap_id = NEW.roadmap_id
            )
        WHERE id = NEW.roadmap_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.roadmaps
        SET 
            average_rating = COALESCE((
                SELECT ROUND(AVG(rating)::numeric, 2)
                FROM public.roadmap_ratings
                WHERE roadmap_id = OLD.roadmap_id
            ), 0.00),
            rating_count = (
                SELECT COUNT(*)
                FROM public.roadmap_ratings
                WHERE roadmap_id = OLD.roadmap_id
            )
        WHERE id = OLD.roadmap_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update aggregates on rating change
DROP TRIGGER IF EXISTS tr_update_roadmap_rating_aggregates ON public.roadmap_ratings;
CREATE TRIGGER tr_update_roadmap_rating_aggregates
AFTER INSERT OR UPDATE OR DELETE ON public.roadmap_ratings
FOR EACH ROW EXECUTE FUNCTION update_roadmap_rating_aggregates();

-- RLS: Ratings are publically readable, but only owners can insert/update
ALTER TABLE public.roadmap_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings are viewable by everyone"
ON public.roadmap_ratings FOR SELECT
USING (true);

CREATE POLICY "Users can rate roadmaps"
ON public.roadmap_ratings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
ON public.roadmap_ratings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_roadmap_ratings_roadmap_id ON public.roadmap_ratings(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_ratings_user_id ON public.roadmap_ratings(user_id);
