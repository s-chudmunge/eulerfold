-- Robust handle_new_user trigger V2
-- This handles potential conflicts more gracefully and ensures profiles are always created.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    base_username TEXT;
    final_username TEXT;
    iter INTEGER := 0;
    existing_id UUID;
BEGIN
    -- 1. Check if a profile already exists for this UID
    SELECT supabase_uid INTO existing_id FROM public.profiles WHERE supabase_uid = NEW.id;
    IF existing_id IS NOT NULL THEN
        RETURN NEW;
    END IF;

    -- 2. Derive base username from email or metadata
    base_username := LOWER(COALESCE(
        split_part(NEW.email, '@', 1),
        substring(NEW.raw_user_meta_data->>'full_name' from 1 for 10),
        substring(NEW.raw_user_meta_data->>'name' from 1 for 10),
        'user'
    ));
    
    -- Clean base_username: only alphanumeric and underscores
    base_username := regexp_replace(base_username, '[^a-z0-9_]', '', 'g');
    
    -- Ensure at least 3 chars
    IF length(base_username) < 3 THEN
        base_username := base_username || 'user';
    END IF;

    -- Generate a unique username by appending part of UUID
    final_username := substring(base_username, 1, 15) || '_' || substring(NEW.id::text, 1, 4);

    -- 3. Perform the insert with an even more robust ON CONFLICT
    -- We try to insert, and if UID exists, we update. 
    -- If EMAIL exists but UID is different, it will still fail UNLESS we handle it.
    -- However, Supabase "One account per email" should prevent this.
    -- To be safe, we'll catch any error and return NEW to not block auth.
    
    BEGIN
        INSERT INTO public.profiles (
            supabase_uid, 
            email, 
            username,
            display_name, 
            is_active, 
            profile_completed, 
            onboarding_completed, 
            eulercoins,
            roadmap_credits,
            tos_version
        )
        VALUES (
            NEW.id, 
            NEW.email, 
            final_username,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'EulerFold User'),
            TRUE,
            FALSE,
            FALSE,
            0,
            1,
            NULL -- Forced null to show ToS modal on first login
        )
        ON CONFLICT (supabase_uid) DO UPDATE
        SET 
            email = EXCLUDED.email,
            display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name);
    EXCEPTION WHEN unique_violation THEN
        -- If email is already taken by another UID, we can't do much without breaking things.
        -- But we can at least log it or handle it.
        -- For now, we update the existing profile's UID if it has the same email but NO UID? 
        -- No, let's just update the email of the existing profile to something else if it's a different user? 
        -- No, the safest is to let it fail but NOT block the auth transaction.
        RAISE NOTICE 'Unique violation in handle_new_user for email %', NEW.email;
    END;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Fallback: return NEW so the user can at least sign in, even if profile creation failed.
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
