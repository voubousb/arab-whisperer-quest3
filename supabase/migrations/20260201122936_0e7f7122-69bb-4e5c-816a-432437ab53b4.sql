-- Create storage bucket for pre-generated audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('arabic-audio', 'arabic-audio', true);

-- Allow public read access to audio files
CREATE POLICY "Public can view audio files"
ON storage.objects FOR SELECT
USING (bucket_id = 'arabic-audio');

-- Allow authenticated admins to upload audio files
CREATE POLICY "Admins can upload audio files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'arabic-audio');

-- Allow authenticated admins to update audio files
CREATE POLICY "Admins can update audio files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'arabic-audio');

-- Allow authenticated admins to delete audio files
CREATE POLICY "Admins can delete audio files"
ON storage.objects FOR DELETE
USING (bucket_id = 'arabic-audio');