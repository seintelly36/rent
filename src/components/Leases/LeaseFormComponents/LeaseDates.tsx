import React from 'react';

interface LeaseDatesProps {
  formData: {
    start_date: string;
    end_date: string;
  };
  calculatedEndDate: string;
  onFormDataChange: (data: Partial<LeaseDatesProps['formData']>) => void;
}

export const LeaseDates: React.FC<LeaseDatesProps> = ({
  formData,
  calculatedEndDate,
  onFormDataChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Start Date & Time
        </label>
        <input
          type="datetime-local"
          value={formData.start_date}
          onChange={(e) => onFormDataChange({ start_date: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          End Date & Time (Calculated)
        </label>
        <input
          type="datetime-local"
          value={calculatedEndDate}
          readOnly
          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-600"
        />
        <p className="text-xs text-gray-500 mt-1">
          Automatically calculated based on start date, charge period, and frequency
        </p>
      </div>
    </div>
  );
};