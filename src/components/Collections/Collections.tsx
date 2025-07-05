import React from 'react';
import { DollarSign, AlertTriangle } from 'lucide-react';
import { Lease, Payment, Asset, Tenant, PaymentCollectionResult, PeriodAdjustment } from '../../types';
import { useCollectionsLogic } from '../../hooks/useCollectionsLogic';
import { CollectionSummaryCards } from './CollectionSummaryCards';
import { CollectionFilters } from './CollectionFilters';
import { CollectionPaymentModal } from './CollectionPaymentModal';
import { CollectionListItem } from './CollectionListItem';
import { PeriodAdjustmentModal } from './PeriodAdjustmentModal';

interface CollectionsProps {
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

export const Collections: React.FC<CollectionsProps> = (props) => {
  const {
    // Data
    filteredCollections,
    summary,
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
  } = useCollectionsLogic(props);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Calculating collections...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
        <p className="text-gray-600 mt-1">Track payment collections and manage period adjustments</p>
      </div>

      {/* Summary Cards */}
      <CollectionSummaryCards summary={summary} />

      {/* Filters */}
      <CollectionFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        setSearchTerm={setSearchTerm}
        setStatusFilter={setStatusFilter}
      />

      {/* Payment Collection Modal */}
      <CollectionPaymentModal
        showModal={showCollectPaymentModal}
        selectedLeaseData={selectedLeaseDataForPayment}
        paymentAmount={paymentAmount}
        paymentMethod={paymentMethod}
        paymentNotes={paymentNotes}
        paymentReferenceCode={paymentReferenceCode}
        depositToCollectAmount={depositToCollectAmount}
        isSubmittingPayment={isSubmittingPayment}
        onClose={handleClosePaymentModal}
        onSubmit={handleSubmitPayment}
        setPaymentAmount={setPaymentAmount}
        setPaymentMethod={setPaymentMethod}
        setPaymentNotes={setPaymentNotes}
        setPaymentReferenceCode={setPaymentReferenceCode}
        setDepositToCollectAmount={setDepositToCollectAmount}
        calculateTotalAmount={calculateTotalAmount}
        calculateIntervalsCovered={calculateIntervalsCovered}
        getRemainingDeposit={getRemainingDeposit}
      />

      {/* Period Adjustment Modal */}
      <PeriodAdjustmentModal
        showModal={showPeriodAdjustmentModal}
        selectedLeaseData={selectedLeaseDataForAdjustment}
        selectedPeriodNumber={selectedPeriodNumber}
        onClose={handleClosePeriodAdjustmentModal}
        onSubmit={handleSubmitPeriodAdjustment}
        isSubmitting={isSubmittingAdjustment}
      />

      {/* Collections List */}
      <div className="space-y-4">
        {filteredCollections.map((data) => (
          <CollectionListItem
            key={data.lease.id}
            data={data}
            isExpanded={expandedLeases.has(data.lease.id)}
            onToggleExpansion={toggleLeaseExpansion}
            onCollectPaymentClick={handleCollectPaymentClick}
            onPeriodAdjustmentClick={handlePeriodAdjustmentClick}
          />
        ))}
      </div>

      {filteredCollections.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No collections found</h3>
          <div className="text-gray-500 mb-4 space-y-2">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No active leases require collection at this time'
            }
            {!searchTerm && statusFilter === 'all' && (
              <div className="text-sm bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="font-medium text-blue-900 mb-2">To see collections, you need:</p>
                <ul className="text-blue-800 space-y-1 text-left">
                  <li>• Active leases with status 'active'</li>
                  <li>• Leases with start dates in the past</li>
                  <li>• Rent amounts greater than zero</li>
                  <li>• At least one payment period that has elapsed</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};