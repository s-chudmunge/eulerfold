-- Add EulerCoins and Streak columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS eulercoins INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;

-- Create eulercoin_transactions table
CREATE TABLE IF NOT EXISTS public.eulercoin_transactions (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  amount INTEGER NOT NULL,  -- positive = earned, negative = spent
  reason TEXT NOT NULL,     -- e.g. "Roadmap cloned by another user"
  roadmap_id INTEGER REFERENCES public.roadmaps(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can only see their own transactions
ALTER TABLE public.eulercoin_transactions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users see own transactions'
    ) THEN
        CREATE POLICY "Users see own transactions"
        ON public.eulercoin_transactions FOR SELECT
        USING (user_email = auth.jwt() ->> 'email');
    END IF;
END $$;

-- RPC function for atomic increment of EulerCoins
CREATE OR REPLACE FUNCTION increment_eulercoins(target_email TEXT, amount INT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET eulercoins = eulercoins + amount
    WHERE email = target_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_eulercoin_transactions_user_email ON public.eulercoin_transactions(user_email);
