CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_seconds INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance when summing sessions for a user
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON public.learning_sessions(user_id);
