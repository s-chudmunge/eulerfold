-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recall_responses ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = supabase_uid);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = supabase_uid);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = supabase_uid);

-- Roadmaps Policies
CREATE POLICY "Users can view own roadmaps" 
ON public.roadmaps FOR SELECT 
USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can insert own roadmaps" 
ON public.roadmaps FOR INSERT 
WITH CHECK (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can update own roadmaps" 
ON public.roadmaps FOR UPDATE 
USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can delete own roadmaps" 
ON public.roadmaps FOR DELETE 
USING (auth.jwt() ->> 'email' = email);

-- Checkin Entries Policies
CREATE POLICY "Users can view own checkin entries" 
ON public.checkin_entries FOR SELECT 
USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can update own checkin entries" 
ON public.checkin_entries FOR UPDATE 
USING (auth.jwt() ->> 'email' = email);

-- Submissions Policies
CREATE POLICY "Users can view own submissions" 
ON public.submissions FOR SELECT 
USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert own submissions" 
ON public.submissions FOR INSERT 
WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can update own submissions" 
ON public.submissions FOR UPDATE 
USING (auth.jwt() ->> 'email' = user_email);

-- Module Progress Policies
CREATE POLICY "Users can view own module progress" 
ON public.module_progress FOR SELECT 
USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert own module progress" 
ON public.module_progress FOR INSERT 
WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can update own module progress" 
ON public.module_progress FOR UPDATE 
USING (auth.jwt() ->> 'email' = user_email);

-- Recall Responses Policies
CREATE POLICY "Users can view own recall responses" 
ON public.recall_responses FOR SELECT 
USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert own recall responses" 
ON public.recall_responses FOR INSERT 
WITH CHECK (auth.jwt() ->> 'email' = user_email);
