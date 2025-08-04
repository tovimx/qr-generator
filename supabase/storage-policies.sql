-- Storage policies for qr-logos bucket
-- Run this in Supabase SQL Editor

-- Allow authenticated users to upload logos
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'qr-logos' AND auth.uid() IS NOT NULL);

-- Allow anyone to view logos (public access)
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'qr-logos');

-- Allow users to delete their own logos
CREATE POLICY "Allow users to delete own logos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'qr-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own logos
CREATE POLICY "Allow users to update own logos" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'qr-logos' AND auth.uid()::text = (storage.foldername(name))[1]);