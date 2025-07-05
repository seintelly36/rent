import React from 'react';
import { Plus } from 'lucide-react';

interface TenantHeaderProps {
  onAddTenant: () => void;
}

export const TenantHeader: React.FC<TenantHeaderProps> = ({
  onAddTenant,
}) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
        <p className="text-gray-600 mt-1">Manage tenant contact information and social profiles</p>
      </div>
      <button
        onClick={onAddTenant}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Tenant
      </button>
    </div>
  );
};