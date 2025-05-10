/*
  # Update book_access_logs RLS policies

  1. Changes
    - Update RLS policy for book_access_logs to allow users to insert logs for books they have purchased or have active trials

  2. Security
    - Modify INSERT policy to check for both purchased books and active trials
    - Keep existing SELECT policies unchanged
*/

-- Update the INSERT policy for book_access_logs
DROP POLICY IF EXISTS "Users can create access logs" ON book_access_logs;

CREATE POLICY "Users can create access logs"
ON book_access_logs
FOR INSERT
TO authenticated
WITH CHECK (
  -- Check if user has purchased the book
  EXISTS (
    SELECT 1 FROM user_books
    WHERE user_books.book_id = book_access_logs.book_id
    AND user_books.user_id = auth.uid()
  )
  OR
  -- Check if user has an active trial
  EXISTS (
    SELECT 1 FROM book_trials
    WHERE book_trials.book_id = book_access_logs.book_id
    AND book_trials.user_id = auth.uid()
    AND book_trials.trial_end > now()
  )
);
