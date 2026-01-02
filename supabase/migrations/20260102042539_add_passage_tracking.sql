/*
  # Add Individual Passage Tracking

  1. Changes
    - Modify `completed_readings` table to track individual passages
    - Add `passage` column to store the specific passage reference
    - Drop the UNIQUE constraint on `date` column
    - Add composite unique constraint on (`date`, `passage`) to prevent duplicate completions
    
  2. Notes
    - This allows users to mark individual passages as complete
    - Each passage can only be marked complete once per date
*/

-- Drop the existing unique constraint on date
ALTER TABLE completed_readings DROP CONSTRAINT IF EXISTS completed_readings_date_key;

-- Add passage column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'completed_readings' AND column_name = 'passage'
  ) THEN
    ALTER TABLE completed_readings ADD COLUMN passage text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Add composite unique constraint on date and passage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'completed_readings_date_passage_key'
  ) THEN
    ALTER TABLE completed_readings ADD CONSTRAINT completed_readings_date_passage_key UNIQUE (date, passage);
  END IF;
END $$;