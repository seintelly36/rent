import React from 'react';
import { Building2, MapPin, User, Edit, Trash2, Tag } from 'lucide-react';
import { Asset, Tenant, AssetType, AssetDetail } from '../../types';

interface AssetCardProps {
  asset: Asset;
  tenant?: Tenant;
  assetType?: AssetType;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  tenant,
  assetType,
  onEdit,
  onDelete,
}) => {
  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'occupied':
        return 'bg-green-100 text-green-800';
      case 'vacant':
        return 'bg-amber-100 text-amber-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDetailValue = (detail: AssetDetail) => {
    if (typeof detail.value === 'boolean') {
      return detail.value ? 'Yes' : 'No';
    }
    if (typeof detail.value === 'number' && detail.name.toLowerCase().includes('footage')) {
      return `${detail.value} sq ft`;
    }
    return detail.value.toString();
  };

  const formatAssetStatus = (status: Asset['status'] | undefined) => {
    if (!status) {
      return 'Unknown';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <Building2 className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(asset)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(asset.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{asset.address}</span>
        </div>

        {assetType && (
          <div className="flex items-center text-gray-600 mb-3">
            <Tag className="h-4 w-4 mr-1" />
            <span className="text-sm">{assetType.name}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
            {formatAssetStatus(asset.status)}
          </span>
        </div>
        
        {/* Asset Details */}
        {asset.details.length > 0 && (
          <div className="space-y-1 mb-4">
            {asset.details.slice(0, 3).map((detail, index) => (
              <div key={index} className="flex items-center justify-between text-sm text-gray-500">
                <span>{detail.name}:</span>
                <span>{renderDetailValue(detail)}</span>
              </div>
            ))}
            {asset.details.length > 3 && (
              <div className="text-xs text-gray-400">
                +{asset.details.length - 3} more details
              </div>
            )}
          </div>
        )}
        
        {tenant && (
          <div className="flex items-center text-sm text-gray-600 pt-3 border-t border-gray-100">
            <User className="h-4 w-4 mr-2" />
            <span>Tenant: {tenant.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};