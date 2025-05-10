/*
  # Set up Video Storage System

  1. New Tables
    - `reels`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text) 
      - `video_url` (text)
      - `thumbnail_url` (text)
      - `created_at` (timestamptz)
      - `likes` (integer)
      - `comments` (integer)
      - `shares` (integer)
      - `user_id` (uuid) - Creator reference
      - `category` (text) - Video category
      - `is_featured` (boolean)

  2. Storage
    - Create bucket for video files
    - Create bucket for thumbnails
    
  3. Security
    - Enable RLS
    - Add policies for video access
    - Add policies for storage access
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
    shares INTEGER DEFAULT 0,
    category TEXT,
    is_featured BOOLEAN DEFAULT false
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Add user_id column if it doesn't exist
DO $$ BEGIN
  ALTER TABLE reels ADD COLUMN user_id UUID REFERENCES auth.users(id);
EXCEPTION
  WHEN duplicate_column THEN
    NULL;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view reels" ON reels;
  DROP POLICY IF EXISTS "Users can create reels" ON reels;
  DROP POLICY IF EXISTS "Users can update their own reels" ON reels;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create new policies
CREATE POLICY "Anyone can view reels"
  ON reels
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create reels"
  ON reels
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reels"
  ON reels
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('videos', 'videos', true),
  ('thumbnails', 'thumbnails', true)
ON CONFLICT DO NOTHING;

-- Storage policies for videos
CREATE POLICY "Videos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for thumbnails
CREATE POLICY "Thumbnails are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');

CREATE POLICY "Authenticated users can upload thumbnails"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'thumbnails' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

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
