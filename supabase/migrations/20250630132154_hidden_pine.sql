/*
  # Add frequency column to leases table

  1. Changes
    - Add `frequency` column to `leases` table with default value of 1
    - This represents the number of charge periods in the lease

  2. Security
    - No changes to RLS policies needed
*/

-- Add frequency column to leases table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leases' AND column_name = 'frequency'
  ) THEN
    ALTER TABLE leases ADD COLUMN frequency integer NOT NULL DEFAULT 1;
  END IF;
END $$;