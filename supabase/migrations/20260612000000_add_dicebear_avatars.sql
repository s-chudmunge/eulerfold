-- Migration: Add DiceBear default avatars
-- Generated: 2026-06-12

-- Ensure avatar_url column exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update the handle_new_user function to use DiceBear fallback
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    base_username TEXT;
    final_username TEXT;
    existing_id UUID;
    final_avatar_url TEXT;
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

    -- 2.5 Determine Avatar URL (fallback to DiceBear initials)
    final_avatar_url := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        'https://api.dicebear.com/7.x/notionists/svg?seed=' || final_username || '&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc'
    );

    -- 3. Perform the insert with an even more robust ON CONFLICT
    BEGIN
        INSERT INTO public.profiles (
            supabase_uid, 
            email, 
            username,
            display_name, 
            avatar_url,
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
            final_avatar_url,
            TRUE,
            FALSE,
            FALSE,
            0,
            5,
            NULL
        )
        ON CONFLICT (supabase_uid) DO UPDATE
        SET 
            email = EXCLUDED.email,
            display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
            avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE 'Unique violation in handle_new_user for email %', NEW.email;
    END;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing users who don't have an avatar_url
UPDATE public.profiles
SET avatar_url = 'https://api.dicebear.com/7.x/notionists/svg?seed=' || username || '&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc'
WHERE avatar_url IS NULL OR avatar_url = '';
