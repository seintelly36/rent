import React from 'react';
import { formatCurrency } from '../../../utils/dateUtils';

interface LeaseFinancialsProps {
  formData: {
    rent_amount: number;
    deposit: number;
    deposit_collected: boolean;
    deposit_collected_amount: number;
  };
  onFormDataChange: (data: Partial<LeaseFinancialsProps['formData']>) => void;
}

export const LeaseFinancials: React.FC<LeaseFinancialsProps> = ({
  formData,
  onFormDataChange,
}) => {
  const handleNumberInput = (field: keyof Pick<LeaseFinancialsProps['formData'], 'rent_amount' | 'deposit' | 'deposit_collected_amount'>, value: string) => {
    if (value === '') {
      onFormDataChange({ [field]: 0 });
      return;
    }
    
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      onFormDataChange({ [field]: 0 });
      return;
    }
    
    let preciseValue = Math.max(0, numericValue);
    
    // Special handling for deposit collected amount
    if (field === 'deposit_collected_amount') {
      preciseValue = Math.min(preciseValue, formData.deposit);
    }
    
    onFormDataChange({ [field]: preciseValue });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rent Amount
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.rent_amount}
            onChange={(e) => handleNumberInput('rent_amount', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Security Deposit
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.deposit}
            onChange={(e) => handleNumberInput('deposit', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="deposit_collected"
          checked={formData.deposit_collected}
          onChange={(e) => onFormDataChange({ deposit_collected: e.target.checked })}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="deposit_collected" className="text-sm font-medium text-gray-700">
          Deposit Collected
        </label>
      </div>

      {formData.deposit_collected && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deposit Collected Amount
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.deposit_collected_amount}
            onChange={(e) => handleNumberInput('deposit_collected_amount', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum: {formatCurrency(formData.deposit)}
          </p>
        </div>
      )}
    </div>
  );
};