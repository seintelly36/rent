/*
  # Add reference_code column to payments table

  1. Schema Changes
    - Add `reference_code` column to `payments` table (text, nullable)
    - This allows tracking of payment references like check numbers, transaction IDs, etc.

  2. Security
    - No changes to RLS policies needed as this is just adding a column
    - Existing policies will automatically apply to the new column

  3. Benefits
    - Better payment tracking and reconciliation
    - Support for external payment system integration
    - Improved audit trail for financial transactions
*/

-- Add reference_code column to payments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'reference_code'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN reference_code text;
  END IF;
END $$;