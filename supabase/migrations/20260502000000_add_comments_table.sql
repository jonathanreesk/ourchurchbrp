/*
  # Add Comments Table

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `reading_date` (date, not null) - Which day's reading this comment belongs to
      - `author_name` (text) - Display name (no auth required)
      - `content` (text, not null) - The comment body
      - `created_at` (timestamptz) - When comment was posted

  2. Security
    - Enable RLS
    - Public read and insert policies (auth can be tightened later)

  3. Realtime
    - Enable realtime replication so clients get live comment updates
*/

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_date date NOT NULL,
  author_name text NOT NULL DEFAULT 'Anonymous',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can post comments"
  ON comments FOR INSERT TO public WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE comments;
