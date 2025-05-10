/*
  # Add Admin User System

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)

  2. Changes
    - Add admin-specific RLS policies to:
      - reels
      - books
      - book_trials
      - user_books
      - book_access_logs
      - payment_methods
      - payments

  3. Security
    - Enable RLS on admin_users table
    - Add policies for admin access
    - Insert specified admin user
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Only admins can view admin_users" ON admin_users;
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

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing admin users
CREATE POLICY "Only admins can view admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
  );

-- Insert the specified admin user
INSERT INTO admin_users (user_id)
VALUES ('ff67aabc-2894-442d-96b5-bd67d18cc741')
ON CONFLICT (user_id) DO NOTHING;

-- Add admin policies to reels table
CREATE POLICY "Admins can manage all reels"
  ON reels
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
  );

-- Add admin policies to books table
CREATE POLICY "Admins can manage all books"
  ON books
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
  );

-- Add admin policies to book_trials table
CREATE POLICY "Admins can manage all trials"
  ON book_trials
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
  );

-- Add admin policies to user_books table
CREATE POLICY "Admins can manage all user_books"
  ON user_books
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
  );

-- Add admin policies to book_access_logs table
CREATE POLICY "Admins can view all access logs"
  ON book_access_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
  );

-- Add admin policies to payment_methods table
CREATE POLICY "Admins can manage payment methods"
  ON payment_methods
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
  );

-- Add admin policies to payments table
CREATE POLICY "Admins can view all payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
  );

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = $1
  );
END;
$$;
