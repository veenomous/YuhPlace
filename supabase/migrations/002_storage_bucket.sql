-- Create the listing-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'listing-images');

-- Allow public read access to all listing images
CREATE POLICY "Listing images are publicly accessible"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'listing-images');

-- Allow users to update/overwrite their own uploads
CREATE POLICY "Users can update own listing images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'listing-images' AND (storage.foldername(name))[1] IN ('discover', 'market', 'property'));

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own listing images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'listing-images');
