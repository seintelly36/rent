import React, { useState } from 'react';
import { 
  Plus, 
  Building2, 
  MapPin, 
  User,
  Edit,
  Trash2,
  Tag
} from 'lucide-react';
import { Asset, Tenant, AssetType, AssetDetail } from '../types';
import { generateId } from '../utils/dateUtils';

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
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    assetTypeId: '',
    details: [] as AssetDetail[],
    status: 'vacant' as Asset['status'],
  });

  const selectedAssetType = assetTypes.find(at => at.id === formData.assetTypeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAsset) {
        await onUpdateAsset({
          ...editingAsset,
          ...formData,
        });
      } else {
        await onAddAsset({
          ...formData,
        });
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving asset:', error);
      // You might want to show an error message to the user here
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      assetTypeId: '',
      details: [],
      status: 'vacant',
    });
    setShowForm(false);
    setEditingAsset(null);
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      address: asset.address,
      assetTypeId: asset.assetTypeId,
      details: asset.details,
      status: asset.status,
    });
    setShowForm(true);
  };

  const handleAssetTypeChange = (assetTypeId: string) => {
    const assetType = assetTypes.find(at => at.id === assetTypeId);
    if (assetType) {
      const predefinedDetails = assetType.predefinedDetails.map(pd => ({
        name: pd.name,
        value: pd.type === 'number' ? 0 : pd.type === 'boolean' ? false : '',
      }));
      
      setFormData({
        ...formData,
        assetTypeId,
        details: predefinedDetails,
      });
    } else {
      setFormData({
        ...formData,
        assetTypeId,
        details: [],
      });
    }
  };

  const updateDetail = (index: number, value: string | number) => {
    const updatedDetails = [...formData.details];
    updatedDetails[index] = { ...updatedDetails[index], value };
    setFormData({ ...formData, details: updatedDetails });
  };

  const addCustomDetail = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { name: '', value: '' }],
    });
  };

  const updateCustomDetail = (index: number, field: 'name' | 'value', value: string | number) => {
    const updatedDetails = [...formData.details];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setFormData({ ...formData, details: updatedDetails });
  };

  const removeCustomDetail = (index: number) => {
    setFormData({
      ...formData,
      details: formData.details.filter((_, i) => i !== index),
    });
  };

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'occupied':
        return 'bg-green-100 text-green-800';
      case 'vacant':
        return 'bg-amber-100 text-amber-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDetailValue = (detail: AssetDetail) => {
    if (typeof detail.value === 'boolean') {
      return detail.value ? 'Yes' : 'No';
    }
    if (typeof detail.value === 'number' && detail.name.toLowerCase().includes('footage')) {
      return `${detail.value} sq ft`;
    }
    return detail.value.toString();
  };

  const formatAssetStatus = (status: Asset['status'] | undefined) => {
    if (!status) {
      return 'Unknown';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
          <p className="text-gray-600 mt-1">Manage your asset portfolio</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </button>
      </div>

      {/* Asset Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingAsset ? 'Edit Asset' : 'Add New Asset'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asset Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Sunset Apartments #101"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asset Type
                  </label>
                  <select
                    required
                    value={formData.assetTypeId}
                    onChange={(e) => handleAssetTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select an asset type</option>
                    {assetTypes.map((assetType) => (
                      <option key={assetType.id} value={assetType.id}>
                        {assetType.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Asset['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </div>

              {/* Asset Details */}
              {selectedAssetType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Asset Details
                  </label>
                  <div className="space-y-3">
                    {formData.details.map((detail, index) => {
                      const predefinedDetail = selectedAssetType.predefinedDetails.find(pd => pd.name === detail.name);
                      const isPredefined = !!predefinedDetail;
                      
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          {isPredefined ? (
                            <>
                              <div className="w-32">
                                <span className="text-sm font-medium text-gray-700">{detail.name}</span>
                                {predefinedDetail?.required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </div>
                              <div className="flex-1">
                                {predefinedDetail?.type === 'boolean' ? (
                                  <select
                                    value={detail.value.toString()}
                                    onChange={(e) => updateDetail(index, e.target.value === 'true')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                  </select>
                                ) : (
                                  <input
                                    type={predefinedDetail?.type === 'number' ? 'number' : 'text'}
                                    value={detail.value}
                                    onChange={(e) => updateDetail(index, predefinedDetail?.type === 'number' ? Number(e.target.value) : e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required={predefinedDetail?.required}
                                  />
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={detail.name}
                                  onChange={(e) => updateCustomDetail(index, 'name', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Detail name"
                                />
                              </div>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={detail.value}
                                  onChange={(e) => updateCustomDetail(index, 'value', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Detail value"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeCustomDetail(index)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}
                    
                    <button
                      type="button"
                      onClick={addCustomDetail}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Custom Detail
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingAsset ? 'Update Asset' : 'Add Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => {
          const tenant = tenants.find(t => t.assetId === asset.id && t.status === 'active');
          const assetType = assetTypes.find(at => at.id === asset.assetTypeId);
          
          return (
            <div
              key={asset.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(asset)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteAsset(asset.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{asset.address}</span>
                </div>

                {assetType && (
                  <div className="flex items-center text-gray-600 mb-3">
                    <Tag className="h-4 w-4 mr-1" />
                    <span className="text-sm">{assetType.name}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                    {formatAssetStatus(asset.status)}
                  </span>
                </div>
                
                {/* Asset Details */}
                {asset.details.length > 0 && (
                  <div className="space-y-1 mb-4">
                    {asset.details.slice(0, 3).map((detail, index) => (
                      <div key={index} className="flex items-center justify-between text-sm text-gray-500">
                        <span>{detail.name}:</span>
                        <span>{renderDetailValue(detail)}</span>
                      </div>
                    ))}
                    {asset.details.length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{asset.details.length - 3} more details
                      </div>
                    )}
                  </div>
                )}
                
                {tenant && (
                  <div className="flex items-center text-sm text-gray-600 pt-3 border-t border-gray-100">
                    <User className="h-4 w-4 mr-2" />
                    <span>Tenant: {tenant.name}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {assets.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assets yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first asset</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Asset
          </button>
        </div>
      )}
    </div>
  );
};