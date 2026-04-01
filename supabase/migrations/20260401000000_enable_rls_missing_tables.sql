-- Enable Row Level Security for tables that were missed
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Learning Sessions Policies
-- Only the user who owns the session can view or insert it
CREATE POLICY "Users can view own learning sessions" 
ON public.learning_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning sessions" 
ON public.learning_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Payment Transactions Policies
-- Only the user who owns the payment record (by email) can view it
CREATE POLICY "Users can view own payment transactions" 
ON public.payment_transactions FOR SELECT 
USING (auth.jwt() ->> 'email' = email);

-- Note: Insertions are usually done by service role/server, but we add a policy 
-- in case the backend uses the user's token (anon key).
CREATE POLICY "Users can insert own payment transactions" 
ON public.payment_transactions FOR INSERT 
WITH CHECK (auth.jwt() ->> 'email' = email);
