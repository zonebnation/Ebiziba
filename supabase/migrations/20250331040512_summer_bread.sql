/*
  # Fix Profiles Table RLS Policies

  1. Changes
    - Drop existing RLS policies for profiles table
    - Add new policies that properly handle:
      - Profile creation for authenticated users
      - Profile updates for own profile
      - Profile viewing for own profile
    
  2. Security
    - Ensure users can only:
      - Create their own profile
      - View their own profile
      - Update their own profile
    - Prevent unauthorized access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies
CREATE POLICY "Enable insert for authenticated users only"
ON profiles FOR INSERT
WITH CHECK (
  auth.uid() = id
);

CREATE POLICY "Enable select for users based on user_id"
ON profiles FOR SELECT
USING (
  auth.uid() = id
);

CREATE POLICY "Enable update for users based on user_id"
ON profiles FOR UPDATE
USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id
);
