-- Add slug column to roadmaps
ALTER TABLE roadmaps ADD COLUMN slug TEXT;

-- Update existing roadmaps with a slug based on title or subject
UPDATE roadmaps 
SET slug = LOWER(REGEXP_REPLACE(COALESCE(title, subject, 'roadmap'), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || id
WHERE slug IS NULL;

-- Make slug NOT NULL and UNIQUE for future
ALTER TABLE roadmaps ALTER COLUMN slug SET NOT NULL;
ALTER TABLE roadmaps ADD CONSTRAINT roadmaps_slug_unique UNIQUE (slug);

-- Create index for fast lookups
CREATE INDEX idx_roadmaps_slug ON roadmaps (slug);
