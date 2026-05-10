-- Add photos column to reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS photos text[];

-- Create review-photos storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to review-photos
CREATE POLICY "Allow public uploads to review-photos"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'review-photos');

-- Allow public reads from review-photos
CREATE POLICY "Allow public reads from review-photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'review-photos');
