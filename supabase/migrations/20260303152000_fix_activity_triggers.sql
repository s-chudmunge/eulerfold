-- Fix for roadmaps position trigger
-- The previous function assumed every table had a 'roadmap_id' field, but 'roadmaps' has 'id'.

-- 1. Create specialized function for roadmaps table
CREATE OR REPLACE FUNCTION public.update_last_activity_on_roadmap()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.checkin_entries
    SET last_activity_at = NOW()
    WHERE roadmap_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Specialized function for practice progress
CREATE OR REPLACE FUNCTION public.update_last_activity_on_practice()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.checkin_entries
    SET last_activity_at = NOW()
    WHERE roadmap_id = (SELECT roadmap_id FROM public.practice_sessions WHERE id = NEW.session_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update the roadmap trigger to use the specialized function
DROP TRIGGER IF EXISTS on_roadmap_position_updated ON public.roadmaps;
CREATE TRIGGER on_roadmap_position_updated
    AFTER UPDATE OF last_position ON public.roadmaps
    FOR EACH ROW EXECUTE FUNCTION public.update_last_activity_on_roadmap();

-- 4. Add trigger for practice progress activity
DROP TRIGGER IF EXISTS on_practice_progress_updated ON public.practice_progress;
CREATE TRIGGER on_practice_progress_updated
    AFTER INSERT OR UPDATE ON public.practice_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_last_activity_on_practice();
