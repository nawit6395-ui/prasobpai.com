-- Add slug column to stories table
ALTER TABLE stories 
ADD COLUMN slug TEXT UNIQUE;

-- Create an index for faster lookup
CREATE INDEX idx_stories_slug ON stories(slug);
