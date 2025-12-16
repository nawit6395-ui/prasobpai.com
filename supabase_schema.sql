-- Protocol: PostgreSQL (Supabase)
-- Architect: Antigravity (Senior DB Architect)
-- Project: Prasobpai.com

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Enums
CREATE TYPE story_category AS ENUM ('daily', 'crisis', 'funny', 'guide');
CREATE TYPE reaction_type AS ENUM ('hug', 'understand', 'dry_laugh');

-- 3. Create Tables

-- TABLE: profiles
-- Description: Public user profiles synced with auth.users
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    level TEXT DEFAULT 'Level 1 Survivor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: stories
-- Description: User stories (posts)
CREATE TABLE stories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category story_category NOT NULL DEFAULT 'daily',
    severity_level INTEGER CHECK (severity_level >= 1 AND severity_level <= 10) DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: reactions
-- Description: User reactions to stories (One specific reaction type per user per story, or simple one per story based on constraint)
-- Note: Constraint below allows 1 reaction record per user per story. 
-- If you want to allow a user to 'hug' AND 'understand' the same story, remove the unique constraint or adjust it.
-- For now, enforcing one reaction interaction per story per user for simplicity, or change PK.
CREATE TABLE reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    reaction_type reaction_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, user_id) 
);

-- TABLE: comments
-- Description: User comments on stories
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Stories Policies
CREATE POLICY "Stories are viewable by everyone" 
ON stories FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert stories" 
ON stories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own stories" 
ON stories FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories" 
ON stories FOR DELETE USING (auth.uid() = user_id);

-- Reactions Policies
CREATE POLICY "Reactions are viewable by everyone" 
ON reactions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert reactions" 
ON reactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete own reactions" 
ON reactions FOR DELETE USING (auth.uid() = user_id);

-- Comments Policies
CREATE POLICY "Comments are viewable by everyone" 
ON comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" 
ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own comments" 
ON comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
ON comments FOR DELETE USING (auth.uid() = user_id);

-- 6. Triggers & Functions

-- Function to handle new user signup (Auto-create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username', 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. Real-time Setup (Supabase Specific)
-- Note: You must enable Realtime in the Supabase Dashboard > Database > Replication.
-- But we can add the tables to the publication here if permissions allow.
alter publication supabase_realtime add table stories;
alter publication supabase_realtime add table reactions;
alter publication supabase_realtime add table comments;

-- 8. Indexes

-- Feed Query Optimization: Filtering by Category and Sorting by Created At
CREATE INDEX idx_stories_category_created_at ON stories(category, created_at DESC);

-- User Profile Lookups: Often queried by ID or Username
CREATE INDEX idx_profiles_username ON profiles(username);

-- Reactions Counting: Often need to count reactions for a story
CREATE INDEX idx_reactions_story_id ON reactions(story_id);

-- Comments sorting
CREATE INDEX idx_comments_story_id_created_at ON comments(story_id, created_at ASC);
