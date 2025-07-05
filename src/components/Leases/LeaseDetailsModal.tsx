import React from 'react';
import { X, CheckCircle, Clock, AlertTriangle, User, Building2, Calendar, DollarSign } from 'lucide-react';
import { Lease, Asset, Tenant, LeaseCollectionData } from '../../types';
import { formatCurrency, formatDateTime, formatMinutesToDuration } from '../../utils/dateUtils';

interface LeaseDetailsModalProps {
  isOpen: boolean;
  lease: Lease | null;
  asset: Asset | null;
  tenant: Tenant | null;
  collectionData: LeaseCollectionData | null;
  onClose: () => void;
}

export const LeaseDetailsModal: React.FC<LeaseDetailsModalProps> = ({
  isOpen,
  lease,
  asset,
  tenant,
  collectionData,
  onClose,
}) => {
  if (!isOpen || !lease || !asset || !tenant) return null;

  const paidIntervals = collectionData?.intervals.filter(interval => interval.isPaid) || [];
  const incurredIntervals = collectionData?.intervals.filter(interval => interval.isIncurred) || [];
  const unpaidIncurredIntervals = collectionData?.intervals.filter(interval => interval.isIncurred && !interval.isPaid) || [];
  const pendingIntervals = collectionData?.intervals.filter(interval => !interval.isIncurred) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Lease Details</h2>
                <p className="text-sm text-gray-600">Complete lease information and payment intervals</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Lease Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tenant Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-blue-900">Tenant Information</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Name:</span>
                  <p className="text-blue-900">{tenant.name}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Email:</span>
                  <p className="text-blue-900">{tenant.email}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Phone:</span>
                  <p className="text-blue-900">{tenant.phone}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Status:</span>
                  <p className="text-blue-900 capitalize">{tenant.status}</p>
                </div>
              </div>
            </div>

            {/* Asset Information */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Building2 className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-green-900">Asset Information</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-green-700 font-medium">Name:</span>
                  <p className="text-green-900">{asset.name}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Address:</span>
                  <p className="text-green-900">{asset.address}</p>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Status:</span>
                  <p className="text-green-900 capitalize">{asset.status}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lease Terms */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <DollarSign className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Lease Terms</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                <span className="text-gray-500">Charge Period:</span>
                <p className="font-medium">{formatMinutesToDuration(lease.chargePeriodMinutes)}</p>
              </div>
              <div>
                <span className="text-gray-500">Frequency:</span>
                <p className="font-medium">{lease.frequency} period{lease.frequency !== 1 ? 's' : ''}</p>
              </div>
              <div>
                <span className="text-gray-500">Deposit:</span>
                <p className="font-medium">{formatCurrency(lease.deposit)}</p>
              </div>
              <div>
                <span className="text-gray-500">Deposit Collected:</span>
                <p className="font-medium">{formatCurrency(lease.depositCollectedAmount || 0)}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <p className="font-medium capitalize">{lease.status}</p>
              </div>
            </div>
            {lease.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="text-gray-500 text-sm">Notes:</span>
                <p className="text-gray-900 text-sm mt-1">{lease.notes}</p>
              </div>
            )}
          </div>

          {/* Payment Summary */}
          {collectionData && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-1" />
                    <span className="font-medium text-green-800">Paid</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{paidIntervals.length}</p>
                  <p className="text-xs text-green-700">{formatCurrency(paidIntervals.reduce((sum, interval) => sum + interval.amount, 0))}</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-1" />
                    <span className="font-medium text-red-800">Overdue</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{unpaidIncurredIntervals.length}</p>
                  <p className="text-xs text-red-700">{formatCurrency(unpaidIncurredIntervals.reduce((sum, interval) => sum + interval.amount, 0))}</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-amber-600 mr-1" />
                    <span className="font-medium text-amber-800">Incurred</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{incurredIntervals.length}</p>
                  <p className="text-xs text-amber-700">{formatCurrency(incurredIntervals.reduce((sum, interval) => sum + interval.amount, 0))}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-gray-600 mr-1" />
                    <span className="font-medium text-gray-800">Pending</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-600">{pendingIntervals.length}</p>
                  <p className="text-xs text-gray-700">{formatCurrency(pendingIntervals.reduce((sum, interval) => sum + interval.amount, 0))}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm pt-4 border-t border-gray-200">
                <div>
                  <span className="text-gray-500">Total Payments:</span>
                  <p className="font-medium">{formatCurrency(collectionData.totalPayments)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Periods Paid:</span>
                  <p className="font-medium">{collectionData.totalPeriodsPaid.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Amount to Collect:</span>
                  <p className="font-medium text-red-600">{formatCurrency(collectionData.amountToCollect)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Intervals Detail */}
          {collectionData && collectionData.intervals.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Intervals</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {collectionData.intervals.map((interval) => (
                  <div
                    key={interval.periodNumber}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                      interval.isPaid 
                        ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                        : interval.isIncurred 
                        ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <div className="mr-4">
                        {interval.isPaid ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : interval.isIncurred ? (
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        ) : (
                          <Clock className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900">
                            Period {interval.periodNumber}
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            interval.isPaid 
                              ? 'bg-green-100 text-green-800' 
                              : interval.isIncurred 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {interval.isPaid ? 'Paid' : interval.isIncurred ? 'Overdue' : 'Pending'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Start:</span> {formatDateTime(interval.startDate)}
                          </div>
                          <div>
                            <span className="font-medium">End:</span> {formatDateTime(interval.endDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(interval.amount)}
                      </p>
                      {interval.isIncurred && !interval.isPaid && (
                        <p className="text-xs text-red-600 font-medium">
                          Action Required
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};