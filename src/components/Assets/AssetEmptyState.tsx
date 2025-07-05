import React from 'react';
import { Building2 } from 'lucide-react';

interface AssetEmptyStateProps {
  onAddAsset: () => void;
}

export const AssetEmptyState: React.FC<AssetEmptyStateProps> = ({
  onAddAsset,
}) => {
  return (
    <div className="text-center py-12">
      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No assets yet</h3>
      <p className="text-gray-500 mb-4">Get started by adding your first asset</p>
      <button
        onClick={onAddAsset}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Add Your First Asset
      </button>
    </div>
  );
};