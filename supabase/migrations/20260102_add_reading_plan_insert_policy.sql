/*
  # Add INSERT and UPDATE policies to reading_plan table

  The reading_plan table currently only has SELECT policy, which prevents
  the seeding script from inserting or updating data. This migration adds
  the missing policies to allow public insert/update operations.

  These policies allow anyone to insert/update reading plan data. This is
  appropriate for the seeding script. Once authentication is added, these
  policies should be restricted to admin users only.
*/

-- Allow anyone to insert into reading_plan (for seeding)
CREATE POLICY "Anyone can insert reading plan"
  ON reading_plan
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to update reading_plan (for seeding with upsert)
CREATE POLICY "Anyone can update reading plan"
  ON reading_plan
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);
