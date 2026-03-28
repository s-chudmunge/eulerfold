-- FORCE FIX: Ensure eulercoins and related columns exist
-- This migration explicitly checks and adds the columns if they were somehow missed in previous migrations

DO $$ 
BEGIN
    -- 1. Add eulercoins if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'eulercoins'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN eulercoins INTEGER DEFAULT 0;
    END IF;

    -- 2. Add current_streak if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'current_streak'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN current_streak INTEGER DEFAULT 0;
    END IF;

    -- 3. Add last_active_date if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'last_active_date'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN last_active_date TIMESTAMPTZ;
    END IF;

    -- 4. Create eulercoin_transactions if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'eulercoin_transactions'
    ) THEN
        CREATE TABLE public.eulercoin_transactions (
            id SERIAL PRIMARY KEY,
            user_email TEXT NOT NULL,
            amount INTEGER NOT NULL,
            reason TEXT NOT NULL,
            roadmap_id INTEGER REFERENCES public.roadmaps(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        ALTER TABLE public.eulercoin_transactions ENABLE ROW LEVEL SECURITY;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE policyname = 'Users see own transactions'
        ) THEN
            CREATE POLICY "Users see own transactions"
            ON public.eulercoin_transactions FOR SELECT
            USING (user_email = auth.jwt() ->> 'email');
        END IF;
    END IF;
END $$;
