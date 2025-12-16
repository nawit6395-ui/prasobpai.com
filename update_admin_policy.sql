-- Enable RLS (Should be already enabled)
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can DELETE any story
CREATE POLICY "Admins can delete any story"
ON stories
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy: Admins can UPDATE any story
CREATE POLICY "Admins can update any story"
ON stories
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
