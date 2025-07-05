import React, { useState } from 'react';
import { X, AlertTriangle, DollarSign, FileText } from 'lucide-react';
import { LeaseCollectionData, PeriodAdjustment } from '../../types';
import { formatCurrency } from '../../utils/dateUtils';

interface PeriodAdjustmentModalProps {
  showModal: boolean;
  selectedLeaseData: LeaseCollectionData | null;
  selectedPeriodNumber: number | null;
  onClose: () => void;
  onSubmit: (adjustment: PeriodAdjustment) => void;
  isSubmitting: boolean;
}

export const PeriodAdjustmentModal: React.FC<PeriodAdjustmentModalProps> = ({
  showModal,
  selectedLeaseData,
  selectedPeriodNumber,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [adjustmentType, setAdjustmentType] = useState<'refund' | 'cancel'>('refund');
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>('');

  React.useEffect(() => {
    if (selectedLeaseData && selectedPeriodNumber) {
      setAmount(selectedLeaseData.lease.rentAmount);
      setReason('');
    }
  }, [selectedLeaseData, selectedPeriodNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPeriodNumber || amount <= 0 || !reason.trim()) {
      return;
    }

    onSubmit({
      type: adjustmentType,
      periodNumber: selectedPeriodNumber,
      amount,
      reason: reason.trim(),
    });
  };

  const handleClose = () => {
    setAdjustmentType('refund');
    setAmount(0);
    setReason('');
    onClose();
  };

  if (!showModal || !selectedLeaseData || !selectedPeriodNumber) {
    return null;
  }

  const selectedInterval = selectedLeaseData.intervals.find(
    interval => interval.periodNumber === selectedPeriodNumber
  );

  if (!selectedInterval) {
    return null;
  }

  const maxAmount = selectedLeaseData.lease.rentAmount;
  const isIncurred = selectedInterval.isIncurred;
  const isPaid = selectedInterval.isPaid;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Period Adjustment
            </h2>
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Period Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Period Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Period:</span>
                <p className="font-medium">{selectedPeriodNumber}</p>
              </div>
              <div>
                <span className="text-gray-500">Amount:</span>
                <p className="font-medium">{formatCurrency(selectedInterval.amount)}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <p className={`font-medium ${
                  isPaid ? 'text-green-600' : 
                  isIncurred ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {isPaid ? 'Paid' : isIncurred ? 'Overdue' : 'Pending'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Tenant:</span>
                <p className="font-medium">{selectedLeaseData.tenant.name}</p>
              </div>
            </div>
          </div>

          {/* Warning for incurred periods */}
          {isIncurred && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Period Already Incurred</p>
                  <p>This period has already started. Adjustments will be recorded as transactions for audit purposes.</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Adjustment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adjustment Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('refund')}
                  className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                    adjustmentType === 'refund'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <DollarSign className="h-4 w-4 mx-auto mb-1" />
                  Refund
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('cancel')}
                  className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                    adjustmentType === 'cancel'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <X className="h-4 w-4 mx-auto mb-1" />
                  Cancel
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                min="0"
                max={maxAmount}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum: {formatCurrency(maxAmount)}
              </p>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Explain the reason for this adjustment..."
                required
              />
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                Transaction Summary
              </h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium capitalize">{adjustmentType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Period:</span>
                  <span className="font-medium">{selectedPeriodNumber}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={amount <= 0 || !reason.trim() || isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Record ${adjustmentType === 'refund' ? 'Refund' : 'Cancellation'}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};