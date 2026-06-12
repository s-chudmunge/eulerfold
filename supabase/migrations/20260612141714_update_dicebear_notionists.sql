-- Update handle_new_user to use notionists style with pastel backgrounds
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    final_username TEXT;
    final_display_name TEXT;
    final_avatar_url TEXT;
BEGIN
    -- 1. Determine Display Name & Username (unchanged logic)
    final_display_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );

    final_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'preferred_username',
        lower(regexp_replace(final_display_name, '\W+', '', 'g')) || '_' || floor(random() * 1000)::text
    );

    -- 2. Determine Avatar URL using the notionists style with custom colors
    final_avatar_url := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        'https://api.dicebear.com/7.x/notionists/svg?seed=' || final_username || '&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc'
    );

    -- 3. Perform the insert
    INSERT INTO public.profiles (
        id, email, username, display_name,
        avatar_url,
        is_active, is_admin, is_pro,
        profile_completed, onboarding_completed,
        eulercoins, roadmap_credits
    )
    VALUES (
        NEW.id, NEW.email, final_username, final_display_name,
        final_avatar_url,
        TRUE, FALSE, FALSE,
        FALSE, FALSE,
        0, 1.0
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        username = COALESCE(profiles.username, EXCLUDED.username),
        display_name = COALESCE(profiles.display_name, EXCLUDED.display_name),
        avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
        updated_at = now()
    WHERE profiles.id = EXCLUDED.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing users to the new notionists style
-- We target anyone with a null/empty avatar or anyone who already got the "initials" fallback
UPDATE public.profiles
SET avatar_url = 'https://api.dicebear.com/7.x/notionists/svg?seed=' || username || '&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc'
WHERE avatar_url IS NULL 
   OR avatar_url = '' 
   OR avatar_url LIKE 'https://api.dicebear.com/9.x/initials/svg%';
