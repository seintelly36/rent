/*
  # Create leases table

  1. New Tables
    - `leases`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `asset_id` (uuid, foreign key to assets)
      - `tenant_id` (uuid, foreign key to tenants)
      - `start_date` (date)
      - `end_date` (date)
      - `monthly_rent` (numeric)
      - `deposit` (numeric)
      - `status` (text with check constraint)
      - `lease_type` (text with check constraint)
      - `notes` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `leases` table
    - Add policy for authenticated users to manage their own leases

  3. Triggers
    - Add trigger to automatically update `updated_at` timestamp
*/

-- Create leases table if it doesn't exist
CREATE TABLE IF NOT EXISTS leases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  monthly_rent numeric(10,2) NOT NULL DEFAULT 0,
  deposit numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending', 'terminated')),
  lease_type text NOT NULL DEFAULT 'fixed_term' CHECK (lease_type IN ('fixed_term', 'month_to_month')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'leases' 
    AND policyname = 'Users can manage their own leases'
  ) THEN
    DROP POLICY "Users can manage their own leases" ON leases;
  END IF;
END $$;

-- Create policy for users to manage their own leases
CREATE POLICY "Users can manage their own leases"
ON leases FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updating updated_at timestamp if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_leases_updated_at'
  ) THEN
    CREATE TRIGGER update_leases_updated_at
    BEFORE UPDATE ON leases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;