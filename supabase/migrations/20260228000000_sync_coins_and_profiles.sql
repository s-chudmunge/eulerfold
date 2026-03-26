-- 1. Automate Profile Creation on Sign-up
-- This ensures that every user in auth.users has a record in public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (supabase_uid, email, display_name, is_active, profile_completed, onboarding_completed, eulercoins)
    VALUES (
        NEW.id, 
        NEW.email, 
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

-- Trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Backfill missing profiles for existing users
INSERT INTO public.profiles (supabase_uid, email, display_name, is_active, profile_completed, onboarding_completed, eulercoins)
SELECT 
    id as supabase_uid, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'EulerFold User') as display_name,
    TRUE as is_active,
    FALSE as profile_completed,
    FALSE as onboarding_completed,
    0 as eulercoins
FROM auth.users
ON CONFLICT (supabase_uid) DO NOTHING;

-- 3. Normalize all emails to lowercase to prevent case-sensitivity desync
UPDATE public.profiles SET email = LOWER(email);
UPDATE public.eulercoin_transactions SET user_email = LOWER(user_email);

-- 4. Update increment_eulercoins to be case-insensitive and robust
CREATE OR REPLACE FUNCTION increment_eulercoins(target_email TEXT, amount INT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET eulercoins = eulercoins + amount
    WHERE LOWER(email) = LOWER(target_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Sync balances from transactions table
-- This fixes the issue where transactions were recorded but balance didn't update
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT user_email, SUM(amount) as total_coins
        FROM public.eulercoin_transactions
        GROUP BY user_email
    ) LOOP
        UPDATE public.profiles
        SET eulercoins = r.total_coins
        WHERE LOWER(email) = LOWER(r.user_email);
    END LOOP;
END $$;
