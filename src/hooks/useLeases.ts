import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lease } from '../types';
import { useNotification } from './useNotification';

export const useLeases = (userId: string | undefined) => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useNotification();

  const fetchLeases = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData: Lease[] = data.map(item => ({
        id: item.id,
        assetId: item.asset_id,
        tenantId: item.tenant_id,
        startDate: item.start_date,
        endDate: item.end_date,
        rentAmount: item.rent_amount || item.monthly_rent || 0, // Handle both old and new column names
        chargePeriodMinutes: item.charge_period_minutes || 43800, // Default to ~1 month
        frequency: item.frequency || 1,
        deposit: item.deposit,
        status: item.status,
        leaseType: item.lease_type,
        notes: item.notes || undefined,
        depositCollectedAmount: item.deposit_collected_amount || 0,
        createdAt: item.created_at,
      }));

      setLeases(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, [userId]);

  const addLease = async (lease: Omit<Lease, 'id' | 'createdAt'>) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('leases')
        .insert({
          user_id: userId,
          asset_id: lease.assetId,
          tenant_id: lease.tenantId,
          start_date: lease.startDate,
          end_date: lease.endDate,
          rent_amount: lease.rentAmount,
          charge_period_minutes: lease.chargePeriodMinutes,
          frequency: lease.frequency,
          deposit: lease.deposit,
          status: lease.status,
          lease_type: lease.leaseType,
          notes: lease.notes,
          deposit_collected_amount: lease.depositCollectedAmount || 0,
        })
        .select()
        .single();

      if (error) throw error;

      const newLease: Lease = {
        id: data.id,
        assetId: data.asset_id,
        tenantId: data.tenant_id,
        startDate: data.start_date,
        endDate: data.end_date,
        rentAmount: data.rent_amount,
        chargePeriodMinutes: data.charge_period_minutes,
        frequency: data.frequency,
        deposit: data.deposit,
        status: data.status,
        leaseType: data.lease_type,
        notes: data.notes || undefined,
        depositCollectedAmount: data.deposit_collected_amount || 0,
        createdAt: data.created_at,
      };

      setLeases(prev => [newLease, ...prev]);
      showSuccess('Lease created successfully');
      return newLease;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add lease';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const updateLease = async (lease: Lease) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('leases')
        .update({
          asset_id: lease.assetId,
          tenant_id: lease.tenantId,
          start_date: lease.startDate,
          end_date: lease.endDate,
          rent_amount: lease.rentAmount,
          charge_period_minutes: lease.chargePeriodMinutes,
          frequency: lease.frequency,
          deposit: lease.deposit,
          status: lease.status,
          lease_type: lease.leaseType,
          notes: lease.notes,
          deposit_collected_amount: lease.depositCollectedAmount || 0,
        })
        .eq('id', lease.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      const updatedLease: Lease = {
        id: data.id,
        assetId: data.asset_id,
        tenantId: data.tenant_id,
        startDate: data.start_date,
        endDate: data.end_date,
        rentAmount: data.rent_amount,
        chargePeriodMinutes: data.charge_period_minutes,
        frequency: data.frequency,
        deposit: data.deposit,
        status: data.status,
        leaseType: data.lease_type,
        notes: data.notes || undefined,
        depositCollectedAmount: data.deposit_collected_amount || 0,
        createdAt: data.created_at,
      };

      setLeases(prev => prev.map(l => l.id === lease.id ? updatedLease : l));
      showSuccess('Lease updated successfully');
      return updatedLease;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lease';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const deleteLease = async (id: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('leases')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setLeases(prev => prev.filter(l => l.id !== id));
      showSuccess('Lease deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete lease';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  return {
    leases,
    loading,
    error,
    addLease,
    updateLease,
    deleteLease,
    refetch: fetchLeases,
  };
};