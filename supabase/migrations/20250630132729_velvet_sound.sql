/*
  # Add Timestamp Support to Date Fields

  1. Schema Changes
    - Convert date columns to timestamp with time zone for better time handling
    - Update leases table: start_date, end_date
    - Update payments table: due_date, paid_date

  2. Data Preservation
    - Uses USING clause to convert existing date data to timestamps
    - Preserves existing data while changing column types

  3. Benefits
    - Full timestamp support with timezone information
    - Better precision for scheduling and tracking
    - Consistent with other timestamp fields in the database
*/

-- Update leases table to use timestamps
ALTER TABLE public.leases 
ALTER COLUMN start_date TYPE timestamp with time zone 
USING start_date::timestamp with time zone;

ALTER TABLE public.leases 
ALTER COLUMN end_date TYPE timestamp with time zone 
USING end_date::timestamp with time zone;

-- Update payments table to use timestamps
ALTER TABLE public.payments 
ALTER COLUMN due_date TYPE timestamp with time zone 
USING due_date::timestamp with time zone;

ALTER TABLE public.payments 
ALTER COLUMN paid_date TYPE timestamp with time zone 
USING paid_date::timestamp with time zone;