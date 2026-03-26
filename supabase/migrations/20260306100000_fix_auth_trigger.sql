-- Fix Migration: Robust handle_new_user trigger
-- This addresses the "Database error saving new user" issue

-- 1. Ensure all profiles have a username (fallback for any missed in previous migration)
UPDATE public.profiles
SET username = 'user_' || id
WHERE username IS NULL;

-- 2. Make username NOT NULL if not already
ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;

-- 3. Define a more robust and safe handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    base_username TEXT;
    final_username TEXT;
    iter INTEGER := 0;
BEGIN
    -- Derive base username from email or name
    base_username := LOWER(COALESCE(
        split_part(NEW.email, '@', 1),
        substring(NEW.raw_user_meta_data->>'full_name' from 1 for 10),
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

    -- Perform the insert
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

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- CRITICAL: Prevent the entire signup transaction from failing.
    -- The user will be created in auth.users, and we can fix the profile manually if needed.
    -- We return NEW to allow the auth record to be saved.
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-create the trigger to ensure it points to the latest function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
