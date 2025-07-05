import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Payment, PaymentCollectionResult } from '../types';
import { useNotification } from './useNotification';

export const usePayments = (userId: string | undefined) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useNotification();

  const fetchPayments = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData: Payment[] = data.map(item => ({
        id: item.id,
        tenantId: item.tenant_id,
        assetId: item.asset_id,
        amount: item.amount,
        dueDate: item.due_date,
        paidDate: item.paid_date || undefined,
        status: item.status,
        method: item.method || undefined,
        notes: item.notes || undefined,
        referenceCode: item.reference_code || undefined,
        createdAt: item.created_at,
      }));

      setPayments(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [userId]);

  const addPayment = async (payment: Omit<Payment, 'id' | 'createdAt'>) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          tenant_id: payment.tenantId,
          asset_id: payment.assetId,
          amount: payment.amount,
          due_date: payment.dueDate,
          paid_date: payment.paidDate,
          status: payment.status,
          method: payment.method,
          notes: payment.notes,
          reference_code: payment.referenceCode,
        })
        .select()
        .single();

      if (error) throw error;

      const newPayment: Payment = {
        id: data.id,
        tenantId: data.tenant_id,
        assetId: data.asset_id,
        amount: data.amount,
        dueDate: data.due_date,
        paidDate: data.paid_date || undefined,
        status: data.status,
        method: data.method || undefined,
        notes: data.notes || undefined,
        referenceCode: data.reference_code || undefined,
        createdAt: data.created_at,
      };

      setPayments(prev => [newPayment, ...prev]);
      showSuccess('Payment added successfully');
      return newPayment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add payment';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const collectPaymentWithDeposit = async (
    payment: Omit<Payment, 'id' | 'createdAt'>,
    leaseId?: string,
    depositAmountToCollect: number = 0
  ): Promise<PaymentCollectionResult> => {
    if (!userId) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase.rpc('collect_payment', {
        p_tenant_id: payment.tenantId,
        p_asset_id: payment.assetId,
        p_amount: payment.amount,
        p_due_date: payment.dueDate,
        p_paid_date: payment.paidDate || null,
        p_status: payment.status,
        p_method: payment.method || null,
        p_notes: payment.notes || null,
        p_reference_code: payment.referenceCode || null,
        p_lease_id: leaseId || null,
        p_deposit_amount_to_collect: depositAmountToCollect,
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('No data returned from payment collection');
      }

      const result = data[0];
      
      // Create the new payment object for local state
      const newPayment: Payment = {
        id: result.payment_id,
        tenantId: payment.tenantId,
        assetId: payment.assetId,
        amount: result.payment_amount,
        dueDate: payment.dueDate,
        paidDate: payment.paidDate,
        status: result.payment_status,
        method: payment.method,
        notes: payment.notes,
        referenceCode: payment.referenceCode,
        createdAt: new Date().toISOString(),
      };

      // Update local payments state
      setPayments(prev => [newPayment, ...prev]);

      showSuccess('Payment collected successfully');
      return {
        paymentId: result.payment_id,
        paymentAmount: result.payment_amount,
        paymentStatus: result.payment_status,
        leaseUpdated: result.lease_updated,
        newDepositCollectedAmount: result.new_deposit_collected_amount,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to collect payment';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const updatePayment = async (payment: Payment) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('payments')
        .update({
          tenant_id: payment.tenantId,
          asset_id: payment.assetId,
          amount: payment.amount,
          due_date: payment.dueDate,
          paid_date: payment.paidDate,
          status: payment.status,
          method: payment.method,
          notes: payment.notes,
          reference_code: payment.referenceCode,
        })
        .eq('id', payment.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      const updatedPayment: Payment = {
        id: data.id,
        tenantId: data.tenant_id,
        assetId: data.asset_id,
        amount: data.amount,
        dueDate: data.due_date,
        paidDate: data.paid_date || undefined,
        status: data.status,
        method: data.method || undefined,
        notes: data.notes || undefined,
        referenceCode: data.reference_code || undefined,
        createdAt: data.created_at,
      };

      setPayments(prev => prev.map(p => p.id === payment.id ? updatedPayment : p));
      showSuccess('Payment updated successfully');
      return updatedPayment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payment';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const deletePayment = async (id: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setPayments(prev => prev.filter(p => p.id !== id));
      showSuccess('Payment deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete payment';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const getLeasePaymentSummary = async (leaseId: string) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase.rpc('get_lease_payment_summary', {
        p_lease_id: leaseId,
      });

      if (error) throw error;

      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get lease payment summary';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  return {
    payments,
    loading,
    error,
    addPayment,
    collectPaymentWithDeposit,
    updatePayment,
    deletePayment,
    getLeasePaymentSummary,
    refetch: fetchPayments,
  };
};