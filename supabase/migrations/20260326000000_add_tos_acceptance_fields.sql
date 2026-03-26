-- Migration: Add ToS acceptance fields to profiles
-- Created: 2026-03-26

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tos_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS tos_version TEXT;

-- Add a comment for clarity
COMMENT ON COLUMN public.profiles.tos_accepted_at IS 'Timestamp when the user accepted the Terms of Service and Privacy Policy.';
COMMENT ON COLUMN public.profiles.tos_version IS 'The specific version of the ToS/Privacy Policy accepted by the user (e.g., "2026-03").';
