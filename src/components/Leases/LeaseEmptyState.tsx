import React from 'react';
import { FileText } from 'lucide-react';

interface LeaseEmptyStateProps {
  hasFilters: boolean;
  onAddLease: () => void;
  onClearFilters: () => void;
}

export const LeaseEmptyState: React.FC<LeaseEmptyStateProps> = ({
  hasFilters,
  onAddLease,
  onClearFilters,
}) => {
  if (hasFilters) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No leases match your filters</h3>
        <p className="text-gray-500 mb-4">Try adjusting your search terms or filters</p>
        <button
          onClick={onClearFilters}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No leases yet</h3>
      <p className="text-gray-500 mb-4">Create lease agreements with automatic end dates and payment intervals</p>
      <button
        onClick={onAddLease}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Create Your First Lease
      </button>
    </div>
  );
};