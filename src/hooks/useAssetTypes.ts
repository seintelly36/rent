import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AssetType } from '../types';
import { useNotification } from './useNotification';

export const useAssetTypes = (userId: string | undefined) => {
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useNotification();

  const fetchAssetTypes = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('asset_types')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData: AssetType[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || undefined,
        predefinedDetails: item.predefined_details || [],
        createdAt: item.created_at,
      }));

      setAssetTypes(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch asset types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetTypes();
  }, [userId]);

  const addAssetType = async (assetType: Omit<AssetType, 'id' | 'createdAt'>) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('asset_types')
        .insert({
          user_id: userId,
          name: assetType.name,
          description: assetType.description,
          predefined_details: assetType.predefinedDetails,
        })
        .select()
        .single();

      if (error) throw error;

      const newAssetType: AssetType = {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        predefinedDetails: data.predefined_details || [],
        createdAt: data.created_at,
      };

      // Re-fetch all asset types to ensure UI is synchronized
      await fetchAssetTypes();
      showSuccess(`Asset type "${assetType.name}" created successfully`);
      return newAssetType;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add asset type';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const updateAssetType = async (assetType: AssetType) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('asset_types')
        .update({
          name: assetType.name,
          description: assetType.description,
          predefined_details: assetType.predefinedDetails,
        })
        .eq('id', assetType.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      const updatedAssetType: AssetType = {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        predefinedDetails: data.predefined_details || [],
        createdAt: data.created_at,
      };

      // Re-fetch all asset types to ensure UI is synchronized
      await fetchAssetTypes();
      showSuccess(`Asset type "${assetType.name}" updated successfully`);
      return updatedAssetType;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update asset type';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const deleteAssetType = async (id: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('asset_types')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      // Re-fetch all asset types to ensure UI is synchronized
      await fetchAssetTypes();
      showSuccess('Asset type deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete asset type';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  return {
    assetTypes,
    loading,
    error,
    addAssetType,
    updateAssetType,
    deleteAssetType,
    refetch: fetchAssetTypes,
  };
};