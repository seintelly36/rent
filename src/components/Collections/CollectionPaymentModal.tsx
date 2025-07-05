import React from 'react';
import { X } from 'lucide-react';
import { LeaseCollectionData, Payment } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/dateUtils';

interface CollectionPaymentModalProps {
  showModal: boolean;
  selectedLeaseData: LeaseCollectionData | null;
  paymentAmount: number;
  paymentMethod: Payment['method'];
  paymentNotes: string;
  paymentReferenceCode: string;
  depositToCollectAmount: number;
  isSubmittingPayment: boolean;
  onClose: () => void;
  onSubmit: () => void;
  setPaymentAmount: (amount: number) => void;
  setPaymentMethod: (method: Payment['method']) => void;
  setPaymentNotes: (notes: string) => void;
  setPaymentReferenceCode: (code: string) => void;
  setDepositToCollectAmount: (amount: number) => void;
  calculateTotalAmount: () => number;
  calculateIntervalsCovered: () => number;
  getRemainingDeposit: () => number;
}

export const CollectionPaymentModal: React.FC<CollectionPaymentModalProps> = ({
  showModal,
  selectedLeaseData,
  paymentAmount,
  paymentMethod,
  paymentNotes,
  paymentReferenceCode,
  depositToCollectAmount,
  isSubmittingPayment,
  onClose,
  onSubmit,
  setPaymentAmount,
  setPaymentMethod,
  setPaymentNotes,
  setPaymentReferenceCode,
  setDepositToCollectAmount,
  calculateTotalAmount,
  calculateIntervalsCovered,
  getRemainingDeposit,
}) => {
  if (!showModal || !selectedLeaseData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Collect Payment</h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Lease Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Lease Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Tenant:</span>
                <p className="font-medium">{selectedLeaseData.tenant.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Asset:</span>
                <p className="font-medium">{selectedLeaseData.asset.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Rent Amount:</span>
                <p className="font-medium">{formatCurrency(selectedLeaseData.lease.rentAmount)}</p>
              </div>
              <div>
                <span className="text-gray-500">Amount Due:</span>
                <p className="font-medium text-red-600">{formatCurrency(selectedLeaseData.amountToCollect)}</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount (Rent)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as Payment['method'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="online">Online Payment</option>
                </select>
              </div>
            </div>

            {/* Reference Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Code (Optional)
              </label>
              <input
                type="text"
                value={paymentReferenceCode}
                onChange={(e) => setPaymentReferenceCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Transaction ID, check number, etc."
              />
            </div>

            {/* Deposit Collection */}
            {getRemainingDeposit() > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-blue-900">
                      Collect Security Deposit
                    </label>
                    <span className="text-sm text-blue-700">
                      Available: {formatCurrency(getRemainingDeposit())}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={getRemainingDeposit()}
                    step="0.01"
                    value={depositToCollectAmount}
                    onChange={(e) => setDepositToCollectAmount(Math.min(Number(e.target.value), getRemainingDeposit()))}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amount to collect"
                  />
                  <div className="text-xs text-blue-700">
                    Collected: {formatCurrency(selectedLeaseData.lease.depositCollectedAmount || 0)} / {formatCurrency(selectedLeaseData.lease.deposit)}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                rows={3}
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Payment notes..."
              />
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-900 mb-2">Payment Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Rent Payment:</span>
                <span className="font-medium">{formatCurrency(paymentAmount)}</span>
              </div>
              {depositToCollectAmount > 0 && (
                <div className="flex justify-between">
                  <span>Security Deposit:</span>
                  <span className="font-medium">{formatCurrency(depositToCollectAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-green-300 pt-1 font-semibold">
                <span>Total Amount:</span>
                <span>{formatCurrency(calculateTotalAmount())}</span>
              </div>
              <div className="flex justify-between text-xs text-green-700">
                <span>Intervals Covered:</span>
                <span>{calculateIntervalsCovered()} period{calculateIntervalsCovered() !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isSubmittingPayment}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={paymentAmount <= 0 || isSubmittingPayment}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmittingPayment ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              'Collect Payment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};