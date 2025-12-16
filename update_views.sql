-- Add view_count column to stories
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Function to safely increment view count (Atomic update)
CREATE OR REPLACE FUNCTION increment_view_count(story_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE stories
  SET view_count = view_count + 1
  WHERE id = story_id;
END;
$$ LANGUAGE plpgsql;
