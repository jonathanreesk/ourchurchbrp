/*
  # Add Insert Policy for Reading Plan
  
  1. Changes
    - Add INSERT policy to reading_plan table to allow seeding data
    - This allows the application to populate the reading plan on first load
  
  2. Security
    - Allow anyone to insert reading plan entries
    - This is safe as reading plan data is public and static
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reading_plan' 
    AND policyname = 'Anyone can insert reading plan'
  ) THEN
    CREATE POLICY "Anyone can insert reading plan"
      ON reading_plan
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;