import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign } from 'lucide-react';
import { Lease, Asset, Tenant } from '../../types';
import { 
  convertMinutesToValueAndUnit, 
  convertDurationToMinutes, 
  formatMinutesToDuration, 
  formatCurrency, 
  formatDateTime,
  calculateLeaseEndDate,
  generatePaymentIntervals
} from '../../utils/dateUtils';

interface LeaseFormProps {
  isOpen: boolean;
  editingLease: Lease | null;
  assets: Asset[];
  tenants: Tenant[];
  onSubmit: (leaseData: Omit<Lease, 'id' | 'createdAt'>) => Promise<void>;
  onClose: () => void;
}

const timeUnits = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
];

export const LeaseForm: React.FC<LeaseFormProps> = ({
  isOpen,
  editingLease,
  assets,
  tenants,
  onSubmit,
  onClose,
}) => {
  const defaultChargePeriod = convertMinutesToValueAndUnit(43800); // ~1 month
  const [formData, setFormData] = useState({
    asset_id: '',
    tenant_id: '',
    start_date: '',
    end_date: '',
    rent_amount: 0,
    deposit: 0,
    lease_type: 'fixed_term' as 'fixed_term' | 'month_to_month',
    chargePeriodValue: defaultChargePeriod.value,
    chargePeriodUnit: defaultChargePeriod.unit,
    frequency: 1,
    deposit_collected: false,
    deposit_collected_amount: 0,
    notes: ''
  });

  // State for calculated values
  const [calculatedEndDate, setCalculatedEndDate] = useState('');
  const [calculatedIntervals, setCalculatedIntervals] = useState<{ start: string; end: string }[]>([]);

  // Calculate end date and intervals when form data changes
  useEffect(() => {
    if (formData.start_date && formData.chargePeriodValue > 0 && formData.frequency > 0) {
      try {
        // Calculate end date
        const endDate = calculateLeaseEndDate(
          formData.start_date,
          formData.chargePeriodValue,
          formData.chargePeriodUnit,
          formData.frequency
        );
        
        // Update form data with calculated end date
        setFormData(prev => ({ ...prev, end_date: endDate }));
        
        // Format for datetime-local input (YYYY-MM-DDTHH:mm)
        setCalculatedEndDate(new Date(endDate).toISOString().slice(0, 16));
        
        // Generate payment intervals
        const intervals = generatePaymentIntervals(
          formData.start_date,
          formData.chargePeriodValue,
          formData.chargePeriodUnit,
          formData.frequency
        );
        setCalculatedIntervals(intervals);
      } catch (error) {
        console.error('Error calculating lease dates:', error);
        setCalculatedEndDate('');
        setCalculatedIntervals([]);
      }
    } else {
      setCalculatedEndDate('');
      setCalculatedIntervals([]);
    }
  }, [formData.start_date, formData.chargePeriodValue, formData.chargePeriodUnit, formData.frequency]);

  // Reset form when editing lease changes
  useEffect(() => {
    if (editingLease) {
      const { value, unit } = convertMinutesToValueAndUnit(editingLease.chargePeriodMinutes);
      setFormData({
        asset_id: editingLease.assetId,
        tenant_id: editingLease.tenantId,
        start_date: new Date(editingLease.startDate).toISOString().slice(0, 16),
        end_date: editingLease.endDate,
        rent_amount: editingLease.rentAmount,
        deposit: editingLease.deposit,
        lease_type: editingLease.leaseType,
        chargePeriodValue: value,
        chargePeriodUnit: unit,
        frequency: editingLease.frequency,
        deposit_collected: editingLease.depositCollectedAmount ? editingLease.depositCollectedAmount > 0 : false,
        deposit_collected_amount: editingLease.depositCollectedAmount || 0,
        notes: editingLease.notes || ''
      });
      setCalculatedEndDate(new Date(editingLease.endDate).toISOString().slice(0, 16));
    } else {
      const defaultChargePeriod = convertMinutesToValueAndUnit(43800);
      setFormData({
        asset_id: '',
        tenant_id: '',
        start_date: '',
        end_date: '',
        rent_amount: 0,
        deposit: 0,
        lease_type: 'fixed_term',
        chargePeriodValue: defaultChargePeriod.value,
        chargePeriodUnit: defaultChargePeriod.unit,
        frequency: 1,
        deposit_collected: false,
        deposit_collected_amount: 0,
        notes: ''
      });
      setCalculatedEndDate('');
      setCalculatedIntervals([]);
    }
  }, [editingLease]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.asset_id) {
      alert('Please select an asset');
      return;
    }

    if (!formData.tenant_id) {
      alert('Please select a tenant');
      return;
    }

    if (!formData.start_date) {
      alert('Please select a start date');
      return;
    }

    if (!formData.rent_amount || formData.rent_amount <= 0) {
      alert('Please enter a valid rent amount');
      return;
    }

    const depositAmount = formData.deposit || 0;
    if (depositAmount < 0) {
      alert('Please enter a valid deposit amount');
      return;
    }

    const depositCollectedAmount = formData.deposit_collected 
      ? Math.max(0, formData.deposit_collected_amount || 0)
      : 0;

    try {
      const chargePeriodMinutes = convertDurationToMinutes(formData.chargePeriodValue, formData.chargePeriodUnit);
      
      const leaseData = {
        assetId: formData.asset_id,
        tenantId: formData.tenant_id,
        startDate: formData.start_date,
        endDate: formData.end_date,
        rentAmount: formData.rent_amount,
        deposit: depositAmount,
        leaseType: formData.lease_type,
        chargePeriodMinutes: chargePeriodMinutes,
        frequency: formData.frequency,
        status: 'active' as const,
        depositCollectedAmount: depositCollectedAmount,
        notes: formData.notes || undefined
      };

      await onSubmit(leaseData);
      onClose();
    } catch (error) {
      console.error('Error saving lease:', error);
      alert(`Failed to save lease: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingLease ? 'Edit Lease' : 'Add New Lease'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset
              </label>
              <select
                value={formData.asset_id}
                onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Asset</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id} disabled={asset.status !== 'vacant'}>
                    {asset.status !== 'vacant' ? '🔒 ' : ''}{asset.name} - {asset.address}
                  </option>
                ))}
                {/* Show only vacant assets for new leases */}
                {!editingLease && assets.filter(asset => asset.status === 'vacant').length === 0 && (
                  <option value="" disabled>No vacant assets available</option>
                )}
              </select>
              {!editingLease && assets.filter(asset => asset.status === 'vacant').length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  All assets are currently occupied. You need vacant assets to create new leases.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenant
              </label>
              <select
                required
                value={formData.tenant_id}
                onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Tenant</option>
                {tenants.filter(tenant => tenant.status === 'active').map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenant
              </label>
              <select
                value={formData.tenant_id}
                onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Tenant</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
                {tenants.filter(tenant => tenant.status === 'active').length === 0 && (
                  <option value="" disabled>No active tenants available</option>
                )}
              </select>
              {tenants.filter(tenant => tenant.status === 'active').length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  You need active tenants to create leases. Add tenants first.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rent Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.rent_amount}
                onChange={(e) => setFormData({ ...formData, rent_amount: Math.max(0, Number(e.target.value) || 0) })}
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
                onChange={(e) => setFormData({ ...formData, deposit: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lease Type
              </label>
              <select
                value={formData.lease_type}
                onChange={(e) => setFormData({ ...formData, lease_type: e.target.value as 'fixed_term' | 'month_to_month' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="fixed_term">Fixed Term</option>
                <option value="month_to_month">Month to Month</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Periods
              </label>
              <input
                type="number"
                min="1"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Charge Period Section */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-3">Charge Period Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  Period Duration
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={formData.chargePeriodValue}
                  onChange={(e) => setFormData({ ...formData, chargePeriodValue: parseFloat(e.target.value) })}
                  className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  Period Unit
                </label>
                <select
                  value={formData.chargePeriodUnit}
                  onChange={(e) => setFormData({ ...formData, chargePeriodUnit: e.target.value })}
                  className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {timeUnits.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3 text-sm text-blue-700">
              <strong>Preview:</strong> Each period is {formatMinutesToDuration(convertDurationToMinutes(formData.chargePeriodValue, formData.chargePeriodUnit))}
            </div>
          </div>

          {/* Payment Intervals Preview */}
          {calculatedIntervals.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-900 mb-3">Payment Intervals Preview</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {calculatedIntervals.map((interval, index) => (
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
                      {formData.rent_amount ? formatCurrency(parseFloat(formData.rent_amount)) : '—'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-green-700">
                <strong>Total:</strong> {calculatedIntervals.length} payment periods
                {formData.rent_amount > 0 && (
                  <span className="ml-2">
                    <strong>Total Amount:</strong> {formatCurrency(formData.rent_amount * calculatedIntervals.length)}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="deposit_collected"
              checked={formData.deposit_collected}
              onChange={(e) => setFormData({ ...formData, deposit_collected: e.target.checked })}
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
                onChange={(e) => setFormData({ ...formData, deposit_collected_amount: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingLease ? 'Update' : 'Create'} Lease
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};