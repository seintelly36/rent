import { useState, useCallback } from 'react';
import { Lease, Asset, Tenant, Payment, LeaseCollectionData } from '../types';
import { getLeaseCollectionDataForLease } from '../utils/paymentCalculations';

interface UseLeaseModalsProps {
  assets: Asset[];
  tenants: Tenant[];
  payments: Payment[];
  onDeleteLease: (id: string) => Promise<void>;
  onUpdateLease: (lease: Lease) => Promise<void>;
  onUpdateAsset: (asset: Asset) => Promise<void>;
}

export const useLeaseModals = ({
  assets,
  tenants,
  payments,
  onDeleteLease,
  onUpdateLease,
  onUpdateAsset,
}: UseLeaseModalsProps) => {
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leaseToDelete, setLeaseToDelete] = useState<Lease | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action confirmation modal state
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'terminate' | 'expire' | null>(null);
  const [leaseForAction, setLeaseForAction] = useState<Lease | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [leaseForDetails, setLeaseForDetails] = useState<Lease | null>(null);

  // Get related data for a lease
  const getLeaseRelatedData = useCallback((lease: Lease | null) => {
    if (!lease) return { asset: null, tenant: null, collectionData: null };

    const asset = assets.find(a => a.id === lease.assetId) || null;
    const tenant = tenants.find(t => t.id === lease.tenantId) || null;
    
    let collectionData: LeaseCollectionData | null = null;
    if (asset && tenant) {
      try {
        collectionData = getLeaseCollectionDataForLease(lease, payments, asset, tenant);
      } catch (error) {
        console.error('Failed to calculate collection data:', error);
      }
    }

    return { asset, tenant, collectionData };
  }, [assets, tenants, payments]);

  // Delete modal handlers
  const openDeleteModal = useCallback((lease: Lease) => {
    setLeaseToDelete(lease);
    setShowDeleteModal(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setLeaseToDelete(null);
    setIsDeleting(false);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!leaseToDelete) return;

    setIsDeleting(true);
    try {
      await onDeleteLease(leaseToDelete.id);
      closeDeleteModal();
    } catch (error) {
      console.error('Failed to delete lease:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsDeleting(false);
    }
  }, [leaseToDelete, onDeleteLease, closeDeleteModal]);

  // Action modal handlers
  const openActionModal = useCallback((lease: Lease, action: 'terminate' | 'expire') => {
    setLeaseForAction(lease);
    setActionType(action);
    setShowActionModal(true);
  }, []);

  const closeActionModal = useCallback(() => {
    setShowActionModal(false);
    setLeaseForAction(null);
    setActionType(null);
    setIsProcessingAction(false);
  }, []);

  const confirmAction = useCallback(async () => {
    if (!leaseForAction || !actionType) return;

    setIsProcessingAction(true);
    try {
      // Update lease status
      const updatedLease: Lease = {
        ...leaseForAction,
        status: actionType === 'terminate' ? 'terminated' : 'expired',
      };
      await onUpdateLease(updatedLease);

      // Update asset status to vacant and clear tenant
      const asset = assets.find(a => a.id === leaseForAction.assetId);
      if (asset) {
        const updatedAsset: Asset = {
          ...asset,
          status: 'vacant',
          tenantId: undefined,
        };
        await onUpdateAsset(updatedAsset);
      }

      closeActionModal();
    } catch (error) {
      console.error(`Failed to ${actionType} lease:`, error);
      // You might want to show an error message to the user here
    } finally {
      setIsProcessingAction(false);
    }
  }, [leaseForAction, actionType, onUpdateLease, onUpdateAsset, assets, closeActionModal]);

  // Details modal handlers
  const openDetailsModal = useCallback((lease: Lease) => {
    setLeaseForDetails(lease);
    setShowDetailsModal(true);
  }, []);

  const closeDetailsModal = useCallback(() => {
    setShowDetailsModal(false);
    setLeaseForDetails(null);
  }, []);

  // Get data for current modals
  const deleteModalData = getLeaseRelatedData(leaseToDelete);
  const actionModalData = getLeaseRelatedData(leaseForAction);
  const detailsModalData = getLeaseRelatedData(leaseForDetails);

  return {
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
  };
};