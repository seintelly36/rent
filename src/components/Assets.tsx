import React, { useState } from 'react';
import { Asset } from '../types';
import { AssetForm, AssetHeader, AssetGrid, AssetEmptyState } from './Assets/index';
import { ConfirmationModal } from './ConfirmationModal';
import { Trash2 } from 'lucide-react';

interface AssetsProps {
  assets: Asset[];
  tenants: Tenant[];
  assetTypes: AssetType[];
  onAddAsset: (asset: Asset) => void;
  onUpdateAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
}

export const Assets: React.FC<AssetsProps> = ({
  assets,
  tenants,
  assetTypes,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [assetToDeleteId, setAssetToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmitAsset = async (assetData: Omit<Asset, 'id' | 'createdAt'>) => {
    if (editingAsset) {
      await onUpdateAsset({
        ...editingAsset,
        ...assetData,
      });
    } else {
      await onAddAsset(assetData);
    }
    setShowForm(false);
    setEditingAsset(null);
  };

  const handleCloseAsset = () => {
    setShowForm(false);
    setEditingAsset(null);
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  const handleDeleteClick = (assetId: string) => {
    setAssetToDeleteId(assetId);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDeleteAsset = async () => {
    if (!assetToDeleteId) return;

    setIsDeleting(true);
    try {
      await onDeleteAsset(assetToDeleteId);
      setShowDeleteConfirmModal(false);
      setAssetToDeleteId(null);
    } catch (error) {
      console.error('Failed to delete asset:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setShowDeleteConfirmModal(false);
      setAssetToDeleteId(null);
    }
  };

  const assetToDelete = assetToDeleteId ? assets.find(a => a.id === assetToDeleteId) : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <AssetHeader onAddAsset={() => setShowForm(true)} />

      <AssetForm
        isOpen={showForm}
        editingAsset={editingAsset}
        assetTypes={assetTypes}
        onSubmit={handleSubmitAsset}
        onClose={handleCloseAsset}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDeleteAsset}
        title="Delete Asset"
        message={`Are you sure you want to delete "${assetToDelete?.name}"? This action cannot be undone and will also remove all associated leases and payments.`}
        isProcessing={isDeleting}
        confirmButtonText="Delete Asset"
        confirmButtonColor="red"
        icon={<Trash2 className="h-6 w-6 text-red-600" />}
      />

      {assets.length === 0 ? (
        <AssetEmptyState onAddAsset={() => setShowForm(true)} />
      ) : (
        <AssetGrid
          assets={assets}
          tenants={tenants}
          assetTypes={assetTypes}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      )}
      
    </div>
  );
};