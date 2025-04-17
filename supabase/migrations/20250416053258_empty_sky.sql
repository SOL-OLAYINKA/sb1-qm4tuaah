/*
  # Add User Profiles and Moderation Features

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `display_name` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `chat_moderators`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `group_id` (uuid, references chat_groups)
      - `created_at` (timestamp)

  2. Alter Tables
    - Add `is_moderated` to chat_groups
    - Add `is_deleted` to chat_messages

  3. Security
    - Enable RLS on new tables
    - Add policies for user profiles and moderators
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_moderators table
CREATE TABLE IF NOT EXISTS chat_moderators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  group_id uuid REFERENCES chat_groups(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, group_id)
);

-- Add moderation fields
ALTER TABLE chat_groups ADD COLUMN IF NOT EXISTS is_moderated boolean DEFAULT true;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_moderators ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policies for chat_moderators
CREATE POLICY "Anyone can view moderators"
  ON chat_moderators
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only super admins can manage moderators"
  ON chat_moderators
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

-- Update chat_messages policies for moderation
CREATE POLICY "Moderators can delete messages"
  ON chat_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_moderators
      WHERE chat_moderators.group_id = chat_messages.group_id
      AND chat_moderators.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_moderators
      WHERE chat_moderators.group_id = chat_messages.group_id
      AND chat_moderators.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();