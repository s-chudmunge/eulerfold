-- Migration: Make username mandatory and drop profile_visibility
-- 1. Handle existing null usernames by setting a placeholder based on ID or email
-- This ensures the column can be made NOT NULL
UPDATE public.profiles
SET username = 'user_' || id
WHERE username IS NULL;

-- 2. Make username NOT NULL
ALTER TABLE public.profiles
ALTER COLUMN username SET NOT NULL;

-- 3. Drop profile_visibility column
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS profile_visibility;

-- 4. Update handle_new_user trigger function to use a default username
-- Note: In a real app, you might want to generate this from email or full_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        supabase_uid, 
        email, 
        username,
        display_name, 
        is_active, 
        profile_completed, 
        onboarding_completed, 
        eulercoins
    )
    VALUES (
        NEW.id, 
        NEW.email, 
        'user_' || substring(NEW.id::text, 1, 8), -- Temporary unique username
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'EulerFold User'),
        TRUE,
        FALSE,
        FALSE,
        0
    )
    ON CONFLICT (supabase_uid) DO UPDATE
    SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
