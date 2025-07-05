import React from 'react';
import { Tenant } from '../../types';
import { TenantCard } from './TenantCard';

interface TenantGridProps {
  tenants: Tenant[];
  onEdit: (tenant: Tenant) => void;
  onDelete: (id: string) => void;
}

export const TenantGrid: React.FC<TenantGridProps> = ({
  tenants,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tenants.map((tenant) => (
        <TenantCard
          key={tenant.id}
          tenant={tenant}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};