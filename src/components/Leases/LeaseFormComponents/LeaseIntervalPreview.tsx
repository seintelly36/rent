import React from 'react';
import { Calendar } from 'lucide-react';
import { formatDateTime, formatCurrency } from '../../../utils/dateUtils';

interface LeaseIntervalPreviewProps {
  intervals: { start: string; end: string }[];
  rentAmount: number;
}

export const LeaseIntervalPreview: React.FC<LeaseIntervalPreviewProps> = ({
  intervals,
  rentAmount,
}) => {
  if (intervals.length === 0) return null;

  return (
    <div className="bg-green-50 rounded-lg p-4">
      <h3 className="text-lg font-medium text-green-900 mb-3">Payment Intervals Preview</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {intervals.map((interval, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-green-600 mr-2" />
              <span className="font-medium text-green-900">Period {index + 1}</span>
            </div>
            <div className="text-sm text-green-700">
              <span className="font-medium">Start:</span> {formatDateTime(interval.start)} 
              <span className="mx-2">→</span>
              <span className="font-medium">End:</span> {formatDateTime(interval.end)}
            </div>
            <div className="text-sm font-medium text-green-800">
              {rentAmount ? formatCurrency(rentAmount) : '—'}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-sm text-green-700">
        <strong>Total:</strong> {intervals.length} payment periods
        {rentAmount > 0 && (
          <span className="ml-2">
            <strong>Total Amount:</strong> {formatCurrency(rentAmount * intervals.length)}
          </span>
        )}
      </div>
    </div>
  );
};