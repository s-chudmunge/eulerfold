-- Migration: Add is_pro column to profiles
-- This flag tracks if a user has ever made a purchase, granting them permanent access to premium AI models.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.profiles.is_pro IS 'Indicates if the user has purchased a Pro credit pack.';
