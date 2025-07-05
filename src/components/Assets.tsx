import React, { useState } from 'react';
import { Asset } from '../types';
import { AssetForm, AssetHeader, AssetGrid, AssetEmptyState } from './Assets';

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

      {assets.length === 0 ? (
        <AssetEmptyState onAddAsset={() => setShowForm(true)} />
      ) : (
        <AssetGrid
          assets={assets}
          tenants={tenants}
          assetTypes={assetTypes}
          onEdit={handleEdit}
          onDelete={onDeleteAsset}
        />
      )}
      
    </div>
  );
};