import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { Lease, Asset, Tenant, LeaseCollectionData } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/dateUtils';

interface LeaseDeleteConfirmationModalProps {
  isOpen: boolean;
  lease: Lease | null;
  asset: Asset | null;
  tenant: Tenant | null;
  collectionData: LeaseCollectionData | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const LeaseDeleteConfirmationModal: React.FC<LeaseDeleteConfirmationModalProps> = ({
  isOpen,
  lease,
  asset,
  tenant,
  collectionData,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !lease || !asset || !tenant) return null;

  const hasPayments = collectionData && collectionData.totalPayments > 0;
  const hasIncurredPeriods = collectionData && collectionData.intervals.some(interval => interval.isIncurred);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Delete Lease</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isDeleting}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Warning */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">This action cannot be undone</p>
                <p>Deleting this lease will permanently remove all lease data and associated payment records.</p>
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
                <span className="text-gray-500">Status:</span>
                <p className="font-medium capitalize">{lease.status}</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          {collectionData && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Total Payments:</span>
                  <p className="font-medium">{formatCurrency(collectionData.totalPayments)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Periods Paid:</span>
                  <p className="font-medium">{collectionData.totalPeriodsPaid.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Current Period:</span>
                  <p className="font-medium">{collectionData.currentPeriod}</p>
                </div>
                <div>
                  <span className="text-gray-500">Amount to Collect:</span>
                  <p className="font-medium">{formatCurrency(collectionData.amountToCollect)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Warnings */}
          {hasPayments && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">This lease has payment records</p>
                  <p>Deleting this lease will also remove all associated payment transactions.</p>
                </div>
              </div>
            </div>
          )}

          {hasIncurredPeriods && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium">This lease has incurred periods</p>
                  <p>Some payment periods have already started. Consider terminating instead of deleting.</p>
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
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Lease
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};