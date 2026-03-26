-- Migration: Add metadata to profiles for UI states
-- Generated: 2026-02-27

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
