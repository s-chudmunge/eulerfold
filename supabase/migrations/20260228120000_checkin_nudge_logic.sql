-- 1. Add last_activity_at to track when user last actually learned
ALTER TABLE public.checkin_entries ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Update existing entries
UPDATE public.checkin_entries SET last_activity_at = created_at WHERE last_activity_at IS NULL;

-- 3. Create function to update last_activity_at on progress
CREATE OR REPLACE FUNCTION update_last_activity_on_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.checkin_entries
    SET last_activity_at = NOW()
    WHERE roadmap_id = NEW.roadmap_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger for topic completion
DROP TRIGGER IF EXISTS on_topic_completed ON public.module_progress;
CREATE TRIGGER on_topic_completed
    AFTER INSERT OR UPDATE ON public.module_progress
    FOR EACH ROW EXECUTE FUNCTION update_last_activity_on_progress();

-- 5. Trigger for manual position update
DROP TRIGGER IF EXISTS on_roadmap_position_updated ON public.roadmaps;
CREATE TRIGGER on_roadmap_position_updated
    AFTER UPDATE OF last_position ON public.roadmaps
    FOR EACH ROW EXECUTE FUNCTION update_last_activity_on_progress();
