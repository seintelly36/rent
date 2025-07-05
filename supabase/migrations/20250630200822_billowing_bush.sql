/*
  # Create RPC functions for assets management

  1. Functions
    - `get_user_assets()` - Retrieves all assets for the authenticated user
    - `add_user_asset()` - Creates a new asset for the authenticated user
    - `update_user_asset()` - Updates an existing asset for the authenticated user
    - `delete_user_asset()` - Deletes an asset for the authenticated user

  2. Security
    - All functions use SECURITY DEFINER for proper authentication
    - Functions check auth.uid() to ensure user is authenticated
    - RLS policies ensure users can only access their own data

  3. Permissions
    - Grant execute permissions to authenticated users for all functions
*/

-- Drop existing functions if they exist to avoid return type conflicts
DROP FUNCTION IF EXISTS public.get_user_assets();
DROP FUNCTION IF EXISTS public.add_user_asset(text, text, uuid, jsonb, uuid, text);
DROP FUNCTION IF EXISTS public.update_user_asset(uuid, text, text, uuid, jsonb, uuid, text);
DROP FUNCTION IF EXISTS public.delete_user_asset(uuid);

-- Function to get all assets for the authenticated user
CREATE OR REPLACE FUNCTION public.get_user_assets()
RETURNS TABLE (
  id uuid,
  name text,
  address text,
  asset_type_id uuid,
  details jsonb,
  tenant_id uuid,
  status text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.address,
    a.asset_type_id,
    a.details,
    a.tenant_id,
    a.status,
    a.created_at
  FROM public.assets a
  WHERE a.user_id = auth.uid();
END;
$$;

-- Function to add a new asset for the authenticated user
CREATE OR REPLACE FUNCTION public.add_user_asset(
  p_name text,
  p_address text,
  p_asset_type_id uuid,
  p_details jsonb DEFAULT '[]'::jsonb,
  p_tenant_id uuid DEFAULT NULL,
  p_status text DEFAULT 'vacant'
)
RETURNS TABLE (
  id uuid,
  name text,
  address text,
  asset_type_id uuid,
  details jsonb,
  tenant_id uuid,
  status text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_asset_id uuid;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
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
  ) VALUES (
    auth.uid(),
    p_name,
    p_address,
    p_asset_type_id,
    p_details,
    p_tenant_id,
    p_status
  ) RETURNING assets.id INTO new_asset_id;

  -- Return the newly created asset
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.address,
    a.asset_type_id,
    a.details,
    a.tenant_id,
    a.status,
    a.created_at
  FROM public.assets a
  WHERE a.id = new_asset_id;
END;
$$;

-- Function to update an existing asset for the authenticated user
CREATE OR REPLACE FUNCTION public.update_user_asset(
  p_id uuid,
  p_name text,
  p_address text,
  p_asset_type_id uuid,
  p_details jsonb DEFAULT '[]'::jsonb,
  p_tenant_id uuid DEFAULT NULL,
  p_status text DEFAULT 'vacant'
)
RETURNS TABLE (
  id uuid,
  name text,
  address text,
  asset_type_id uuid,
  details jsonb,
  tenant_id uuid,
  status text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Update the asset (RLS will ensure user can only update their own assets)
  UPDATE public.assets 
  SET 
    name = p_name,
    address = p_address,
    asset_type_id = p_asset_type_id,
    details = p_details,
    tenant_id = p_tenant_id,
    status = p_status,
    updated_at = now()
  WHERE assets.id = p_id AND assets.user_id = auth.uid();

  -- Check if any row was updated
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Asset not found or access denied';
  END IF;

  -- Return the updated asset
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.address,
    a.asset_type_id,
    a.details,
    a.tenant_id,
    a.status,
    a.created_at
  FROM public.assets a
  WHERE a.id = p_id;
END;
$$;

-- Function to delete an asset for the authenticated user
CREATE OR REPLACE FUNCTION public.delete_user_asset(p_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Delete the asset (RLS will ensure user can only delete their own assets)
  DELETE FROM public.assets 
  WHERE assets.id = p_id AND assets.user_id = auth.uid();

  -- Check if any row was deleted
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Asset not found or access denied';
  END IF;

  RETURN true;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_assets() TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_user_asset(text, text, uuid, jsonb, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_asset(uuid, text, text, uuid, jsonb, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_asset(uuid) TO authenticated;