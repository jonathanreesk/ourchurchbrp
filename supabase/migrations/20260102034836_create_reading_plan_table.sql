/*
  # Create Bible Reading Plan Table

  1. New Tables
    - `reading_plan`
      - `id` (uuid, primary key) - Unique identifier for each reading entry
      - `date` (date, unique) - The date for the reading (YYYY-MM-DD format)
      - `day_of_week` (text) - Day abbreviation (M, T, W, Th, F, S)
      - `reading` (text) - The Bible passages to read (e.g., "Ecc 3-4; 2 Tim 1")
      - `created_at` (timestamptz) - When the record was created

  2. Security
    - Enable RLS on `reading_plan` table
    - Add policy for anyone to read the reading plan (public data)
*/

CREATE TABLE IF NOT EXISTS reading_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  day_of_week text NOT NULL,
  reading text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reading_plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reading plan"
  ON reading_plan
  FOR SELECT
  TO anon, authenticated
  USING (true);