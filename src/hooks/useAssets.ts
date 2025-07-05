import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Asset } from '../types';
import { useNotification } from './useNotification';

export const useAssets = (userId: string | undefined) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useNotification();

  const fetchAssets = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_user_assets');

      if (error) throw error;

      const transformedData: Asset[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        address: item.address,
        assetTypeId: item.asset_type_id,
        details: item.details || [],
        tenantId: item.tenant_id || undefined,
        status: item.status,
        createdAt: item.created_at,
      }));

      setAssets(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [userId]);

  const addAsset = async (asset: Omit<Asset, 'id' | 'createdAt'>) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase.rpc('add_user_asset', {
        p_name: asset.name,
        p_address: asset.address,
        p_asset_type_id: asset.assetTypeId,
        p_details: asset.details,
        p_tenant_id: asset.tenantId || null,
        p_status: asset.status,
      });

      if (error) throw error;

      // RPC functions return arrays, so we need to access the first element
      const assetData = data[0];
      if (!assetData) throw new Error('No data returned from add_user_asset');

      const newAsset: Asset = {
        id: assetData.id,
        name: assetData.name,
        address: assetData.address,
        assetTypeId: assetData.asset_type_id,
        details: assetData.details || [],
        tenantId: assetData.tenant_id || undefined,
        status: assetData.status,
        createdAt: assetData.created_at,
      };

      // Re-fetch all assets to ensure UI is synchronized
      await fetchAssets();
      showSuccess(`Asset "${asset.name}" created successfully`);
      return newAsset;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add asset';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const updateAsset = async (asset: Asset) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase.rpc('update_user_asset', {
        p_id: asset.id,
        p_name: asset.name,
        p_address: asset.address,
        p_asset_type_id: asset.assetTypeId,
        p_details: asset.details,
        p_tenant_id: asset.tenantId || null,
        p_status: asset.status,
      });

      if (error) throw error;

      // RPC functions return arrays, so we need to access the first element
      const assetData = data[0];
      if (!assetData) throw new Error('No data returned from update_user_asset');

      const updatedAsset: Asset = {
        id: assetData.id,
        name: assetData.name,
        address: assetData.address,
        assetTypeId: assetData.asset_type_id,
        details: assetData.details || [],
        tenantId: assetData.tenant_id || undefined,
        status: assetData.status,
        createdAt: assetData.created_at,
      };

      // Re-fetch all assets to ensure UI is synchronized
      await fetchAssets();
      showSuccess(`Asset "${asset.name}" updated successfully`);
      return updatedAsset;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update asset';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const deleteAsset = async (id: string) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase.rpc('delete_user_asset', {
        p_id: id,
      });

      if (error) throw error;

      // Re-fetch all assets to ensure UI is synchronized
      await fetchAssets();
      showSuccess('Asset deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete asset';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  return {
    assets,
    loading,
    error,
    addAsset,
    updateAsset,
    deleteAsset,
    refetch: fetchAssets,
  };
};