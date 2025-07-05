/*
  # Create asset types table

  1. New Tables
    - `asset_types`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `description` (text, optional)
      - `predefined_details` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `asset_types` table
    - Add policy for users to manage their own asset types
*/

CREATE TABLE IF NOT EXISTS asset_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  predefined_details jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE asset_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own asset types"
  ON asset_types
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_asset_types_updated_at
  BEFORE UPDATE ON asset_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();