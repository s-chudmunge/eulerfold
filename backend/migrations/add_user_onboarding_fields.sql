-- Migration: Add user onboarding fields
-- Created: 2025-08-22
-- Description: Add display_name, profile_completed, and onboarding_completed fields to User table

-- Add new columns to user table
ALTER TABLE user 
ADD COLUMN display_name VARCHAR(255),
ADD COLUMN profile_completed BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL;

-- Update existing users to have completed profiles (assuming they were created via OAuth)
UPDATE user 
SET profile_completed = TRUE, onboarding_completed = TRUE 
WHERE email IS NOT NULL AND email NOT LIKE '%@phone.auth';

-- For phone auth users, keep defaults (FALSE) so they see onboarding