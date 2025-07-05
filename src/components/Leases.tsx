import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Calendar, DollarSign, User, Building, Clock, CheckCircle, XCircle, AlertCircle, LayoutGrid, Table } from 'lucide-react';
import { useLeases } from '../hooks/useLeases';
import { useAssets } from '../hooks/useAssets';
import { useTenants } from '../hooks/useTenants';
import { usePayments } from '../hooks/usePayments';
import { useAuth } from '../hooks/useAuth';
import { Lease, Asset, Tenant } from '../types';
import { LeaseDetailsModal } from './Leases/LeaseDetailsModal';
import { LeaseActionConfirmationModal } from './Leases/LeaseActionConfirmationModal';
import { LeaseDeleteConfirmationModal } from './Leases/LeaseDeleteConfirmationModal';
import { LeaseFilters } from './Leases/LeaseFilters';
import { useLeaseFilters } from '../hooks/useLeaseFilters';
import { useLeaseModals } from '../hooks/useLeaseModals';
import { 
  convertMinutesToValueAndUnit, 
  convertDurationToMinutes, 
  formatMinutesToDuration, 
  formatCurrency, 
  formatDateTime,
  calculateLeaseEndDate,
  generatePaymentIntervals
} from '../utils/dateUtils';

const timeUnits = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
];

