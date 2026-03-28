-- FORCE FIX V2: Ensure eulercoin_transactions exists
-- This migration explicitly checks and adds the table and RLS if missed

DO $$ 
BEGIN
    -- Create eulercoin_transactions if missing
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
