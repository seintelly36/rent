import React from 'react';
import { Search, Filter } from 'lucide-react';

interface CollectionFiltersProps {
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'overdue';
  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: 'all' | 'active' | 'overdue') => void;
}

export const CollectionFilters: React.FC<CollectionFiltersProps> = ({
  searchTerm,
  statusFilter,
  setSearchTerm,
  setStatusFilter,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by tenant or asset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Collections</option>
            <option value="active">Active Collections</option>
            <option value="overdue">Overdue Only</option>
          </select>
        </div>
      </div>
    </div>
  );
};