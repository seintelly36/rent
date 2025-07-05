/*
  # Fix tenant lease columns constraint

  1. Schema Changes
    - Make `lease_start` and `lease_end` columns nullable in the `tenants` table
    - These columns appear to be legacy fields that are not used in the current application

  2. Rationale
    - The application's Tenant type doesn't include lease_start/lease_end fields
    - Making these nullable prevents constraint violations during tenant creation
    - Existing data integrity is preserved
*/

-- Make lease_start and lease_end columns nullable
ALTER TABLE tenants ALTER COLUMN lease_start DROP NOT NULL;
ALTER TABLE tenants ALTER COLUMN lease_end DROP NOT NULL;