import { useMemo, useState } from 'react';
import { Lease, Asset, Tenant } from '../types';

interface UseLeaseFiltersProps {
  leases: Lease[];
  assets: Asset[];
  tenants: Tenant[];
}

export const useLeaseFilters = ({ leases, assets, tenants }: UseLeaseFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Lease['status']>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | Lease['leaseType']>('all');

  const filteredLeases = useMemo(() => {
    if (!leases) return [];
    
    return leases.filter((lease) => {
      const asset = assets.find(a => a.id === lease.assetId);
      const tenant = tenants.find(t => t.id === lease.tenantId);
      
      const matchesSearch = !searchTerm || 
        tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset?.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lease.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lease.status === statusFilter;
      const matchesType = typeFilter === 'all' || lease.leaseType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leases, assets, tenants, searchTerm, statusFilter, typeFilter]);

  const hasActiveFilters = useMemo(() => {
    return searchTerm !== '' || statusFilter !== 'all' || typeFilter !== 'all';
  }, [searchTerm, statusFilter, typeFilter]);

  const totalCount = leases.length;
  const filteredCount = filteredLeases.length;

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  return {
    filteredLeases,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    hasActiveFilters,
    totalCount,
    filteredCount,
    clearFilters,
  };
};