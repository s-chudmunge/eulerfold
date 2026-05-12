-- Migration: Add storage for raw text and Q&A history for Research Lab
ALTER TABLE public.research_lab_decodes ADD COLUMN IF NOT EXISTS extracted_text TEXT;

CREATE TABLE IF NOT EXISTS public.research_lab_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decode_id UUID REFERENCES public.research_lab_decodes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for messages
ALTER TABLE public.research_lab_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lab messages" 
    ON public.research_lab_messages FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lab messages" 
    ON public.research_lab_messages FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Indexing
CREATE INDEX idx_lab_messages_decode_id ON public.research_lab_messages(decode_id);
