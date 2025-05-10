/*
  # Add Quran IPFS Support

  1. Changes
    - Add metadata column to ipfs_content table
    - Add index on type column for faster queries
    - Add function to get Quran page by number
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add metadata column to ipfs_content table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ipfs_content' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE ipfs_content ADD COLUMN metadata JSONB;
  END IF;
END $$;

-- Create index on type column for faster queries
CREATE INDEX IF NOT EXISTS idx_ipfs_content_type ON ipfs_content (type);

-- Create function to get Quran page CID by page number
CREATE OR REPLACE FUNCTION get_quran_page_cid(page_number INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cid TEXT;
BEGIN
  SELECT cid INTO v_cid
  FROM ipfs_content
  WHERE type = 'quran_page' AND title LIKE '%Page ' || page_number || '%'
  LIMIT 1;
  
  RETURN v_cid;
END;
$$;
