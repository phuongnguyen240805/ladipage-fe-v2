-- Supabase Migration: 20260625230000_storage_buckets.sql
-- Description: Create public landing-page-assets bucket for landing page HTML/ZIP import files

-- Insert a new public bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'landing-page-assets', 
    'landing-page-assets', 
    true, 
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'font/woff', 'font/woff2', 'font/ttf']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the objects inside the bucket
-- Allow public select/viewing for all assets
CREATE POLICY "Public access to landing-page-assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'landing-page-assets');

-- Allow inserting new files for all users (to support editor imports)
CREATE POLICY "Allow public inserts to landing-page-assets"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'landing-page-assets');

-- Allow updating files
CREATE POLICY "Allow public updates to landing-page-assets"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'landing-page-assets');

-- Allow deleting files
CREATE POLICY "Allow public deletes to landing-page-assets"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'landing-page-assets');
