-- Migration: Fix Supabase Security Advisor RLS & Performance Warnings
-- Generated: 2026-09-02

-- 1. user_skill_evidence
ALTER TABLE IF EXISTS public.user_skill_evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User skill evidence is viewable by everyone" ON public.user_skill_evidence;
CREATE POLICY "User skill evidence is viewable by everyone" 
ON public.user_skill_evidence FOR SELECT 
USING (TRUE);

DROP POLICY IF EXISTS "Users can insert own skill evidence" ON public.user_skill_evidence;
CREATE POLICY "Users can insert own skill evidence" 
ON public.user_skill_evidence FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own skill evidence" ON public.user_skill_evidence;
CREATE POLICY "Users can update own skill evidence" 
ON public.user_skill_evidence FOR UPDATE 
USING ((SELECT auth.uid()) = user_id);


-- 2. user_skill_summary
ALTER TABLE IF EXISTS public.user_skill_summary ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User skill summaries are viewable by everyone" ON public.user_skill_summary;
CREATE POLICY "User skill summaries are viewable by everyone" 
ON public.user_skill_summary FOR SELECT 
USING (TRUE);

DROP POLICY IF EXISTS "Users can insert own skill summary" ON public.user_skill_summary;
CREATE POLICY "Users can insert own skill summary" 
ON public.user_skill_summary FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own skill summary" ON public.user_skill_summary;
CREATE POLICY "Users can update own skill summary" 
ON public.user_skill_summary FOR UPDATE 
USING ((SELECT auth.uid()) = user_id);


-- 3. content_embeddings
ALTER TABLE IF EXISTS public.content_embeddings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Content embeddings are viewable by everyone" ON public.content_embeddings;
CREATE POLICY "Content embeddings are viewable by everyone" 
ON public.content_embeddings FOR SELECT 
USING (TRUE);


-- 4. diagnostic_domains
ALTER TABLE IF EXISTS public.diagnostic_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Diagnostic domains are viewable by everyone" ON public.diagnostic_domains;
CREATE POLICY "Diagnostic domains are viewable by everyone" 
ON public.diagnostic_domains FOR SELECT 
USING (TRUE);


-- 5. diagnostic_questions
ALTER TABLE IF EXISTS public.diagnostic_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Diagnostic questions are viewable by everyone" ON public.diagnostic_questions;
CREATE POLICY "Diagnostic questions are viewable by everyone" 
ON public.diagnostic_questions FOR SELECT 
USING (TRUE);


-- 6. diagnostic_sessions
ALTER TABLE IF EXISTS public.diagnostic_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own diagnostic sessions" ON public.diagnostic_sessions;
CREATE POLICY "Users can view own diagnostic sessions" 
ON public.diagnostic_sessions FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own diagnostic sessions" ON public.diagnostic_sessions;
CREATE POLICY "Users can insert own diagnostic sessions" 
ON public.diagnostic_sessions FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own diagnostic sessions" ON public.diagnostic_sessions;
CREATE POLICY "Users can update own diagnostic sessions" 
ON public.diagnostic_sessions FOR UPDATE 
USING ((SELECT auth.uid()) = user_id);


-- 7. diagnostic_responses
ALTER TABLE IF EXISTS public.diagnostic_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own diagnostic responses" ON public.diagnostic_responses;
CREATE POLICY "Users can view own diagnostic responses" 
ON public.diagnostic_responses FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.diagnostic_sessions 
    WHERE diagnostic_sessions.id = diagnostic_responses.session_id 
      AND diagnostic_sessions.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can insert own diagnostic responses" ON public.diagnostic_responses;
CREATE POLICY "Users can insert own diagnostic responses" 
ON public.diagnostic_responses FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.diagnostic_sessions 
    WHERE diagnostic_sessions.id = diagnostic_responses.session_id 
      AND diagnostic_sessions.user_id = (SELECT auth.uid())
  )
);


-- 8. newsletter_subscribers
ALTER TABLE IF EXISTS public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers FOR INSERT 
WITH CHECK (TRUE);


-- 9. Optimize profiles RLS per-row execution (Auth RLS Initialization Plan)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING ((SELECT auth.uid()) = supabase_uid);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = supabase_uid);
