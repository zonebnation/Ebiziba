/*
  # Add Merchant Codes Table

  1. New Tables
    - `merchant_codes`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the merchant
      - `code` (text) - Mobile money merchant code
      - `network` (text) - Mobile network (MTN, Airtel)
      - `active` (boolean) - Whether the code is active
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for viewing active merchant codes
*/

-- Create merchant_codes table
CREATE TABLE IF NOT EXISTS merchant_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  network TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE merchant_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active merchant codes"
  ON merchant_codes
  FOR SELECT
  USING (active = true);

-- Insert sample merchant codes
INSERT INTO merchant_codes (name, code, network)
VALUES 
  ('Ebizimba Omusiraamu MTN', '*165*3*457607#', 'MTN'),
  ('Ebizimba Omusiraamu Airtel', '*185*3*457607#', 'Airtel')
ON CONFLICT (code) DO NOTHING;
