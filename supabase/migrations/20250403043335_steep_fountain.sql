/*
  # Add IPFS Content Table

  1. New Tables
    - `ipfs_content`
      - `id` (uuid, primary key)
      - `cid` (text, unique) - IPFS Content Identifier
      - `title` (text) - Content title or description
      - `type` (text) - Content type (book, image, audio, video)
      - `chunks` (text[]) - Array of chunk CIDs for large content
      - `mime_type` (text) - MIME type of the content
      - `size` (integer) - Size in bytes
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for viewing content
    - Add policies for admin management
*/

-- Create ipfs_content table
CREATE TABLE IF NOT EXISTS ipfs_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cid TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  chunks TEXT[],
  mime_type TEXT,
  size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE ipfs_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view IPFS content"
  ON ipfs_content
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage IPFS content"
  ON ipfs_content
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users a
    WHERE a.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_users a
    WHERE a.user_id = auth.uid()
  ));

-- Add book content mapping function
CREATE OR REPLACE FUNCTION get_book_ipfs_cid(book_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cid TEXT;
BEGIN
  SELECT cid INTO v_cid
  FROM ipfs_content
  WHERE type = 'book' AND title LIKE '%' || book_id::TEXT || '%'
  LIMIT 1;
  
  RETURN v_cid;
END;
$$;

-- Insert sample IPFS content for testing
INSERT INTO ipfs_content (cid, title, type, mime_type, created_at)
VALUES 
  ('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG', 'Sample Book 1', 'book', 'application/pdf', now()),
  ('QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx', 'Sample Book 2', 'book', 'application/pdf', now())
ON CONFLICT (cid) DO NOTHING;
