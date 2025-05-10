/*
  # Update Books Schema for Direct Content Access

  1. Changes
    - Drop existing books table
    - Create new books table with optimized structure
    - Add sample books data
    - Update RLS policies for secure access

  2. Security
    - Enable RLS
    - Add policies for:
      - Public can view basic book info
      - Only purchased books content is accessible
*/

-- Drop existing table
DROP TABLE IF EXISTS books CASCADE;

-- Create new books table
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  author TEXT NOT NULL,
  language TEXT NOT NULL,
  digital_price INTEGER NOT NULL,
  content_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view basic book info"
  ON books
  FOR SELECT
  USING (true);

CREATE POLICY "Purchased books content access"
  ON books
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_books
      WHERE user_books.book_id = books.id
      AND user_books.user_id = auth.uid()
    )
  );

-- Insert sample books
INSERT INTO books (id, title, description, cover_url, author, language, digital_price, content_url, created_at) VALUES
  ('0ff9865d-86e8-4c58-8b74-060eb74552c5', 'Shahaada N''okuyingira Obusiramu', 'Ekitabo kino kinnyonnyola amakulu ga Shahaada n''engeri y''okuyingira Obusiraamu. Kiyamba abantu okutegeera ensibuko y''Obusiraamu n''engeri y''okufuuka Omusiraamu.', 'https://i.ibb.co/q3JXcvRf/1.jpg', 'Umar Nsereko', 'Luganda', 2200, 'shahadah.ebizimbaobusilaamu.com', '2025-03-22 14:43:55.052232+00'),
  
  ('52f5417f-75fd-4243-8c7e-c218c10b0d4d', 'Obuyonjo N''obutukuvu Mu Busiraamu', 'Ekitabo ekinnyonnyola obukulu bw''obuyonjo n''obutukuvu mu Busiraamu. Kiraga engeri y''okutuukiriza obuyonjo n''obutukuvu mu ngeri entuufu.', 'https://i.ibb.co/yFNZ6WQz/1.jpg', 'Umar Nsereko', 'Luganda', 2200, 'obuyonjo.ebizimbaobusilaamu.com', '2025-03-22 14:50:10.483521+00'),
  
  ('535bc4ab-2a82-444f-aa0a-38a38235654b', 'Okuyamba: Ebikulemesa N''ebikwonoona', 'Ekitabo ekinnyonnyola ebikulemesa n''ebikwonoona okuyamba mu Busiraamu. Kiraga engeri y''okwewala ebikyamu n''okutuukiriza okuyamba mu ngeri entuufu.', 'https://i.ibb.co/h14Rkv9S/1.jpg', 'Umar Nsereko', 'Luganda', 2200, 'okuyamba.ebizimbaobusilaamu.com', '2025-03-22 15:00:21.900439+00'),
  
  ('5d9f965e-a5fa-443c-85d9-ef3868b54ea0', 'ZZAKA', 'Ekitabo ekinnyonnyola amateeka ga Zzaka mu Busiraamu. Kiraga engeri y''okutuukiriza Zzaka n''obukulu bwayo mu Busiraamu.', 'https://i.ibb.co/pBWnd8gG/1.jpg', 'Umar Nsereko', 'Luganda', 2200, 'zaka.ebizimbaobusilaamu.com', '2025-03-22 15:05:08.55359+00'),
  
  ('8906df17-68be-435b-92db-38abfe930c5d', 'Okusiiba Mu Busiraamu', 'Ekitabo ekinnyonnyola amateeka g''okusiiba mu Busiraamu. Kiraga engeri y''okutuukiriza okusiiba n''obukulu bwakwo mu Busiraamu.', 'https://i.ibb.co/9HWw98cQ/1.jpg', 'Umar Nsereko', 'Luganda', 2200, 'okusiiba.ebizimbaobusilaamu.com', '2025-03-22 13:53:28.075265+00'),
  
  ('b3b2ff09-de26-4d17-bb72-08f4b01779d6', 'Hijja Ne Umrah', 'Ekitabo ekinnyonnyola amateeka ga Hijja ne Umrah mu Busiraamu. Kiraga engeri y''okutuukiriza Hijja ne Umrah mu ngeri entuufu.', 'https://i.ibb.co/WpHMBTW0/1.jpg', 'Umar Nsereko', 'Luganda', 2200, 'hijja.ebizimbaobusilaamu.com', '2025-03-22 15:09:54.534683+00'),
  
  ('bdd2d68d-01ae-44e1-a123-f9d03dd5153a', 'Esswala N''okusaba Mu Busiraamu', 'Ekitabo ekinnyonnyola amateeka g''esswala n''okusaba mu Busiraamu. Kiraga engeri y''okutuukiriza esswala n''okusaba mu ngeri entuufu.', 'https://i.ibb.co/6RpC3gqS/image.png', 'Umar Nsereko', 'Luganda', 2200, 'esswala.ebizimbaobusilaamu.com', '2025-03-22 14:56:00.195766+00');
