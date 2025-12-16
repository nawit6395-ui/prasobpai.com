-- 1. Create the 'avatars' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Policies (Safely)
DO $$
BEGIN
    -- Public View
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Avatar images are publicly accessible' AND tablename = 'objects' AND schemaname = 'storage') THEN
         CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING ( bucket_id = 'avatars' );
    END IF;

    -- Authenticated Uploads
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can upload an avatar' AND tablename = 'objects' AND schemaname = 'storage') THEN
         CREATE POLICY "Anyone can upload an avatar" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );
    END IF;

    -- Update Own Avatar
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own avatar' AND tablename = 'objects' AND schemaname = 'storage') THEN
         CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING ( bucket_id = 'avatars' AND auth.uid()::text = SPLIT_PART(name, '-', 1) );
    END IF;

    -- Delete Own Avatar
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own avatar' AND tablename = 'objects' AND schemaname = 'storage') THEN
         CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING ( bucket_id = 'avatars' AND auth.uid()::text = SPLIT_PART(name, '-', 1) );
    END IF;
END
$$;
