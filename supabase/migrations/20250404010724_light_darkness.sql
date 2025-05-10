/*
  # Fix Book Trial Functions

  1. Changes
    - Update check_trial_eligibility function to handle errors better
    - Update start_book_trial function to handle errors better
    - Update is_trial_active function to handle errors better
    
  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS check_trial_eligibility;
DROP FUNCTION IF EXISTS start_book_trial;
DROP FUNCTION IF EXISTS is_trial_active;

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
  -- Validate inputs
  IF p_device_id IS NULL OR p_book_id IS NULL THEN
    RETURN false;
  END IF;

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
  -- Validate inputs
  IF p_user_id IS NULL OR p_device_id IS NULL OR p_book_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Missing required parameters'
    );
  END IF;

  -- Check if book exists
  IF NOT EXISTS (SELECT 1 FROM books WHERE id = p_book_id) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Book not found'
    );
  END IF;

  -- Check eligibility
  IF NOT check_trial_eligibility(p_device_id, p_book_id) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Trial already used for this book on this device'
    );
  END IF;

  -- Start trial
  v_trial_end := now() + interval '1 day';
  
  BEGIN
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
  EXCEPTION
    WHEN unique_violation THEN
      RETURN json_build_object(
        'success', false,
        'message', 'Trial already exists for this book on this device'
      );
    WHEN OTHERS THEN
      RETURN json_build_object(
        'success', false,
        'message', 'Error creating trial: ' || SQLERRM
      );
  END;

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
  -- Validate inputs
  IF p_device_id IS NULL OR p_book_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM book_trials
    WHERE device_id = p_device_id
    AND book_id = p_book_id
    AND now() BETWEEN trial_start AND trial_end
  );
END;
$$;
