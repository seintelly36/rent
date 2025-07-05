/*
  # Make email and phone nullable in tenants table

  1. Schema Changes
    - Remove NOT NULL constraint from email column in tenants table
    - Remove NOT NULL constraint from phone column in tenants table

  2. Security
    - No changes to RLS policies needed
    - Existing policies will continue to work with nullable fields

  3. Benefits
    - Allows creating tenants without email or phone information
    - More flexible tenant data entry
    - Supports partial tenant information collection
*/

-- Make email column nullable
ALTER TABLE public.tenants 
ALTER COLUMN email DROP NOT NULL;

-- Make phone column nullable
ALTER TABLE public.tenants 
ALTER COLUMN phone DROP NOT NULL;