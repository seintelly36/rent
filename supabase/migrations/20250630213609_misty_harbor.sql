/*
  # Add deposit_collected column to leases table

  1. Schema Changes
    - Add `deposit_collected` column to `leases` table (boolean, default false)
    - This tracks whether the security deposit has been collected for each lease

  2. Security
    - No changes to RLS policies needed as this is just adding a column
    - Existing policies will automatically apply to the new column
*/

-- Add deposit_collected column to leases table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leases' AND column_name = 'deposit_collected'
  ) THEN
    ALTER TABLE public.leases ADD COLUMN deposit_collected boolean NOT NULL DEFAULT false;
  END IF;
END $$;