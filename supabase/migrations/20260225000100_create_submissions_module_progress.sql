-- Migration: create submissions and module_progress tables
-- Generated: 2026-02-25

CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  roadmap_id INTEGER REFERENCES roadmaps(id) ON DELETE CASCADE,
  module_number INTEGER NOT NULL,
  link TEXT,
  description TEXT,
  scraped_content TEXT,
  evaluation TEXT,
  evaluation_level TEXT,
  follow_up_question TEXT,
  follow_up_answer TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT
);

CREATE INDEX IF NOT EXISTS submissions_roadmap_idx ON submissions(roadmap_id);
CREATE INDEX IF NOT EXISTS submissions_user_email_idx ON submissions(user_email);

CREATE TABLE IF NOT EXISTS module_progress (
  id BIGSERIAL PRIMARY KEY,
  roadmap_id INTEGER REFERENCES roadmaps(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  module_number INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS module_progress_roadmap_idx ON module_progress(roadmap_id);
CREATE INDEX IF NOT EXISTS module_progress_user_idx ON module_progress(user_email);
