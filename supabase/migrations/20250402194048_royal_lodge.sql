/*
  # Fix Admin Policies to Prevent Recursion

  1. Changes
    - Drop existing policies
    - Create new non-recursive admin policies
    - Add direct user_id check for admin_users table
    
  2. Security
    - Maintain same security model but avoid recursion
    - Keep all admin privileges intact
*/

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

-- Create policy for viewing admin users (non-recursive)
CREATE POLICY "Admins can view admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy for viewing payment methods
CREATE POLICY "Anyone can view active payment methods"
  ON payment_methods
  FOR SELECT
  USING (active = true);

-- Add admin policies to reels table
CREATE POLICY "Admins can manage all reels"
  ON reels
  FOR ALL
  TO authenticated
  USING (EXISTS (
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
  ));

-- Add admin policies to book_trials table
CREATE POLICY "Admins can manage all trials"
  ON book_trials
  FOR ALL
  TO authenticated
  USING (EXISTS (
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
