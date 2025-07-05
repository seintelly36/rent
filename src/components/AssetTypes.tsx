import React, { useState } from 'react';
import { 
  Plus, 
  Settings, 
  Edit,
  Trash2,
  Type,
  Hash,
  ToggleLeft
} from 'lucide-react';
import { AssetType } from '../types';
import { formatDate, generateId } from '../utils/dateUtils';

interface AssetTypesProps {
  assetTypes: AssetType[];
  onAddAssetType: (assetType: AssetType) => void;
  onUpdateAssetType: (assetType: AssetType) => void;
  onDeleteAssetType: (id: string) => void;
}

export const AssetTypes: React.FC<AssetTypesProps> = ({
  assetTypes,
  onAddAssetType,
  onUpdateAssetType,
  onDeleteAssetType,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAssetType, setEditingAssetType] = useState<AssetType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    predefinedDetails: [
      { name: 'Bedrooms', type: 'number' as const, required: false },
      { name: 'Bathrooms', type: 'number' as const, required: false },
      { name: 'Square Footage', type: 'number' as const, required: false },
    ],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAssetType) {
      onUpdateAssetType({
        ...editingAssetType,
        ...formData,
      });
    } else {
      onAddAssetType({
        id: generateId(),
        ...formData,
        createdAt: new Date().toISOString(),
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      predefinedDetails: [
        { name: 'Bedrooms', type: 'number', required: false },
        { name: 'Bathrooms', type: 'number', required: false },
        { name: 'Square Footage', type: 'number', required: false },
      ],
    });
    setShowForm(false);
    setEditingAssetType(null);
  };

  const handleEdit = (assetType: AssetType) => {
    setEditingAssetType(assetType);
    setFormData({
      name: assetType.name,
      description: assetType.description || '',
      predefinedDetails: assetType.predefinedDetails,
    });
    setShowForm(true);
  };

  const addPredefinedDetail = () => {
    setFormData({
      ...formData,
      predefinedDetails: [
        ...formData.predefinedDetails,
        { name: '', type: 'text', required: false },
      ],
    });
  };

  const updatePredefinedDetail = (index: number, field: string, value: any) => {
    const updatedDetails = [...formData.predefinedDetails];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setFormData({ ...formData, predefinedDetails: updatedDetails });
  };

  const removePredefinedDetail = (index: number) => {
    setFormData({
      ...formData,
      predefinedDetails: formData.predefinedDetails.filter((_, i) => i !== index),
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'number':
        return <Hash className="h-4 w-4" />;
      case 'boolean':
        return <ToggleLeft className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Types</h1>
          <p className="text-gray-600 mt-1">Define templates for different types of assets</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Asset Type
        </button>
      </div>

      {/* Asset Type Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingAssetType ? 'Edit Asset Type' : 'Add New Asset Type'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asset Type Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Apartment, House, Commercial Space"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of this asset type"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Predefined Details
                  </label>
                  <button
                    type="button"
                    onClick={addPredefinedDetail}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Detail
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.predefinedDetails.map((detail, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={detail.name}
                          onChange={(e) => updatePredefinedDetail(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Detail name (e.g., Bedrooms)"
                        />
                      </div>
                      <div className="w-32">
                        <select
                          value={detail.type}
                          onChange={(e) => updatePredefinedDetail(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="boolean">Yes/No</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={detail.required || false}
                          onChange={(e) => updatePredefinedDetail(index, 'required', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-600">Required</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePredefinedDetail(index)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
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
                  {editingAssetType ? 'Update Asset Type' : 'Add Asset Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assetTypes.map((assetType) => (
          <div
            key={assetType.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <Settings className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">{assetType.name}</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(assetType)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteAssetType(assetType.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {assetType.description && (
                <p className="text-gray-600 text-sm mb-4">{assetType.description}</p>
              )}
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Predefined Details:</h4>
                <div className="space-y-1">
                  {assetType.predefinedDetails.map((detail, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        {getTypeIcon(detail.type)}
                        <span className="ml-2 text-gray-600">{detail.name}</span>
                        {detail.required && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 capitalize">{detail.type}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-100 mt-4">
                <span className="text-xs text-gray-500">
                  Created {formatDate(assetType.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {assetTypes.length === 0 && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No asset types yet</h3>
          <p className="text-gray-500 mb-4">Create templates to define different types of assets</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Asset Type
          </button>
        </div>
      )}
    </div>
  );
};