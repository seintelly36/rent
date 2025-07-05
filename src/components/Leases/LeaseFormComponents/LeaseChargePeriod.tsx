import React from 'react';
import { formatMinutesToDuration, convertDurationToMinutes } from '../../../utils/dateUtils';

interface LeaseChargePeriodProps {
  formData: {
    chargePeriodValue: number;
    chargePeriodUnit: string;
    frequency: number;
  };
  onFormDataChange: (data: Partial<LeaseChargePeriodProps['formData']>) => void;
}

const timeUnits = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
];

export const LeaseChargePeriod: React.FC<LeaseChargePeriodProps> = ({
  formData,
  onFormDataChange,
}) => {
  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <h3 className="text-lg font-medium text-blue-900 mb-3">Charge Period Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-1">
            Period Duration
          </label>
          <input
            type="number"
            min="1"
            step="0.1"
            value={formData.chargePeriodValue}
            onChange={(e) => onFormDataChange({ chargePeriodValue: parseFloat(e.target.value) })}
            className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-1">
            Period Unit
          </label>
          <select
            value={formData.chargePeriodUnit}
            onChange={(e) => onFormDataChange({ chargePeriodUnit: e.target.value })}
            className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timeUnits.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-1">
            Total Periods
          </label>
          <input
            type="number"
            min="1"
            value={formData.frequency}
            onChange={(e) => onFormDataChange({ frequency: parseInt(e.target.value) })}
            className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="mt-3 text-sm text-blue-700">
        <strong>Preview:</strong> Each period is {formatMinutesToDuration(convertDurationToMinutes(formData.chargePeriodValue, formData.chargePeriodUnit))}
      </div>
    </div>
  );
};