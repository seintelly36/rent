/*
  # Add unique constraints for user-scoped names

  1. Constraints Added
    - `asset_types`: Unique constraint on (user_id, name)
    - `assets`: Unique constraint on (user_id, name)
    - `tenants`: Unique constraint on (user_id, name)

  2. Benefits
    - Prevents duplicate names within a user's data
    - Allows different users to have items with the same names
    - Maintains data integrity and prevents confusion

  3. Implementation
    - Uses IF NOT EXISTS to avoid conflicts with existing constraints
    - Handles potential constraint name conflicts gracefully
*/

-- Add unique constraint to asset_types table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'asset_types_user_id_name_unique'
  ) THEN
    ALTER TABLE public.asset_types 
    ADD CONSTRAINT asset_types_user_id_name_unique 
    UNIQUE (user_id, name);
  END IF;
END $$;

-- Add unique constraint to assets table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'assets_user_id_name_unique'
  ) THEN
    ALTER TABLE public.assets 
    ADD CONSTRAINT assets_user_id_name_unique 
    UNIQUE (user_id, name);
  END IF;
END $$;

-- Add unique constraint to tenants table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'tenants_user_id_name_unique'
  ) THEN
    ALTER TABLE public.tenants 
    ADD CONSTRAINT tenants_user_id_name_unique 
    UNIQUE (user_id, name);
  END IF;
END $$;