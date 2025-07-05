import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Asset } from '../types';

export const useAssets = (userId: string | undefined) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      setAssets(prev => [newAsset, ...prev]);
      return newAsset;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add asset');
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

      setAssets(prev => prev.map(a => a.id === asset.id ? updatedAsset : a));
      return updatedAsset;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update asset');
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

      setAssets(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete asset');
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