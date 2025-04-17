/*
  # Create wellness content tables

  1. New Tables
    - `wellness_content`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `type` (text)
      - `category` (text)
      - `thumbnail_url` (text)
      - `content_url` (text)
      - `created_at` (timestamp)
      - `featured` (boolean)
      - `active_date` (date)

  2. Security
    - Enable RLS on `wellness_content` table
    - Add policy for authenticated users to read content
*/

CREATE TABLE IF NOT EXISTS wellness_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('video', 'article', 'audio')),
  category text NOT NULL CHECK (category IN ('mental', 'physical', 'nutrition', 'sleep')),
  thumbnail_url text,
  content_url text,
  created_at timestamptz DEFAULT now(),
  featured boolean DEFAULT false,
  active_date date DEFAULT CURRENT_DATE
);

ALTER TABLE wellness_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wellness content"
  ON wellness_content
  FOR SELECT
  TO authenticated
  USING (true);