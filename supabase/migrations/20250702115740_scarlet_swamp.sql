/*
  # Add social media and other information to tenants table

  1. Schema Changes
    - Add `social_media` column to `tenants` table (jsonb array)
    - Add `other_information` column to `tenants` table (text)

  2. Data Structure
    - social_media: Array of objects with platform and handle properties
    - other_information: Free text field for additional tenant details

  3. Security
    - No changes to RLS policies needed as these are just additional columns
    - Existing policies will automatically apply to the new columns
*/

-- Add social_media column to tenants table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tenants' AND column_name = 'social_media'
  ) THEN
    ALTER TABLE public.tenants ADD COLUMN social_media jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add other_information column to tenants table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tenants' AND column_name = 'other_information'
  ) THEN
    ALTER TABLE public.tenants ADD COLUMN other_information text;
  END IF;
END $$;