import React from 'react';
import { LayoutGrid, Table } from 'lucide-react';

interface LeaseViewToggleProps {
  displayMode: 'card' | 'table';
  onToggle: (mode: 'card' | 'table') => void;
}

export const LeaseViewToggle: React.FC<LeaseViewToggleProps> = ({
  displayMode,
  onToggle,
}) => {
  return (
    <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
      <button
        onClick={() => onToggle('card')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          displayMode === 'card'
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
        Cards
      </button>
      <button
        onClick={() => onToggle('table')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          displayMode === 'table'
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Table className="h-4 w-4" />
        Table
      </button>
    </div>
  );
};