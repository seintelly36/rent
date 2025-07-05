import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Lease, Asset, Tenant } from '../../types';
import { 
  convertMinutesToValueAndUnit, 
  convertDurationToMinutes, 
  calculateLeaseEndDate,
  generatePaymentIntervals
} from '../../utils/dateUtils';
import {
  LeaseBasicInfo,
  LeaseDates,
  LeaseFinancials,
  LeaseChargePeriod,
  LeaseIntervalPreview,
  LeaseNotes
} from './LeaseFormComponents';

interface LeaseFormProps {
  isOpen: boolean;
  editingLease: Lease | null;
  assets: Asset[];
  tenants: Tenant[];
  adjustLeasePeriods?: (leaseId: string, periodNumber: number, adjustmentType: 'refund' | 'cancel') => Promise<any>;
  onSubmit: (leaseData: Omit<Lease, 'id' | 'createdAt'>) => Promise<void>;
  onClose: () => void;
}

export const LeaseForm: React.FC<LeaseFormProps> = ({
  isOpen,
  editingLease,
  assets,
  tenants,
  adjustLeasePeriods,
  onSubmit,
  onClose,
}) => {
  const defaultChargePeriod = convertMinutesToValueAndUnit(43800); // ~1 month
  const [formData, setFormData] = useState({
    asset_id: '',
    tenant_id: '',
    start_date: '',
    end_date: '',
    rent_amount: 0 as number,
    deposit: 0 as number,
    lease_type: 'fixed_term' as 'fixed_term' | 'month_to_month',
    chargePeriodValue: defaultChargePeriod.value,
    chargePeriodUnit: defaultChargePeriod.unit,
    frequency: 1,
    deposit_collected: false,
    deposit_collected_amount: 0 as number,
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

  const handleFormDataChange = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

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

    if (formData.rent_amount <= 0) {
      alert('Please enter a valid rent amount');
      return;
    }

    const depositAmount = formData.deposit;
    if (depositAmount < 0) {
      alert('Please enter a valid deposit amount');
      return;
    }

    const depositCollectedAmount = formData.deposit_collected 
      ? Math.max(0, formData.deposit_collected_amount)
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
          {/* Basic Information */}
          <LeaseBasicInfo
            formData={formData}
            assets={assets}
            tenants={tenants}
            editingLease={editingLease}
            onFormDataChange={handleFormDataChange}
          />

          {/* Dates */}
          <LeaseDates
            formData={formData}
            calculatedEndDate={calculatedEndDate}
            onFormDataChange={handleFormDataChange}
          />

          {/* Financial Information */}
          <LeaseFinancials
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />

          {/* Charge Period Configuration */}
          <LeaseChargePeriod
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />

          {/* Payment Intervals Preview */}
          <LeaseIntervalPreview
            intervals={calculatedIntervals}
            rentAmount={formData.rent_amount}
          />

          {/* Notes */}
          <LeaseNotes
            notes={formData.notes}
            onNotesChange={(notes) => handleFormDataChange({ notes })}
          />
          
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