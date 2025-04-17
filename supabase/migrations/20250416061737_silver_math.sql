/*
  # Add RLS policies for wellness content

  1. Changes
    - Add RLS policies for the wellness_content table to allow:
      - Authenticated users to view all content
      - Service role to manage content (insert/delete)
      
  2. Security
    - Enable RLS on wellness_content table
    - Add policy for authenticated users to view content
    - Add policy for service role to manage content
*/

-- Enable RLS on wellness_content table
ALTER TABLE wellness_content ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all wellness content
CREATE POLICY "Users can view wellness content"
ON wellness_content
FOR SELECT
TO authenticated
USING (true);

-- Allow service role to manage content (insert/delete)
CREATE POLICY "Service role can manage wellness content"
ON wellness_content
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);