import { useState, useMemo } from 'react';
import { Lease, Payment, Asset, Tenant, LeaseCollectionData, PaymentCollectionResult, PeriodAdjustment } from '../types';
import { useCollections } from './useCollections';
import { useNotification } from './useNotification';
import { generateId } from '../utils/dateUtils';

interface UseCollectionsLogicProps {
  leases: Lease[];
  payments: Payment[];
  assets: Asset[];
  tenants: Tenant[];
  onCollectPayment: (
    payment: Omit<Payment, 'id' | 'createdAt'>,
    leaseId?: string,
    depositAmountToCollect?: number
  ) => Promise<PaymentCollectionResult>;
  onRefreshLeases: () => void;
}

export const useCollectionsLogic = ({
  leases,
  payments,
  assets,
  tenants,
  onCollectPayment,
  onRefreshLeases,
}: UseCollectionsLogicProps) => {
  const { showSuccess, showError } = useNotification();
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'overdue'>('all');
  const [expandedLeases, setExpandedLeases] = useState<Set<string>>(new Set());
  
  // Payment collection modal state
  const [showCollectPaymentModal, setShowCollectPaymentModal] = useState(false);
  const [selectedLeaseDataForPayment, setSelectedLeaseDataForPayment] = useState<LeaseCollectionData | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<Payment['method']>('bank_transfer');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [paymentReferenceCode, setPaymentReferenceCode] = useState<string>('');
  const [depositToCollectAmount, setDepositToCollectAmount] = useState<number>(0);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Period adjustment modal state
  const [showPeriodAdjustmentModal, setShowPeriodAdjustmentModal] = useState(false);
  const [selectedLeaseDataForAdjustment, setSelectedLeaseDataForAdjustment] = useState<LeaseCollectionData | null>(null);
  const [selectedPeriodNumber, setSelectedPeriodNumber] = useState<number | null>(null);
  const [isSubmittingAdjustment, setIsSubmittingAdjustment] = useState(false);

  // Get collections data from the collections hook
  const {
    collectionsData,
    activeCollections,
    overdueCollections,
    summary,
    loading,
    error,
  } = useCollections({ leases, payments, assets, tenants });

  // Filter collections based on search and status
  const filteredCollections = useMemo(() => {
    return collectionsData.filter((data) => {
      const matchesSearch = !searchTerm || 
        data.tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.asset.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && data.isActive && data.amountToCollect > 0) ||
        (statusFilter === 'overdue' && data.intervals.some(interval => interval.isIncurred && !interval.isPaid));
      
      return matchesSearch && matchesStatus;
    });
  }, [collectionsData, searchTerm, statusFilter]);

  // Event handlers
  const toggleLeaseExpansion = (leaseId: string) => {
    const newExpanded = new Set(expandedLeases);
    if (newExpanded.has(leaseId)) {
      newExpanded.delete(leaseId);
    } else {
      newExpanded.add(leaseId);
    }
    setExpandedLeases(newExpanded);
  };

  const handleCollectPaymentClick = (leaseData: LeaseCollectionData) => {
    setSelectedLeaseDataForPayment(leaseData);
    setPaymentAmount(leaseData.amountToCollect);
    setPaymentMethod('bank_transfer');
    setPaymentNotes('');
    setPaymentReferenceCode('');
    setDepositToCollectAmount(0);
    setShowCollectPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedLeaseDataForPayment || paymentAmount <= 0) return;

    setIsSubmittingPayment(true);
    try {
      const paymentData: Omit<Payment, 'id' | 'createdAt'> = {
        tenantId: selectedLeaseDataForPayment.tenant.id,
        assetId: selectedLeaseDataForPayment.asset.id,
        amount: paymentAmount,
        dueDate: new Date().toISOString(),
        paidDate: new Date().toISOString(),
        status: 'paid',
        method: paymentMethod,
        notes: paymentNotes || undefined,
        referenceCode: paymentReferenceCode || undefined,
      };

      const result = await onCollectPayment(
        paymentData,
        selectedLeaseDataForPayment.lease.id,
        depositToCollectAmount
      );

      // If deposit was collected or lease was updated, refresh leases to update the UI
      if (result.leaseUpdated) {
        onRefreshLeases();
      }

      // Close modal and reset form
      handleClosePaymentModal();
      showSuccess('Payment collected successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to collect payment';
      showError(errorMessage);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleClosePaymentModal = () => {
    setShowCollectPaymentModal(false);
    setSelectedLeaseDataForPayment(null);
    setPaymentAmount(0);
    setPaymentNotes('');
    setPaymentReferenceCode('');
    setDepositToCollectAmount(0);
  };

  const handlePeriodAdjustmentClick = (leaseData: LeaseCollectionData, periodNumber: number) => {
    setSelectedLeaseDataForAdjustment(leaseData);
    setSelectedPeriodNumber(periodNumber);
    setShowPeriodAdjustmentModal(true);
  };

  const handleSubmitPeriodAdjustment = async (adjustment: PeriodAdjustment) => {
    if (!selectedLeaseDataForAdjustment) return;

    setIsSubmittingAdjustment(true);
    try {
      // Create a transaction record for the adjustment
      const adjustmentPayment: Omit<Payment, 'id' | 'createdAt'> = {
        tenantId: selectedLeaseDataForAdjustment.tenant.id,
        assetId: selectedLeaseDataForAdjustment.asset.id,
        amount: -adjustment.amount, // Negative amount for refunds/cancellations
        dueDate: new Date().toISOString(),
        paidDate: new Date().toISOString(),
        status: adjustment.type === 'refund' ? 'refunded' : 'cancelled',
        method: 'adjustment',
        notes: `Period ${adjustment.periodNumber} ${adjustment.type}: ${adjustment.reason}`,
      };

      await onCollectPayment(adjustmentPayment);

      // Close modal and reset form
      handleClosePeriodAdjustmentModal();
      showSuccess(`Period ${adjustment.type} processed successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process period adjustment';
      showError(errorMessage);
    } finally {
      setIsSubmittingAdjustment(false);
    }
  };

  const handleClosePeriodAdjustmentModal = () => {
    setShowPeriodAdjustmentModal(false);
    setSelectedLeaseDataForAdjustment(null);
    setSelectedPeriodNumber(null);
  };

  // Utility functions
  const calculateTotalAmount = () => {
    let total = paymentAmount;
    if (depositToCollectAmount > 0) {
      total += depositToCollectAmount;
    }
    return total;
  };

  const calculateIntervalsCovered = () => {
    if (!selectedLeaseDataForPayment || paymentAmount <= 0) return 0;
    return Math.floor(paymentAmount / selectedLeaseDataForPayment.lease.rentAmount);
  };

  const getRemainingDeposit = () => {
    if (!selectedLeaseDataForPayment) return 0;
    return selectedLeaseDataForPayment.lease.deposit - (selectedLeaseDataForPayment.lease.depositCollectedAmount || 0);
  };

  return {
    // Data
    collectionsData,
    activeCollections,
    overdueCollections,
    summary,
    filteredCollections,
    loading,
    error,

    // Filter state
    searchTerm,
    statusFilter,
    expandedLeases,

    // Payment modal state
    showCollectPaymentModal,
    selectedLeaseDataForPayment,
    paymentAmount,
    paymentMethod,
    paymentNotes,
    paymentReferenceCode,
    depositToCollectAmount,
    isSubmittingPayment,

    // Period adjustment state
    showPeriodAdjustmentModal,
    selectedLeaseDataForAdjustment,
    selectedPeriodNumber,
    isSubmittingAdjustment,

    // Event handlers
    setSearchTerm,
    setStatusFilter,
    toggleLeaseExpansion,
    handleCollectPaymentClick,
    handleSubmitPayment,
    handleClosePaymentModal,
    setPaymentAmount,
    setPaymentMethod,
    setPaymentNotes,
    setPaymentReferenceCode,
    setDepositToCollectAmount,
    handlePeriodAdjustmentClick,
    handleSubmitPeriodAdjustment,
    handleClosePeriodAdjustmentModal,

    // Utility functions
    calculateTotalAmount,
    calculateIntervalsCovered,
    getRemainingDeposit,
  };
};