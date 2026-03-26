-- Create payment_transactions table for idempotency
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    razorpay_payment_id TEXT UNIQUE NOT NULL,
    razorpay_order_id TEXT,
    razorpay_signature TEXT,
    email TEXT NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_transactions_razorpay_payment_id ON public.payment_transactions(razorpay_payment_id);