export const Leases: React.FC = () => {
  const { user } = useAuth();
  const { leases, loading, addLease, updateLease, deleteLease } = useLeases(user?.id);
  const { assets } = useAssets(user?.id);
  const { tenants } = useTenants(user?.id);
  const { payments } = usePayments(user?.id);
  
  const [showForm, setShowForm] = useState(false);
  const [editingLease, setEditingLease] = useState<Lease | null>(null);
  const [displayMode, setDisplayMode] = useState<'card' | 'table'>('card');
  
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    filteredLeases,
    hasActiveFilters,
    totalCount,
    filteredCount,
    clearFilters
  } = useLeaseFilters({ leases, assets, tenants });

  const {
    // Delete modal
    showDeleteModal,
    leaseToDelete,
    deleteModalData,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,

    // Action modal
    showActionModal,
    actionType,
    leaseForAction,
    actionModalData,
    isProcessingAction,
    openActionModal,
    closeActionModal,
    confirmAction,

    // Details modal
    showDetailsModal,
    leaseForDetails,
    detailsModalData,
    openDetailsModal,
    closeDetailsModal,
  } = useLeaseModals({
    assets,
    tenants,
    payments,
    onDeleteLease: deleteLease,
    onUpdateLease: updateLease,
    onUpdateAsset: async () => {}, // Placeholder - assets are managed separately
  });

  const defaultChargePeriod = convertMinutesToValueAndUnit(43800); // ~1 month
  const [formData, setFormData] = useState({
    asset_id: '',
    tenant_id: '',
    start_date: '',
    end_date: '',
    rent_amount: '',
    deposit: '',
    lease_type: 'fixed_term' as 'fixed_term' | 'month_to_month',
    chargePeriodValue: defaultChargePeriod.value,
    chargePeriodUnit: defaultChargePeriod.unit,
    frequency: 1,
    deposit_collected: false,
    deposit_collected_amount: '',
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
  const resetForm = () => {
    const defaultChargePeriod = convertMinutesToValueAndUnit(43800);
    setFormData({
      asset_id: '',
      tenant_id: '',
      start_date: '',
      end_date: '',
      rent_amount: '',
      deposit: '',
      lease_type: 'fixed_term',
      chargePeriodValue: defaultChargePeriod.value,
      chargePeriodUnit: defaultChargePeriod.unit,
      frequency: 1,
      deposit_collected: false,
      deposit_collected_amount: '',
      notes: ''
    });
    setCalculatedEndDate('');
    setCalculatedIntervals([]);
    setEditingLease(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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

    if (!formData.rent_amount || parseFloat(formData.rent_amount) <= 0) {
      alert('Please enter a valid rent amount');
      return;
    }

    const depositAmount = parseFloat(formData.deposit) || 0;
    if (depositAmount < 0) {
      alert('Please enter a valid deposit amount');
      return;
    }

    const depositCollectedAmount = formData.deposit_collected 
      ? Math.max(0, parseFloat(formData.deposit_collected_amount) || 0)
      : 0;

    try {
      const chargePeriodMinutes = convertDurationToMinutes(formData.chargePeriodValue, formData.chargePeriodUnit);
      
      const leaseData = {
        assetId: formData.asset_id,
        tenantId: formData.tenant_id,
        startDate: formData.start_date,
        endDate: formData.end_date,
        rentAmount: parseFloat(formData.rent_amount),
        deposit: depositAmount,
        leaseType: formData.lease_type,
        chargePeriodMinutes: chargePeriodMinutes,
        frequency: formData.frequency,
        status: 'active',
        depositCollectedAmount: depositCollectedAmount,
        notes: formData.notes || undefined
      };

      if (editingLease) {
        await updateLease({ ...editingLease, ...leaseData });
      } else {
        await addLease(leaseData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving lease:', error);
      alert(`Failed to save lease: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEdit = (lease: Lease) => {
    const { value, unit } = convertMinutesToValueAndUnit(lease.chargePeriodMinutes);
    setEditingLease(lease);
    setFormData({
      asset_id: lease.assetId,
      tenant_id: lease.tenantId,
      start_date: new Date(lease.startDate).toISOString().slice(0, 16),
      end_date: lease.endDate,
      rent_amount: lease.rentAmount.toString(),
      deposit: lease.deposit.toString(),
      lease_type: lease.leaseType,
      chargePeriodValue: value,
      chargePeriodUnit: unit,
      frequency: lease.frequency,
      deposit_collected: lease.depositCollectedAmount ? lease.depositCollectedAmount > 0 : false,
      deposit_collected_amount: (lease.depositCollectedAmount || 0).toString(),
      notes: lease.notes || ''
    });
    setCalculatedEndDate(new Date(lease.endDate).toISOString().slice(0, 16));
    setShowForm(true);
  };

  const getAssetName = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? asset.name : 'Unknown Asset';
  };

  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? tenant.name : 'Unknown Tenant';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'terminated':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leases</h1>
          <p className="text-gray-600 mt-1">Manage lease agreements and terms</p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setDisplayMode('card')}
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
              onClick={() => setDisplayMode('table')}
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
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Lease
          </button>
        </div>
      </div>

      <LeaseFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        leaseTypeFilter={typeFilter}
        setLeaseTypeFilter={setTypeFilter}
        hasActiveFilters={hasActiveFilters}
        totalCount={totalCount}
        filteredCount={filteredCount}
        clearFilters={clearFilters}
      />

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingLease ? 'Edit Lease' : 'Add New Lease'}
              </h2>
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
                      <option key={asset.id} value={asset.id}>
                        {asset.name} - {asset.address}
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
                  </select>
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
                    onChange={(e) => setFormData({ ...formData, rent_amount: e.target.value })}
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
                    step="0.01"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
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
                    {formData.rent_amount && (
                      <span className="ml-2">
                        • <strong>Total Amount:</strong> {formatCurrency(parseFloat(formData.rent_amount) * calculatedIntervals.length)}
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
                    Deposit Amount Collected
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={formData.deposit}
                    value={formData.deposit_collected_amount}
                    onChange={(e) => setFormData({ ...formData, deposit_collected_amount: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum: {formData.deposit ? formatCurrency(parseFloat(formData.deposit)) : '$0.00'}
                  </p>
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
                  onClick={resetForm}
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
      )}

      {/* Conditional Rendering Based on Display Mode */}
      {displayMode === 'card' ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeases.map((lease) => {
            const asset = assets.find(a => a.id === lease.assetId);
            const tenant = tenants.find(t => t.id === lease.tenantId);
            
            return (
              <div
                key={lease.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-2" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lease.status)}`}>
                        {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                      </span>
                    </div>
                    {getStatusIcon(lease.status)}
                  </div>

                  {/* Asset and Tenant Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{asset?.name}</p>
                        <p className="text-xs text-gray-500">{asset?.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tenant?.name}</p>
                        <p className="text-xs text-gray-500">{tenant?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Lease Details */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Period:</span>
                      <span className="font-medium">{new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Rent:</span>
                      <span className="font-medium">{formatCurrency(lease.rentAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Deposit:</span>
                      <span className="font-medium">{formatCurrency(lease.deposit)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium capitalize">{lease.leaseType.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Charge Period:</span>
                      <span className="font-medium">{formatMinutesToDuration(lease.chargePeriodMinutes)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openDetailsModal(lease)}
                      className="flex-1 px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleEdit(lease)}
                      className="flex-1 px-3 py-2 text-xs bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Edit
                    </button>
                    {lease.status === 'active' && (
                      <>
                        <button
                          onClick={() => openActionModal(lease, 'terminate')}
                          className="flex-1 px-3 py-2 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Terminate
                        </button>
                        <button
                          onClick={() => openActionModal(lease, 'expire')}
                          className="flex-1 px-3 py-2 text-xs bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                        >
                          Mark Expired
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => openDeleteModal(lease)}
                      className="px-3 py-2 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset & Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lease Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rent & Deposit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeases.map((lease) => (
                  <tr key={lease.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {getAssetName(lease.assetId)}
                          </div>
                        </div>
                        <div className="flex items-center mt-1">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-500">
                            {getTenantName(lease.tenantId)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {lease.leaseType.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(lease.rentAmount)}/period
                      </div>
                      <div className="text-sm text-gray-500">
                        Deposit: {formatCurrency(lease.deposit)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(lease.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lease.status)}`}>
                          {lease.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openDetailsModal(lease)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(lease)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      {lease.status === 'active' && (
                        <>
                          <button
                            onClick={() => openActionModal(lease, 'terminate')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Terminate
                          </button>
                          <button
                            onClick={() => openActionModal(lease, 'expire')}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Mark Expired
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openDeleteModal(lease)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty States */}
      {leases.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leases yet</h3>
          <p className="text-gray-500 mb-4">Create lease agreements with automatic end dates and payment intervals</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Lease
          </button>
        </div>
      ) : filteredLeases.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leases match your filters</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search terms or filters</p>
          <button
            onClick={clearFilters}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : null}

      {/* Details Modal */}
      <LeaseDetailsModal
        isOpen={showDetailsModal}
        lease={leaseForDetails}
        asset={detailsModalData.asset}
        tenant={detailsModalData.tenant}
        collectionData={detailsModalData.collectionData}
        onClose={closeDetailsModal}
      />

      {/* Action Confirmation Modal */}
      <LeaseActionConfirmationModal
        isOpen={showActionModal}
        action={actionType}
        lease={leaseForAction}
        asset={actionModalData.asset}
        tenant={actionModalData.tenant}
        collectionData={actionModalData.collectionData}
        onClose={closeActionModal}
        onConfirm={confirmAction}
        isProcessing={isProcessingAction}
      />

      {/* Delete Confirmation Modal */}
      <LeaseDeleteConfirmationModal
        isOpen={showDeleteModal}
        lease={leaseToDelete}
        asset={deleteModalData.asset}
        tenant={deleteModalData.tenant}
        collectionData={deleteModalData.collectionData}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};