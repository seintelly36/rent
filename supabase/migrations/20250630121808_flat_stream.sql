/*
  # Create tenants table

  1. New Tables
    - `tenants`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `asset_id` (uuid, foreign key to assets)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `lease_start` (date)
      - `lease_end` (date)
      - `deposit` (numeric)
      - `monthly_rent` (numeric)
      - `status` (text with check constraint)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `tenants` table
    - Add policy for users to manage their own tenants
*/

CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  lease_start date NOT NULL,
  lease_end date NOT NULL,
  deposit numeric(10,2) NOT NULL DEFAULT 0,
  monthly_rent numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tenants"
  ON tenants
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();