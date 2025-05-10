/*
  # Fix Admin Policies and Add Payment Methods Table

  1. Changes
    - Drop existing policies safely
    - Create payment_methods table
    - Add admin policies with proper checks
    
  2. Security
    - Enable RLS
    - Add policies for public viewing
    - Add policies for admin management
*/

-- Create payment_methods table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view active payment methods" ON payment_methods;
  DROP POLICY IF EXISTS "Only admins can view admin_users" ON admin_users;
  DROP POLICY IF EXISTS "Admins can view admin_users" ON admin_users;
  DROP POLICY IF EXISTS "Admins can manage all reels" ON reels;
  DROP POLICY IF EXISTS "Admins can manage all books" ON books;
  DROP POLICY IF EXISTS "Admins can manage all trials" ON book_trials;
  DROP POLICY IF EXISTS "Admins can manage all user_books" ON user_books;
  DROP POLICY IF EXISTS "Admins can view all access logs" ON book_access_logs;
  DROP POLICY IF EXISTS "Admins can manage payment methods" ON payment_methods;
  DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create policy for viewing payment methods
CREATE POLICY "Anyone can view active payment methods"
  ON payment_methods
  FOR SELECT
  USING (active = true);

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing admin users
CREATE POLICY "Admins can view admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users a
    WHERE a.user_id = auth.uid()
  ));

-- Insert the specified admin user
INSERT INTO admin_users (user_id)
VALUES ('ff67aabc-2894-442d-96b5-bd67d18cc741')
ON CONFLICT (user_id) DO NOTHING;

-- Add admin policies to reels table
CREATE POLICY "Admins can manage all reels"
  ON reels
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

-- Add admin policies to books table
CREATE POLICY "Admins can manage all books"
  ON books
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

-- Add admin policies to book_trials table
CREATE POLICY "Admins can manage all trials"
  ON book_trials
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

-- Add admin policies to user_books table
CREATE POLICY "Admins can manage all user_books"
  ON user_books
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

-- Add admin policies to book_access_logs table
CREATE POLICY "Admins can view all access logs"
  ON book_access_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users a
    WHERE a.user_id = auth.uid()
  ));

-- Add admin policies to payment_methods table
CREATE POLICY "Admins can manage payment methods"
  ON payment_methods
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

-- Add admin policies to payments table
CREATE POLICY "Admins can view all payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users a
    WHERE a.user_id = auth.uid()
  ));

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users a
    WHERE a.user_id = $1
  );
END;
$$;
