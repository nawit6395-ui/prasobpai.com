-- Table to track individual views for spam prevention
CREATE TABLE IF NOT EXISTS story_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for guests
    ip_hash TEXT NOT NULL, -- Anonymized IP or raw IP
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_story_views_check 
ON story_views(story_id, ip_hash);

CREATE INDEX IF NOT EXISTS idx_story_views_user 
ON story_views(story_id, user_id);

-- RLS: Only server logic (service role) should insert/read this mostly, 
-- but strictly speaking we might just open it up or keep it private if using API route with Service Key.
-- For now, enable RLS but allow inserts if we were doing it client-side. 
-- BUT since we are doing logic in API route, we can bypass RLS or set permissive policy for now.
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON story_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service select" ON story_views FOR SELECT USING (true);
