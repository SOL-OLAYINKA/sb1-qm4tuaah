/*
  # Community Chat Schema

  1. New Tables
    - `chat_groups`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `content` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read all chat groups
      - Read all messages in groups
      - Create messages in groups
      - No message editing/deletion for safety
*/

-- Create chat groups table
CREATE TABLE IF NOT EXISTS chat_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES chat_groups(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat_groups
CREATE POLICY "Anyone can view chat groups"
  ON chat_groups
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for chat_messages
CREATE POLICY "Users can view messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default chat groups
INSERT INTO chat_groups (name, description)
VALUES 
  ('Cycle Support', 'Connect with others about menstrual health and cycle tracking'),
  ('Postpartum Help', 'Support and advice for new mothers'),
  ('PCOS Warriors', 'Discussion and support for those with PCOS')
ON CONFLICT (name) DO NOTHING;