/*
  # Add deposit_collected_amount column to leases table

  1. Schema Changes
    - Add `deposit_collected_amount` column to `leases` table
    - This tracks the cumulative amount of security deposit collected

  2. Data Migration
    - Set default value to 0 for existing records
    - Update existing records where deposit_collected = true to have full deposit amount

  3. Benefits
    - Allows partial deposit collection
    - Better tracking of deposit collection progress
    - More flexible payment collection workflow
*/

-- Add deposit_collected_amount column to leases table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leases' AND column_name = 'deposit_collected_amount'
  ) THEN
    ALTER TABLE public.leases ADD COLUMN deposit_collected_amount numeric(10,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Update existing records where deposit_collected = true to have full deposit amount
UPDATE public.leases 
SET deposit_collected_amount = deposit 
WHERE deposit_collected = true AND deposit_collected_amount = 0;