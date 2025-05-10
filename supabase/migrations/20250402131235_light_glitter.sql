/*
  # Add Reels Table for Video Content

  1. Changes
    - Drop existing policies if they exist
    - Create reels table if it doesn't exist
    - Add RLS policies with existence check

  2. Security
    - Enable RLS
    - Add policy for public viewing
*/

-- Create reels table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS reels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view reels" ON reels;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create new policy
CREATE POLICY "Anyone can view reels"
  ON reels
  FOR SELECT
  USING (true);

-- Insert sample reels for testing
INSERT INTO reels (title, description, video_url, thumbnail_url)
VALUES 
  (
    'Okuyiga Quran',
    'Okuyiga Quran n''engeri y''okugisoma obulungi.',
    'https://storage.googleapis.com/ebizimba-videos/quran-lesson-1.mp4',
    'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=300'
  ),
  (
    'Enjigiriza z''Omubaka Muhammad ﷺ',
    'Okuyiga ku bulamu bw''Omubaka Muhammad ﷺ n''enjigiriza ze.',
    'https://storage.googleapis.com/ebizimba-videos/prophet-lesson-1.mp4',
    'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&q=80&w=300'
  )
ON CONFLICT DO NOTHING;
