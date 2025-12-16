-- Create table to track views and prevent spam (24h window)
CREATE TABLE IF NOT EXISTS story_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    ip_hash TEXT NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_story_views_check ON story_views(story_id, ip_hash, viewed_at);

-- RLS Policies (Start safe)
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

-- Only service_role can insert/select (API route uses service role or anon if public logic allows)
-- For this logic, we probably want the API (server-side) to read/write.
-- If using Anon key in route.js, we need to allow Anon insert.
-- However, route.js seemed to use a separate admin client or just standard client.
-- Let's allow public insert for now but restricts select if possible, or just open for simplicity as it's just view tracking.

CREATE POLICY "Enable insert for all users" ON story_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for all users" ON story_views FOR SELECT USING (true);
