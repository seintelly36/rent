import React from 'react';
import { X, AlertTriangle, CheckCircle, Clock, Calendar } from 'lucide-react';
import { Lease, Asset, Tenant, LeaseCollectionData } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/dateUtils';

interface LeaseActionConfirmationModalProps {
  isOpen: boolean;
  action: 'terminate' | 'expire' | null;
  lease: Lease | null;
  asset: Asset | null;
  tenant: Tenant | null;
  collectionData: LeaseCollectionData | null;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export const LeaseActionConfirmationModal: React.FC<LeaseActionConfirmationModalProps> = ({
  isOpen,
  action,
  lease,
  asset,
  tenant,
  collectionData,
  onClose,
  onConfirm,
  isProcessing,
}) => {
  if (!isOpen || !action || !lease || !asset || !tenant) return null;

  const actionText = action === 'terminate' ? 'Terminate' : 'Mark as Expired';
  const actionColor = action === 'terminate' ? 'red' : 'amber';
  const actionIcon = action === 'terminate' ? X : Calendar;

  const paidIntervals = collectionData?.intervals.filter(interval => interval.isPaid) || [];
  const incurredIntervals = collectionData?.intervals.filter(interval => interval.isIncurred) || [];
  const unpaidIncurredIntervals = collectionData?.intervals.filter(interval => interval.isIncurred && !interval.isPaid) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-2 bg-${actionColor}-100 rounded-lg mr-3`}>
                {React.createElement(actionIcon, { className: `h-6 w-6 text-${actionColor}-600` })}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{actionText} Lease</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isProcessing}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Action Description */}
          <div className={`p-4 bg-${actionColor}-50 border border-${actionColor}-200 rounded-lg`}>
            <div className="flex items-start">
              <AlertTriangle className={`h-5 w-5 text-${actionColor}-600 mr-2 mt-0.5`} />
              <div className={`text-sm text-${actionColor}-800`}>
                <p className="font-medium">
                  {action === 'terminate' 
                    ? 'This will terminate the lease and make the asset available'
                    : 'This will mark the lease as expired and make the asset available'
                  }
                </p>
                <p>
                  The asset status will be updated to "vacant" and the tenant association will be removed.
                </p>
              </div>
            </div>
          </div>

          {/* Lease Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Lease Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Tenant:</span>
                <p className="font-medium">{tenant.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Asset:</span>
                <p className="font-medium">{asset.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Start Date:</span>
                <p className="font-medium">{formatDateTime(lease.startDate)}</p>
              </div>
              <div>
                <span className="text-gray-500">End Date:</span>
                <p className="font-medium">{formatDateTime(lease.endDate)}</p>
              </div>
              <div>
                <span className="text-gray-500">Rent Amount:</span>
                <p className="font-medium">{formatCurrency(lease.rentAmount)}</p>
              </div>
              <div>
                <span className="text-gray-500">Current Status:</span>
                <p className="font-medium capitalize">{lease.status}</p>
              </div>
            </div>
          </div>

          {/* Payment Period Summary */}
          {collectionData && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Period Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-1" />
                    <span className="font-medium text-green-800">Paid Periods</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{paidIntervals.length}</p>
                  <p className="text-xs text-green-700">{formatCurrency(paidIntervals.reduce((sum, interval) => sum + interval.amount, 0))}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-amber-600 mr-1" />
                    <span className="font-medium text-amber-800">Incurred Periods</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{incurredIntervals.length}</p>
                  <p className="text-xs text-amber-700">{formatCurrency(incurredIntervals.reduce((sum, interval) => sum + interval.amount, 0))}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-1" />
                    <span className="font-medium text-red-800">Unpaid Incurred</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{unpaidIncurredIntervals.length}</p>
                  <p className="text-xs text-red-700">{formatCurrency(unpaidIncurredIntervals.reduce((sum, interval) => sum + interval.amount, 0))}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Intervals Detail */}
          {collectionData && collectionData.intervals.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Intervals Detail</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {collectionData.intervals.map((interval) => (
                  <div
                    key={interval.periodNumber}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      interval.isPaid 
                        ? 'bg-green-50 border-green-200' 
                        : interval.isIncurred 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <div className="mr-3">
                        {interval.isPaid ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : interval.isIncurred ? (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Period {interval.periodNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDateTime(interval.startDate)} → {formatDateTime(interval.endDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(interval.amount)}
                      </p>
                      <p className={`text-sm font-medium ${
                        interval.isPaid 
                          ? 'text-green-600' 
                          : interval.isIncurred 
                          ? 'text-red-600' 
                          : 'text-gray-500'
                      }`}>
                        {interval.isPaid ? 'Paid' : interval.isIncurred ? 'Overdue' : 'Pending'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outstanding Balance Warning */}
          {unpaidIncurredIntervals.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Outstanding Balance</p>
                  <p>
                    There are {unpaidIncurredIntervals.length} unpaid period(s) totaling {formatCurrency(unpaidIncurredIntervals.reduce((sum, interval) => sum + interval.amount, 0))}. 
                    Consider collecting these payments before {action === 'terminate' ? 'terminating' : 'marking as expired'}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 bg-${actionColor}-600 text-white rounded-lg hover:bg-${actionColor}-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                {React.createElement(actionIcon, { className: 'h-4 w-4 mr-2' })}
                {actionText} Lease
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};