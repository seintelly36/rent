import React from 'react';
import { Asset, Tenant } from '../../../types';

interface LeaseBasicInfoProps {
  formData: {
    asset_id: string;
    tenant_id: string;
    lease_type: 'fixed_term' | 'month_to_month';
  };
  assets: Asset[];
  tenants: Tenant[];
  editingLease: any;
  onFormDataChange: (data: Partial<LeaseBasicInfoProps['formData']>) => void;
}

export const LeaseBasicInfo: React.FC<LeaseBasicInfoProps> = ({
  formData,
  assets,
  tenants,
  editingLease,
  onFormDataChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Asset
        </label>
        <select
          value={formData.asset_id}
          onChange={(e) => onFormDataChange({ asset_id: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Select Asset</option>
          {assets.filter(asset => {
            // For new leases, only show vacant assets
            // For editing, show the current asset plus vacant assets
            if (!editingLease) {
              return asset.status === 'vacant';
            } else {
              return asset.status === 'vacant' || asset.id === editingLease.assetId;
            }
          }).map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.name} - {asset.address}
            </option>
          ))}
        </select>
        {!editingLease && assets.filter(asset => asset.status === 'vacant').length === 0 && (
          <p className="text-xs text-amber-600 mt-1">
            All assets are currently occupied. You need vacant assets to create new leases.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tenant
        </label>
        <select
          value={formData.tenant_id}
          onChange={(e) => onFormDataChange({ tenant_id: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Select Tenant</option>
          {tenants.filter(tenant => tenant.status === 'active').map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
          {tenants.filter(tenant => tenant.status === 'active').length === 0 && (
            <option value="" disabled>No active tenants available</option>
          )}
        </select>
        {tenants.filter(tenant => tenant.status === 'active').length === 0 && (
          <p className="text-xs text-amber-600 mt-1">
            You need active tenants to create leases. Add tenants first.
          </p>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lease Type
        </label>
        <select
          value={formData.lease_type}
          onChange={(e) => onFormDataChange({ lease_type: e.target.value as 'fixed_term' | 'month_to_month' })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="fixed_term">Fixed Term</option>
          <option value="month_to_month">Month to Month</option>
        </select>
      </div>
    </div>
  );
};