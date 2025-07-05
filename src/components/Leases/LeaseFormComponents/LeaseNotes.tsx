import React from 'react';

interface LeaseNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const LeaseNotes: React.FC<LeaseNotesProps> = ({
  notes,
  onNotesChange,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Notes
      </label>
      <textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows={3}
        placeholder="Additional lease terms, conditions, or notes..."
      />
    </div>
  );
};