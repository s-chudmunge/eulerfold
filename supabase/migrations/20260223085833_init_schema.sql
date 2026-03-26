-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id SERIAL PRIMARY KEY,
    supabase_uid UUID UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    is_active BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false,
    profile_completed BOOLEAN DEFAULT false,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create checkin_entries table
CREATE TABLE IF NOT EXISTS public.checkin_entries (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    email TEXT NOT NULL,
    roadmap JSONB NOT NULL,
    current_module INTEGER DEFAULT 1,
    next_check_at TIMESTAMPTZ,
    last_sent_at TIMESTAMPTZ,
    unsubscribed BOOLEAN DEFAULT false,
    token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_send_status TEXT,
    last_action_at TIMESTAMPTZ,
    confidence_score INTEGER
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_checkin_entries_uuid ON public.checkin_entries(uuid);
CREATE INDEX IF NOT EXISTS idx_checkin_entries_token ON public.checkin_entries(token);
CREATE INDEX IF NOT EXISTS idx_checkin_entries_email ON public.checkin_entries(email);
CREATE INDEX IF NOT EXISTS idx_profiles_supabase_uid ON public.profiles(supabase_uid);
