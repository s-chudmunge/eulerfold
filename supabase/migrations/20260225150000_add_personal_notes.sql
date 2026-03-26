-- Migration: add personal_notes table for storing user notes per module

CREATE TABLE IF NOT EXISTS personal_notes (
  id BIGSERIAL PRIMARY KEY,
  roadmap_id INTEGER REFERENCES roadmaps(id) ON DELETE CASCADE NOT NULL,
  module_number INTEGER NOT NULL,
  user_email TEXT NOT NULL,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS personal_notes_roadmap_module_idx ON personal_notes(roadmap_id, module_number);
CREATE INDEX IF NOT EXISTS personal_notes_user_email_idx ON personal_notes(user_email);
