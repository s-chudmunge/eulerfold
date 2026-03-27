-- Increase free roadmap credits from 1 to 5
ALTER TABLE public.profiles ALTER COLUMN roadmap_credits SET DEFAULT 5;

-- Update existing users: Give them the 4 additional credits
UPDATE public.profiles SET roadmap_credits = roadmap_credits + 4;

-- Update the handle_new_user function to use 5 as the default
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
        5, -- Changed from 1 to 5
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
