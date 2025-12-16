-- 1. Create the 'story-images' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-images', 'story-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Policies (Safely)
DO $$
BEGIN
    -- Public View
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Story images are publicly accessible' AND tablename = 'objects' AND schemaname = 'storage') THEN
         CREATE POLICY "Story images are publicly accessible" ON storage.objects FOR SELECT USING ( bucket_id = 'story-images' );
    END IF;

    -- Authenticated Uploads
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can upload story images' AND tablename = 'objects' AND schemaname = 'storage') THEN
         CREATE POLICY "Anyone can upload story images" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'story-images' AND auth.role() = 'authenticated' );
    END IF;

    -- Update Own Images
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own story images' AND tablename = 'objects' AND schemaname = 'storage') THEN
         CREATE POLICY "Users can update own story images" ON storage.objects FOR UPDATE USING ( bucket_id = 'story-images' AND auth.uid()::text = SPLIT_PART(name, '-', 1) );
    END IF;

    -- Delete Own Images
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own story images' AND tablename = 'objects' AND schemaname = 'storage') THEN
         CREATE POLICY "Users can delete own story images" ON storage.objects FOR DELETE USING ( bucket_id = 'story-images' AND auth.uid()::text = SPLIT_PART(name, '-', 1) );
    END IF;
END
$$;
