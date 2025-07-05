/*
  # Remove asset_id from tenants table

  1. Schema Changes
    - Drop foreign key constraint on asset_id
    - Remove asset_id column from tenants table

  2. Security
    - No changes to RLS policies needed
    - Existing policies will continue to work

  3. Benefits
    - Simplifies tenant management
    - Removes unnecessary coupling between tenants and assets
    - Allows more flexible tenant-asset relationships through leases
*/

-- Drop the foreign key constraint first
ALTER TABLE public.tenants 
DROP CONSTRAINT IF EXISTS tenants_asset_id_fkey;

-- Remove the asset_id column
ALTER TABLE public.tenants 
DROP COLUMN IF EXISTS asset_id;