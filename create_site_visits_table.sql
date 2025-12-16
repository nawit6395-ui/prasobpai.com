-- Table to track unique daily visits
CREATE TABLE IF NOT EXISTS site_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_hash TEXT NOT NULL,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for checking existing visits (IP + Date)
CREATE INDEX IF NOT EXISTS idx_site_visits_check ON site_visits(ip_hash, visited_at);

-- RLS
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Allow insert public (for tracking)
CREATE POLICY "Enable insert for all users" ON site_visits FOR INSERT WITH CHECK (true);

-- Allow select public (for stats)
CREATE POLICY "Enable select for all users" ON site_visits FOR SELECT USING (true);
