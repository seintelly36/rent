import React from 'react';
import { User } from 'lucide-react';

interface TenantEmptyStateProps {
  onAddTenant: () => void;
}

export const TenantEmptyState: React.FC<TenantEmptyStateProps> = ({
  onAddTenant,
}) => {
  return (
    <div className="text-center py-12">
      <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No tenants yet</h3>
      <p className="text-gray-500 mb-4">Add tenant contact information and social profiles to your database</p>
      <button
        onClick={onAddTenant}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Add Your First Tenant
      </button>
    </div>
  );
};