/*
  # Add unique constraints to prevent duplicate names per user

  1. Data Cleanup
    - Remove duplicate entries by keeping the most recent one for each user_id + name combination
    - This ensures data integrity before adding constraints

  2. Unique Constraints
    - Add unique constraint on (user_id, name) for asset_types table
    - Add unique constraint on (user_id, name) for assets table  
    - Add unique constraint on (user_id, name) for tenants table

  3. Benefits
    - Prevents users from creating items with duplicate names
    - Maintains multi-tenancy (different users can have same names)
    - Ensures data consistency and prevents confusion
*/

-- Clean up duplicate asset_types (keep the most recent one)
WITH duplicates AS (
  SELECT 
    user_id, 
    name,
    array_agg(id ORDER BY created_at DESC) as ids
  FROM public.asset_types
  GROUP BY user_id, name
  HAVING count(*) > 1
)
DELETE FROM public.asset_types 
WHERE id IN (
  SELECT unnest(ids[2:]) 
  FROM duplicates
);

-- Clean up duplicate assets (keep the most recent one)
WITH duplicates AS (
  SELECT 
    user_id, 
    name,
    array_agg(id ORDER BY created_at DESC) as ids
  FROM public.assets
  GROUP BY user_id, name
  HAVING count(*) > 1
)
DELETE FROM public.assets 
WHERE id IN (
  SELECT unnest(ids[2:]) 
  FROM duplicates
);

-- Clean up duplicate tenants (keep the most recent one)
WITH duplicates AS (
  SELECT 
    user_id, 
    name,
    array_agg(id ORDER BY created_at DESC) as ids
  FROM public.tenants
  GROUP BY user_id, name
  HAVING count(*) > 1
)
DELETE FROM public.tenants 
WHERE id IN (
  SELECT unnest(ids[2:]) 
  FROM duplicates
);

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