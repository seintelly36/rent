import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Asset, AssetType, AssetDetail } from '../../types';

interface AssetFormProps {
  isOpen: boolean;
  editingAsset: Asset | null;
  assetTypes: AssetType[];
  onSubmit: (assetData: Omit<Asset, 'id' | 'createdAt'>) => Promise<void>;
  onClose: () => void;
}

export const AssetForm: React.FC<AssetFormProps> = ({
  isOpen,
  editingAsset,
  assetTypes,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    assetTypeId: '',
    details: [] as AssetDetail[],
    status: 'vacant' as Asset['status'],
  });

  const selectedAssetType = assetTypes.find(at => at.id === formData.assetTypeId);

  // Reset form when editing asset changes
  useEffect(() => {
    if (editingAsset) {
      setFormData({
        name: editingAsset.name,
        address: editingAsset.address,
        assetTypeId: editingAsset.assetTypeId,
        details: editingAsset.details,
        status: editingAsset.status,
      });
    } else {
      setFormData({
        name: '',
        address: '',
        assetTypeId: '',
        details: [],
        status: 'vacant',
      });
    }
  }, [editingAsset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error saving asset:', error);
      // You might want to show an error message to the user here
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingAsset ? 'Edit Asset' : 'Add New Asset'}
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
              onClick={onClose}
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
  );
};