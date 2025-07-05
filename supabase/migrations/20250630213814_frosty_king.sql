/*
  # Add deposit_collected column to leases table

  1. Schema Changes
    - Add `deposit_collected` column to `leases` table (boolean, not null, default false)
    - This tracks whether the security deposit for a lease has been collected

  2. Security
    - No changes to RLS policies needed as this is just adding a column
    - Existing policies will automatically apply to the new column

  3. Notes
    - Default value is false for all existing leases
    - This column will be updated via the payment collection RPC function
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