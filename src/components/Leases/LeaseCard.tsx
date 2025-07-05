import React from 'react';
import { FileText, Building, User, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { Lease, Asset, Tenant } from '../../types';
import { formatCurrency, formatMinutesToDuration } from '../../utils/dateUtils';

interface LeaseCardProps {
  lease: Lease;
  asset?: Asset;
  tenant?: Tenant;
  onViewDetails: (lease: Lease) => void;
  onEdit: (lease: Lease) => void;
  onTerminate: (lease: Lease) => void;
  onMarkExpired: (lease: Lease) => void;
  onDelete: (lease: Lease) => void;
}

export const LeaseCard: React.FC<LeaseCardProps> = ({
  lease,
  asset,
  tenant,
  onViewDetails,
  onEdit,
  onTerminate,
  onMarkExpired,
  onDelete,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'terminated':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lease.status)}`}>
              {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
            </span>
          </div>
          {getStatusIcon(lease.status)}
        </div>

        {/* Asset and Tenant Info */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center">
            <Building className="h-4 w-4 text-gray-400 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-900">{asset?.name}</p>
              <p className="text-xs text-gray-500">{asset?.address}</p>
            </div>
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 text-gray-400 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-900">{tenant?.name}</p>
              <p className="text-xs text-gray-500">{tenant?.email}</p>
            </div>
          </div>
        </div>

        {/* Lease Details */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Period:</span>
            <span className="font-medium">{new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Rent:</span>
            <span className="font-medium">{formatCurrency(lease.rentAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Deposit:</span>
            <span className="font-medium">{formatCurrency(lease.deposit)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Type:</span>
            <span className="font-medium capitalize">{lease.leaseType.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Charge Period:</span>
            <span className="font-medium">{formatMinutesToDuration(lease.chargePeriodMinutes)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => onViewDetails(lease)}
            className="flex-1 px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() => onEdit(lease)}
            className="flex-1 px-3 py-2 text-xs bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Edit
          </button>
          {lease.status === 'active' && (
            <>
              <button
                onClick={() => onTerminate(lease)}
                className="flex-1 px-3 py-2 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                Terminate
              </button>
              <button
                onClick={() => onMarkExpired(lease)}
                className="flex-1 px-3 py-2 text-xs bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                Mark Expired
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(lease)}
            className="px-3 py-2 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};