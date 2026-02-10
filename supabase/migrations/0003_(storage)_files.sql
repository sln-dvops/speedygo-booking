-- First, create the "Files" bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('Files', 'Files', true)
ON CONFLICT (id) DO NOTHING;

-- Create the "Orders" folder in the "Files" bucket
INSERT INTO storage.objects (bucket_id, name, owner, owner_id)
SELECT 'Files', 'Orders/', auth.uid(), auth.uid()
FROM storage.buckets
WHERE name = 'Files'
ON CONFLICT (bucket_id, name) DO NOTHING;

-- Create policies to allow public access to the Files bucket
CREATE POLICY "Public Read Access for Files"
ON storage.objects FOR SELECT
USING (bucket_id = 'Files');

-- Create a policy to allow authenticated users to upload to the Files bucket
CREATE POLICY "Authenticated Users Can Upload Files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'Files');

-- Create a policy to allow authenticated users to update their own files
CREATE POLICY "Authenticated Users Can Update Own Files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'Files' AND owner = auth.uid());

-- Create a policy to allow authenticated users to delete their own files
CREATE POLICY "Authenticated Users Can Delete Own Files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'Files' AND owner = auth.uid());

-- Output success message
SELECT 'Storage bucket "Files" with folder "Orders" created successfully' as result;