/*
  # Create PostgreSQL functions for asset management

  1. Functions
    - `get_user_assets()` - Fetch all assets for the authenticated user
    - `add_user_asset()` - Add a new asset for the authenticated user
    - `update_user_asset()` - Update an existing asset for the authenticated user
    - `delete_user_asset()` - Delete an asset for the authenticated user

  2. Security
    - All functions use `auth.uid()` to ensure user-scoped operations
    - Functions are marked as SECURITY DEFINER for proper execution context
*/

-- Function to get all assets for the current user
CREATE OR REPLACE FUNCTION get_user_assets()
RETURNS SETOF public.assets
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.assets
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC;
END;
$$;

-- Function to add a new asset for the current user
CREATE OR REPLACE FUNCTION add_user_asset(
  p_name text,
  p_address text,
  p_asset_type_id uuid,
  p_details jsonb DEFAULT '[]'::jsonb,
  p_tenant_id uuid DEFAULT NULL,
  p_status text DEFAULT 'vacant'
)
RETURNS public.assets
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_asset public.assets;
BEGIN
  -- Validate that the asset type belongs to the user
  IF NOT EXISTS (
    SELECT 1 FROM public.asset_types 
    WHERE id = p_asset_type_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Asset type not found or access denied';
  END IF;

  -- Insert the new asset
  INSERT INTO public.assets (
    user_id, 
    name, 
    address, 
    asset_type_id, 
    details, 
    tenant_id, 
    status
  )
  VALUES (
    auth.uid(), 
    p_name, 
    p_address, 
    p_asset_type_id, 
    p_details, 
    p_tenant_id, 
    p_status
  )
  RETURNING * INTO new_asset;
  
  RETURN new_asset;
END;
$$;

-- Function to update an existing asset for the current user
CREATE OR REPLACE FUNCTION update_user_asset(
  p_id uuid,
  p_name text,
  p_address text,
  p_asset_type_id uuid,
  p_details jsonb DEFAULT '[]'::jsonb,
  p_tenant_id uuid DEFAULT NULL,
  p_status text DEFAULT 'vacant'
)
RETURNS public.assets
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_asset public.assets;
BEGIN
  -- Validate that the asset type belongs to the user
  IF NOT EXISTS (
    SELECT 1 FROM public.asset_types 
    WHERE id = p_asset_type_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Asset type not found or access denied';
  END IF;

  -- Update the asset
  UPDATE public.assets
  SET
    name = p_name,
    address = p_address,
    asset_type_id = p_asset_type_id,
    details = p_details,
    tenant_id = p_tenant_id,
    status = p_status,
    updated_at = now()
  WHERE id = p_id AND user_id = auth.uid()
  RETURNING * INTO updated_asset;
  
  IF updated_asset IS NULL THEN
    RAISE EXCEPTION 'Asset not found or access denied';
  END IF;
  
  RETURN updated_asset;
END;
$$;

-- Function to delete an asset for the current user
CREATE OR REPLACE FUNCTION delete_user_asset(
  p_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.assets
  WHERE id = p_id AND user_id = auth.uid();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  IF deleted_count = 0 THEN
    RAISE EXCEPTION 'Asset not found or access denied';
  END IF;
  
  RETURN true;
END;
$$;