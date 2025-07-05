/*
  # Create assets table

  1. New Tables
    - `assets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `asset_type_id` (uuid, foreign key to asset_types)
      - `name` (text)
      - `address` (text)
      - `rent` (numeric)
      - `details` (jsonb)
      - `tenant_id` (uuid, optional)
      - `status` (text with check constraint)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `assets` table
    - Add policy for users to manage their own assets
*/

CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_type_id uuid REFERENCES asset_types(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  address text NOT NULL,
  rent numeric(10,2) NOT NULL DEFAULT 0,
  details jsonb DEFAULT '[]'::jsonb,
  tenant_id uuid,
  status text NOT NULL DEFAULT 'vacant' CHECK (status IN ('occupied', 'vacant', 'maintenance')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own assets"
  ON assets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();