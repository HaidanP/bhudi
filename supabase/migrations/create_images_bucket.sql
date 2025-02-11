
-- Create a storage bucket for images
INSERT INTO storage.buckets (id, name)
SELECT 'images', 'images'
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'images'
);

-- Set up public access policy for the images bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );
