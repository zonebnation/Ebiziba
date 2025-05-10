/*
  # Add Merchant Codes for Mobile Money

  1. Changes
    - Create merchant_codes table if not exists
    - Add sample merchant codes for MTN and Airtel
    - Drop existing policy if it exists
    - Create new policy for viewing active codes
    
  2. Security
    - Enable RLS
    - Add policy for public access to active codes
*/

-- Drop existing policy if it exists
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view active merchant codes" ON merchant_codes;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create merchant_codes table if it doesn't exist
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

-- Create policy for viewing merchant codes
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
