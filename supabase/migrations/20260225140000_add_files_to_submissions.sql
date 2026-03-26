-- Add files column to submissions table to store file metadata

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb;

-- Create an index for faster queries if needed
CREATE INDEX IF NOT EXISTS submissions_files_idx ON submissions USING GIN(files);
