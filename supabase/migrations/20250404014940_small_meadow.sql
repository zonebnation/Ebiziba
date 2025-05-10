-- Add device_info column to book_trials table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'book_trials' AND column_name = 'device_info'
  ) THEN
    ALTER TABLE book_trials ADD COLUMN device_info JSONB;
  END IF;
END $$;

-- Add suspicious column to book_trials table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'book_trials' AND column_name = 'suspicious'
  ) THEN
    ALTER TABLE book_trials ADD COLUMN suspicious BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create index on device_id for faster queries
CREATE INDEX IF NOT EXISTS idx_book_trials_device_id ON book_trials (device_id);

-- Create index on book_id for faster queries
CREATE INDEX IF NOT EXISTS idx_book_trials_book_id ON book_trials (book_id);

-- Create index on suspicious flag for faster queries
CREATE INDEX IF NOT EXISTS idx_book_trials_suspicious ON book_trials (suspicious);

-- Function to check trial eligibility with enhanced security
CREATE OR REPLACE FUNCTION check_trial_eligibility(
  p_device_id text,
  p_book_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trial_count integer;
  v_suspicious_count integer;
BEGIN
  -- Validate inputs
  IF p_device_id IS NULL OR p_book_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check if device has already used trial for this book
  SELECT COUNT(*) INTO v_trial_count
  FROM book_trials
  WHERE device_id = p_device_id
  AND book_id = p_book_id;
  
  IF v_trial_count > 0 THEN
    RETURN false;
  END IF;
  
  -- Check for suspicious activity (multiple trials in short period)
  SELECT COUNT(*) INTO v_suspicious_count
  FROM book_trials
  WHERE device_id = p_device_id
  AND created_at > now() - interval '7 days';
  
  IF v_suspicious_count >= 5 THEN
    -- Mark as suspicious but don't immediately block
    INSERT INTO book_trials (
      user_id,
      device_id,
      book_id,
      trial_start,
      trial_end,
      suspicious,
      device_info
    )
    VALUES (
      NULL,
      p_device_id,
      p_book_id,
      now(),
      now(),
      true,
      jsonb_build_object('reason', 'Too many trials', 'count', v_suspicious_count)
    )
    ON CONFLICT (device_id, book_id) DO NOTHING;
    
    -- Still allow trial but flag it
    RETURN true;
  END IF;

  RETURN true;
END;
$$;

-- Function to start a trial with enhanced security
CREATE OR REPLACE FUNCTION start_book_trial(
  p_user_id uuid,
  p_device_id text,
  p_book_id uuid,
  p_device_info jsonb DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trial_end timestamptz;
  v_user_trial_count integer;
  v_device_trial_count integer;
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
  
  -- Check if user has too many trials
  SELECT COUNT(*) INTO v_user_trial_count
  FROM book_trials
  WHERE user_id = p_user_id
  AND created_at > now() - interval '7 days';
  
  IF v_user_trial_count >= 10 THEN
    RETURN json_build_object(
      'success', false,
      'message', 'You have started too many trials recently. Please try again later.'
    );
  END IF;
  
  -- Check if device has too many trials
  SELECT COUNT(*) INTO v_device_trial_count
  FROM book_trials
  WHERE device_id = p_device_id
  AND created_at > now() - interval '7 days';
  
  IF v_device_trial_count >= 10 THEN
    -- Mark as suspicious
    INSERT INTO book_trials (
      user_id,
      device_id,
      book_id,
      trial_start,
      trial_end,
      suspicious,
      device_info
    )
    VALUES (
      p_user_id,
      p_device_id,
      p_book_id,
      now(),
      now(),
      true,
      jsonb_build_object('reason', 'Too many device trials', 'count', v_device_trial_count)
    )
    ON CONFLICT (device_id, book_id) DO NOTHING;
    
    RETURN json_build_object(
      'success', false,
      'message', 'This device has started too many trials recently. Please try again later.'
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
      trial_end,
      device_info
    )
    VALUES (
      p_user_id,
      p_device_id,
      p_book_id,
      now(),
      v_trial_end,
      p_device_info
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

-- Function to check if trial is active with enhanced security
CREATE OR REPLACE FUNCTION is_trial_active(
  p_device_id text,
  p_book_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_active boolean;
  v_is_suspicious boolean;
BEGIN
  -- Validate inputs
  IF p_device_id IS NULL OR p_book_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check if trial exists and is active
  SELECT 
    now() BETWEEN trial_start AND trial_end,
    suspicious INTO v_is_active, v_is_suspicious
  FROM book_trials
  WHERE device_id = p_device_id
  AND book_id = p_book_id
  LIMIT 1;
  
  -- If trial is suspicious and active, log it but still allow access
  IF v_is_active AND v_is_suspicious THEN
    -- Could add additional logging here if needed
    RETURN true;
  END IF;

  RETURN COALESCE(v_is_active, false);
END;
$$;

-- Function to detect trial abuse
CREATE OR REPLACE FUNCTION detect_trial_abuse(
  p_device_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trial_count integer;
  v_user_count integer;
  v_recent_trials integer;
BEGIN
  -- Check total trials for this device
  SELECT COUNT(*) INTO v_trial_count
  FROM book_trials
  WHERE device_id = p_device_id;
  
  -- Check how many different users have used this device
  SELECT COUNT(DISTINCT user_id) INTO v_user_count
  FROM book_trials
  WHERE device_id = p_device_id
  AND user_id IS NOT NULL;
  
  -- Check recent trial activity
  SELECT COUNT(*) INTO v_recent_trials
  FROM book_trials
  WHERE device_id = p_device_id
  AND created_at > now() - interval '24 hours';
  
  -- Detect abuse patterns
  RETURN (v_trial_count > 20) OR (v_user_count > 3) OR (v_recent_trials > 5);
END;
$$;

-- Create a view for suspicious trial activity
CREATE OR REPLACE VIEW suspicious_trial_activity AS
SELECT 
  device_id,
  COUNT(DISTINCT book_id) AS total_books_tried,
  COUNT(DISTINCT user_id) AS total_users,
  MAX(created_at) AS latest_activity,
  COUNT(*) FILTER (WHERE suspicious = true) AS suspicious_count,
  COUNT(*) FILTER (WHERE created_at > now() - interval '7 days') AS recent_trials
FROM book_trials
GROUP BY device_id
HAVING 
  COUNT(*) > 10 OR
  COUNT(DISTINCT user_id) > 2 OR
  COUNT(*) FILTER (WHERE suspicious = true) > 0
ORDER BY latest_activity DESC;
