/*
  # Remove lease start and end date columns from tenants table

  1. Schema Changes
    - Drop `lease_start` column from `tenants` table
    - Drop `lease_end` column from `tenants` table

  2. Rationale
    - Lease information is properly managed through the separate `leases` table
    - These columns are redundant and not used in the application
    - Simplifies tenant management and removes unnecessary constraints

  3. Security
    - No changes to RLS policies needed
    - Existing policies will continue to work with remaining columns
*/

-- Remove lease_start column from tenants table
ALTER TABLE public.tenants 
DROP COLUMN IF EXISTS lease_start;

-- Remove lease_end column from tenants table
ALTER TABLE public.tenants 
DROP COLUMN IF EXISTS lease_end;