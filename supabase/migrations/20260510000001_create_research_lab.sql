-- Migration: Create Research Lab table for modular technical decodes
CREATE TABLE IF NOT EXISTS public.research_lab_decodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    paper_url TEXT NOT NULL,
    paper_title TEXT,
    
    -- The "Core Breakdown" (Module 1)
    -- Structured as: Conceptual Anchor, Mathematical Translation, Hidden Logic, Navigation Map
    core_analysis JSONB, 
    
    -- The "Implementation Blueprint" (Module 2 - Future/Optional)
    code_analysis JSONB,
    
    -- Metadata
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    error_message TEXT,
    is_public BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.research_lab_decodes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own lab decodes" 
    ON public.research_lab_decodes FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view public lab decodes" 
    ON public.research_lab_decodes FOR SELECT 
    USING (is_public = true);

-- Performance Indexes
CREATE INDEX idx_research_lab_user_id ON public.research_lab_decodes(user_id);
CREATE INDEX idx_research_lab_status ON public.research_lab_decodes(status);
