import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useLeases } from '../hooks/useLeases';
import { useAssets } from '../hooks/useAssets';
import { useTenants } from '../hooks/useTenants';
import { usePayments } from '../hooks/usePayments';
import { useAuth } from '../hooks/useAuth';
import { Lease } from '../types';
import { LeaseForm } from './Leases/LeaseForm';
import { LeaseCard } from './Leases/LeaseCard';
import { LeaseTableRow } from './Leases/LeaseTableRow';
import { LeaseViewToggle } from './Leases/LeaseViewToggle';
import { LeaseEmptyState } from './Leases/LeaseEmptyState';
import { LeaseDetailsModal } from './Leases/LeaseDetailsModal';
import { LeaseActionConfirmationModal } from './Leases/LeaseActionConfirmationModal';
import { LeaseDeleteConfirmationModal } from './Leases/LeaseDeleteConfirmationModal';
import { LeaseFilters } from './Leases/LeaseFilters';
import { useLeaseFilters } from '../hooks/useLeaseFilters';
import { useLeaseModals } from '../hooks/useLeaseModals';
import { convertMinutesToValueAndUnit } from '../utils/dateUtils';

export const Leases: React.FC = () => {
  const { user } = useAuth();
  const { leases, loading, addLease, updateLease, deleteLease, adjustLeasePeriods } = useLeases(user?.id);
  const { assets } = useAssets(user?.id);
  const { tenants } = useTenants(user?.id);
  const { updateAsset } = useAssets(user?.id);
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
    onUpdateAsset: updateAsset,
  });

  const handleSubmitLease = async (leaseData: Omit<Lease, 'id' | 'createdAt'>) => {
    if (editingLease) {
      await updateLease({ ...editingLease, ...leaseData });
    } else {
      const newLease = await addLease(leaseData);
      
      // Update asset status to occupied when creating a new lease
      if (newLease) {
        const asset = assets.find(a => a.id === leaseData.assetId);
        if (asset) {
          await updateAsset({
            ...asset,
            status: 'occupied',
            tenantId: leaseData.tenantId,
          });
        }
      }
    }
    setShowForm(false);
    setEditingLease(null);
  };

  const handleCloseLease = () => {
    setShowForm(false);
    setEditingLease(null);
  };

  const handleEdit = (lease: Lease) => {
    const { value, unit } = convertMinutesToValueAndUnit(lease.chargePeriodMinutes);
    setEditingLease(lease);
    setShowForm(true);
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
          <LeaseViewToggle
            adjustLeasePeriods={adjustLeasePeriods}
            displayMode={displayMode}
            onToggle={setDisplayMode}
          />
          
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

      <LeaseForm
        isOpen={showForm}
        editingLease={editingLease}
        assets={assets}
        tenants={tenants}
        onSubmit={handleSubmitLease}
        onClose={handleCloseLease}
      />

      {/* Conditional Rendering Based on Display Mode */}
      {displayMode === 'card' ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeases.map((lease) => {
            const asset = assets.find(a => a.id === lease.assetId);
            const tenant = tenants.find(t => t.id === lease.tenantId);
            
            return (
              <LeaseCard
                key={lease.id}
                lease={lease}
                asset={asset}
                tenant={tenant}
                onViewDetails={openDetailsModal}
                onEdit={handleEdit}
                onTerminate={(lease) => openActionModal(lease, 'terminate')}
                onMarkExpired={(lease) => openActionModal(lease, 'expire')}
                onDelete={openDeleteModal}
              />
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
                  <LeaseTableRow
                    key={lease.id}
                    lease={lease}
                    asset={assets.find(a => a.id === lease.assetId)}
                    tenant={tenants.find(t => t.id === lease.tenantId)}
                    onViewDetails={openDetailsModal}
                    onEdit={handleEdit}
                    onTerminate={(lease) => openActionModal(lease, 'terminate')}
                    onMarkExpired={(lease) => openActionModal(lease, 'expire')}
                    onDelete={openDeleteModal}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty States */}
      {(leases.length === 0 || filteredLeases.length === 0) && (
        <LeaseEmptyState
          hasFilters={leases.length > 0 && filteredLeases.length === 0}
          onAddLease={() => setShowForm(true)}
          onClearFilters={clearFilters}
        />
      )}

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