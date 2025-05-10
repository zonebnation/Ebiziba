/*
  # Add Trial Tracking System

  1. New Tables
    - `book_trials`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `device_id` (text)
      - `book_id` (uuid, references books)
      - `trial_start` (timestamptz)
      - `trial_end` (timestamptz)
      - `created_at` (timestamptz)

  2. Functions
    - `check_trial_eligibility` - Checks if a user/device is eligible for trial
    - `start_book_trial` - Starts a trial for a book
    - `is_trial_active` - Checks if a trial is active

  3. Security
    - Enable RLS on book_trials table
    - Add policies for trial management
*/

-- Create book trials table
CREATE TABLE IF NOT EXISTS book_trials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  device_id text NOT NULL,
  book_id uuid REFERENCES books(id),
  trial_start timestamptz NOT NULL DEFAULT now(),
  trial_end timestamptz NOT NULL DEFAULT (now() + interval '1 day'),
  created_at timestamptz DEFAULT now(),
  UNIQUE(device_id, book_id)
);

-- Enable RLS
ALTER TABLE book_trials ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own trials"
  ON book_trials
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can start trials"
  ON book_trials
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to check trial eligibility
CREATE OR REPLACE FUNCTION check_trial_eligibility(
  p_device_id text,
  p_book_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if device has already used trial for this book
  IF EXISTS (
    SELECT 1 FROM book_trials
    WHERE device_id = p_device_id
    AND book_id = p_book_id
  ) THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- Function to start a trial
CREATE OR REPLACE FUNCTION start_book_trial(
  p_user_id uuid,
  p_device_id text,
  p_book_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trial_end timestamptz;
BEGIN
  -- Check eligibility
  IF NOT check_trial_eligibility(p_device_id, p_book_id) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Trial already used for this book on this device'
    );
  END IF;

  -- Start trial
  v_trial_end := now() + interval '1 day';
  
  INSERT INTO book_trials (
    user_id,
    device_id,
    book_id,
    trial_start,
    trial_end
  )
  VALUES (
    p_user_id,
    p_device_id,
    p_book_id,
    now(),
    v_trial_end
  );

  RETURN json_build_object(
    'success', true,
    'trial_end', v_trial_end
  );
END;
$$;

-- Function to check if trial is active
CREATE OR REPLACE FUNCTION is_trial_active(
  p_device_id text,
  p_book_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM book_trials
    WHERE device_id = p_device_id
    AND book_id = p_book_id
    AND now() BETWEEN trial_start AND trial_end
  );
END;
$$;
