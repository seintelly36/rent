/*
  # Add transaction types to payments table

  1. Schema Changes
    - Update payments table status constraint to include 'refunded' and 'cancelled'
    - Update payments table method constraint to include 'adjustment'
    - This allows the payments table to serve as a comprehensive transaction log

  2. Security
    - No changes to RLS policies needed
    - Existing policies will automatically apply to new status and method values

  3. Benefits
    - Complete audit trail of all financial transactions
    - Support for refunds and cancellations
    - Flexible transaction recording system
*/

-- Update payments status constraint to include refunded and cancelled
ALTER TABLE public.payments 
DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE public.payments 
ADD CONSTRAINT payments_status_check 
CHECK (status IN ('paid', 'pending', 'overdue', 'refunded', 'cancelled'));

-- Update payments method constraint to include adjustment
ALTER TABLE public.payments 
DROP CONSTRAINT IF EXISTS payments_method_check;

ALTER TABLE public.payments 
ADD CONSTRAINT payments_method_check 
CHECK (method IN ('cash', 'check', 'bank_transfer', 'online', 'adjustment'));