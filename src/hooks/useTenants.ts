import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tenant } from '../types';

export const useTenants = (userId: string | undefined) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData: Tenant[] = data.map(item => ({
        id: item.id,
        assetId: item.asset_id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        status: item.status,
        socialMedia: item.social_media || [],
        otherInformation: item.other_information || undefined,
        createdAt: item.created_at,
      }));

      setTenants(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [userId]);

  const addTenant = async (tenant: Omit<Tenant, 'id' | 'createdAt'>) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert({
          user_id: userId,
          asset_id: tenant.assetId,
          name: tenant.name,
          email: tenant.email,
          phone: tenant.phone,
          status: tenant.status,
          social_media: tenant.socialMedia,
          other_information: tenant.otherInformation,
        })
        .select()
        .single();

      if (error) throw error;

      const newTenant: Tenant = {
        id: data.id,
        assetId: data.asset_id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        socialMedia: data.social_media || [],
        otherInformation: data.other_information || undefined,
        createdAt: data.created_at,
      };

      setTenants(prev => [newTenant, ...prev]);
      return newTenant;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tenant');
      throw err;
    }
  };

  const updateTenant = async (tenant: Tenant) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('tenants')
        .update({
          asset_id: tenant.assetId,
          name: tenant.name,
          email: tenant.email,
          phone: tenant.phone,
          status: tenant.status,
          social_media: tenant.socialMedia,
          other_information: tenant.otherInformation,
        })
        .eq('id', tenant.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      const updatedTenant: Tenant = {
        id: data.id,
        assetId: data.asset_id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        socialMedia: data.social_media || [],
        otherInformation: data.other_information || undefined,
        createdAt: data.created_at,
      };

      setTenants(prev => prev.map(t => t.id === tenant.id ? updatedTenant : t));
      return updatedTenant;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tenant');
      throw err;
    }
  };

  const deleteTenant = async (id: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setTenants(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tenant');
      throw err;
    }
  };

  return {
    tenants,
    loading,
    error,
    addTenant,
    updateTenant,
    deleteTenant,
    refetch: fetchTenants,
  };
};