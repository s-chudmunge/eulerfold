-- Fix for EulerCoins function name mismatch
-- This migration ensures the function is named correctly for the new app branding (EulerFold)
-- and removes any legacy 'mentt' naming if it exists.

-- 1. Create/Update the correct function
CREATE OR REPLACE FUNCTION public.increment_eulercoins(target_email TEXT, amount INT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET eulercoins = COALESCE(eulercoins, 0) + amount
    WHERE LOWER(email) = LOWER(target_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Clean up legacy function if it exists to avoid confusion
DROP FUNCTION IF EXISTS public.increment_menttcoins(TEXT, INT);
DROP FUNCTION IF EXISTS public.increment_menttcoins(INT, TEXT);

-- 3. Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
