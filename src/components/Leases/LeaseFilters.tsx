import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Lease } from '../../types';

interface LeaseFiltersProps {
  searchTerm: string;
  statusFilter: 'all' | Lease['status'];
  leaseTypeFilter: 'all' | Lease['leaseType'];
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: 'all' | Lease['status']) => void;
  setLeaseTypeFilter: (type: 'all' | Lease['leaseType']) => void;
  hasActiveFilters: boolean;
  totalCount: number;
  filteredCount: number;
  clearFilters: () => void;
}

export const LeaseFilters: React.FC<LeaseFiltersProps> = ({
  searchTerm,
  statusFilter,
  leaseTypeFilter,
  setSearchTerm,
  setStatusFilter,
  setLeaseTypeFilter,
  hasActiveFilters,
  totalCount,
  filteredCount,
  clearFilters,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by tenant, asset, address, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>

          {/* Lease Type Filter */}
          <div className="flex items-center gap-2">
            <select
              value={leaseTypeFilter}
              onChange={(e) => setLeaseTypeFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="fixed_term">Fixed Term</option>
              <option value="month_to_month">Month to Month</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear all filters"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredCount} of {totalCount} lease{totalCount !== 1 ? 's' : ''}
            {filteredCount !== totalCount && (
              <span className="ml-2 text-blue-600 font-medium">
                ({totalCount - filteredCount} filtered out)
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};