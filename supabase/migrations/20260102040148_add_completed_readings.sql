/*
  # Add Completed Readings Tracking

  1. New Tables
    - `completed_readings`
      - `id` (uuid, primary key) - Unique identifier for each completion record
      - `date` (date, not null) - Date of the reading that was completed
      - `completed_at` (timestamptz) - When the reading was marked complete
      - `created_at` (timestamptz) - Record creation timestamp
      
  2. Security
    - Enable RLS on `completed_readings` table
    - Add policy for users to view their own completed readings
    - Add policy for users to insert their own completed readings
    - Add policy for users to delete their own completed readings
    
  3. Notes
    - Since this app doesn't have auth yet, we'll use a simple date-based system
    - Each date can only be marked complete once
    - Users can toggle completion on/off
*/

CREATE TABLE IF NOT EXISTS completed_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE completed_readings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view completed readings (will be restricted once auth is added)
CREATE POLICY "Anyone can view completed readings"
  ON completed_readings
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to insert completed readings (will be restricted once auth is added)
CREATE POLICY "Anyone can insert completed readings"
  ON completed_readings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to delete completed readings (will be restricted once auth is added)
CREATE POLICY "Anyone can delete completed readings"
  ON completed_readings
  FOR DELETE
  TO public
  USING (true);