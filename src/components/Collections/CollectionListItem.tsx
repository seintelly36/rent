import React from 'react';
import { 
  User, 
  Building2, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  RotateCcw,
  X
} from 'lucide-react';
import { LeaseCollectionData } from '../../types';
import { formatCurrency, formatDateTime, formatMinutesToDuration } from '../../utils/dateUtils';

interface CollectionListItemProps {
  data: LeaseCollectionData;
  isExpanded: boolean;
  onToggleExpansion: (leaseId: string) => void;
  onCollectPaymentClick: (data: LeaseCollectionData) => void;
  onPeriodAdjustmentClick: (data: LeaseCollectionData, periodNumber: number) => void;
}

export const CollectionListItem: React.FC<CollectionListItemProps> = ({
  data,
  isExpanded,
  onToggleExpansion,
  onCollectPaymentClick,
  onPeriodAdjustmentClick,
}) => {
  const hasOverdue = data.intervals.some(interval => interval.isIncurred && !interval.isPaid);
  const remainingDeposit = data.lease.deposit - (data.lease.depositCollectedAmount || 0);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 ${
        hasOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
      }`}
    >
      <div 
        className="p-6 cursor-pointer"
        onClick={() => onToggleExpansion(data.lease.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">{data.tenant.name}</h3>
              </div>
              <div className="flex items-center">
                <Building2 className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-600">{data.asset.name}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Rent Amount:</span>
                <p className="font-medium">{formatCurrency(data.lease.rentAmount)}</p>
              </div>
              <div>
                <span className="text-gray-500">Charge Period:</span>
                <p className="font-medium">{formatMinutesToDuration(data.lease.chargePeriodMinutes)}</p>
              </div>
              <div>
                <span className="text-gray-500">Current Period:</span>
                <p className="font-medium">{data.currentPeriod} of {data.lease.frequency}</p>
              </div>
              <div>
                <span className="text-gray-500">Total Paid:</span>
                <p className="font-medium">{formatCurrency(data.totalPayments)}</p>
              </div>
            </div>
          </div>
          
          <div className="text-right ml-6">
            <div className="mb-2">
              <span className="text-sm text-gray-500">Amount to Collect:</span>
              <p className={`text-xl font-bold ${data.amountToCollect > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(data.amountToCollect)}
              </p>
            </div>
            {data.amountToCollect > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCollectPaymentClick(data);
                }}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Collect Payment
              </button>
            )}
            {hasOverdue && (
              <div className="flex items-center text-red-600 mt-2">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Overdue</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6">
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Lease Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Start Date:</span>
                <p className="font-medium">{formatDateTime(data.lease.startDate)}</p>
              </div>
              <div>
                <span className="text-gray-500">End Date:</span>
                <p className="font-medium">{formatDateTime(data.lease.endDate)}</p>
              </div>
              <div>
                <span className="text-gray-500">Frequency:</span>
                <p className="font-medium">{data.lease.frequency} periods</p>
              </div>
              <div>
                <span className="text-gray-500">Deposit:</span>
                <p className="font-medium">
                  {formatCurrency(data.lease.depositCollectedAmount || 0)} / {formatCurrency(data.lease.deposit)}
                  {remainingDeposit <= 0 && (
                    <span className="ml-2 text-green-600 text-xs">(Fully Collected)</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Collection Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Periods Paid:</span>
                <p className="font-medium">{data.totalPeriodsPaid.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-500">Periods to Collect:</span>
                <p className="font-medium">{data.periodsToCollect.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-500">Current Period:</span>
                <p className="font-medium">{data.currentPeriod}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <p className={`font-medium ${data.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                  {data.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Intervals</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {data.intervals.map((interval) => (
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
                  
                  <div className="flex items-center space-x-3">
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
                    
                    {/* Period Adjustment Buttons */}
                    {(interval.isPaid || !interval.isIncurred) && (
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPeriodAdjustmentClick(data, interval.periodNumber);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                          title={interval.isPaid ? "Refund this period" : "Cancel this period"}
                        >
                          {interval.isPaid ? (
                            <RotateCcw className="h-4 w-4" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};