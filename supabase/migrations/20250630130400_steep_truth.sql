/*
  # Add charge period to leases and rename monthly_rent

  1. Schema Changes
    - Add `charge_period_minutes` column to leases table (integer, not null, default 43800 minutes ≈ 1 month)
    - Rename `monthly_rent` column to `rent_amount` in leases table

  2. Data Migration
    - Set default charge period to 43800 minutes (approximately 1 month) for existing records
    - Preserve existing rent amounts during column rename

  3. Notes
    - 43800 minutes = 30.44 days * 24 hours * 60 minutes (average month)
    - This allows for flexible billing periods while maintaining backward compatibility
*/

-- Add charge_period_minutes column to leases table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leases' AND column_name = 'charge_period_minutes'
  ) THEN
    ALTER TABLE leases ADD COLUMN charge_period_minutes integer NOT NULL DEFAULT 43800;
  END IF;
END $$;

-- Rename monthly_rent to rent_amount
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leases' AND column_name = 'monthly_rent'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leases' AND column_name = 'rent_amount'
  ) THEN
    ALTER TABLE leases RENAME COLUMN monthly_rent TO rent_amount;
  END IF;
END $$;