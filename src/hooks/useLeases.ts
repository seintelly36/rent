import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lease } from '../types';
import { useNotificationContext } from '../context/NotificationContext';

export const useLeases = (userId: string | undefined) => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError, showWarning } = useNotificationContext();

  const adjustLeasePeriods = async (leaseId: string, periodNumber: number, adjustmentType: 'refund' | 'cancel') => {
    if (!userId) return;

    try {
      const { data, error } = await supabase.rpc('adjust_lease_periods', {
        p_lease_id: leaseId,
        p_period_number: periodNumber,
        p_adjustment_type: adjustmentType,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        
        // Update local state with the adjusted lease
        setLeases(prev => prev.map(lease => {
          if (lease.id === leaseId) {
            return {
              ...lease,
              frequency: result.new_frequency,
              endDate: result.new_end_date,
            };
          }
          return lease;
        }));

        if (result.adjustment_applied) {
          showSuccess(`Lease periods adjusted successfully. Frequency reduced from ${result.old_frequency} to ${result.new_frequency} periods.`);
        } else {
          showWarning('Cannot reduce lease frequency below 1 period.');
        }

        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to adjust lease periods';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

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

      // Re-fetch all leases to ensure UI is synchronized
      await fetchLeases();
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

      // Re-fetch all leases to ensure UI is synchronized
      await fetchLeases();
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

      // Re-fetch all leases to ensure UI is synchronized
      await fetchLeases();
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
    adjustLeasePeriods,
    refetch: fetchLeases,
  };
};