import React from 'react';
import { Asset, Tenant, AssetType } from '../../types';
import { AssetCard } from './AssetCard';

interface AssetGridProps {
  assets: Asset[];
  tenants: Tenant[];
  assetTypes: AssetType[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
}

export const AssetGrid: React.FC<AssetGridProps> = ({
  assets,
  tenants,
  assetTypes,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assets.map((asset) => {
        const tenant = tenants.find(t => t.assetId === asset.id && t.status === 'active');
        const assetType = assetTypes.find(at => at.id === asset.assetTypeId);
        
        return (
          <AssetCard
            key={asset.id}
            asset={asset}
            tenant={tenant}
            assetType={assetType}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
};