/*
  # Add Update Policy for Reading Plan
  
  1. Changes
    - Add UPDATE policy to reading_plan table to support upsert operations
    - This allows the application to update reading plan entries during seeding
  
  2. Security
    - Allow anyone to update reading plan entries
    - This is safe as reading plan data is public and static
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reading_plan' 
    AND policyname = 'Anyone can update reading plan'
  ) THEN
    CREATE POLICY "Anyone can update reading plan"
      ON reading_plan
      FOR UPDATE
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;