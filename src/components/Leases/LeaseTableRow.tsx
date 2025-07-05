import React from 'react';
import { Building, User, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { Lease, Asset, Tenant } from '../../types';
import { formatCurrency } from '../../utils/dateUtils';

interface LeaseTableRowProps {
  lease: Lease;
  asset?: Asset;
  tenant?: Tenant;
  onViewDetails: (lease: Lease) => void;
  onEdit: (lease: Lease) => void;
  onTerminate: (lease: Lease) => void;
  onMarkExpired: (lease: Lease) => void;
  onDelete: (lease: Lease) => void;
}

export const LeaseTableRow: React.FC<LeaseTableRowProps> = ({
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
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="flex items-center">
            <Building className="h-4 w-4 text-gray-400 mr-2" />
            <div className="text-sm font-medium text-gray-900">
              {asset?.name || 'Unknown Asset'}
            </div>
          </div>
          <div className="flex items-center mt-1">
            <User className="h-4 w-4 text-gray-400 mr-2" />
            <div className="text-sm text-gray-500">
              {tenant?.name || 'Unknown Tenant'}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
        </div>
        <div className="text-sm text-gray-500 capitalize">
          {lease.leaseType.replace('_', ' ')}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {formatCurrency(lease.rentAmount)}/period
        </div>
        <div className="text-sm text-gray-500">
          Deposit: {formatCurrency(lease.deposit)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getStatusIcon(lease.status)}
          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lease.status)}`}>
            {lease.status}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        <button
          onClick={() => onViewDetails(lease)}
          className="text-blue-600 hover:text-blue-900"
        >
          View
        </button>
        <button
          onClick={() => onEdit(lease)}
          className="text-indigo-600 hover:text-indigo-900"
        >
          Edit
        </button>
        {lease.status === 'active' && (
          <>
            <button
              onClick={() => onTerminate(lease)}
              className="text-red-600 hover:text-red-900"
            >
              Terminate
            </button>
            <button
              onClick={() => onMarkExpired(lease)}
              className="text-yellow-600 hover:text-yellow-900"
            >
              Mark Expired
            </button>
          </>
        )}
        <button
          onClick={() => onDelete(lease)}
          className="text-red-600 hover:text-red-900"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};