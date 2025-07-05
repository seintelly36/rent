import React, { useState } from 'react';
import { 
  Plus, 
  User, 
  Mail, 
  Phone, 
  Edit,
  Trash2,
  MessageCircle,
  Info,
  X,
  Building2
} from 'lucide-react';
import { Tenant, SocialMediaEntry, Asset } from '../types';
import { formatDate, generateId } from '../utils/dateUtils';

interface TenantsProps {
  tenants: Tenant[];
  assets: Asset[];
  onAddTenant: (tenant: Tenant) => void;
  onUpdateTenant: (tenant: Tenant) => void;
  onDeleteTenant: (id: string) => void;
}

export const Tenants: React.FC<TenantsProps> = ({
  tenants,
  assets,
  onAddTenant,
  onUpdateTenant,
  onDeleteTenant,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    assetId: '',
    name: '',
    email: '',
    phone: '',
    status: 'active' as Tenant['status'],
    socialMedia: [] as SocialMediaEntry[],
    otherInformation: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTenant) {
      onUpdateTenant({
        ...editingTenant,
        ...formData,
        otherInformation: formData.otherInformation || undefined,
      });
    } else {
      onAddTenant({
        id: generateId(),
        ...formData,
        otherInformation: formData.otherInformation || undefined,
        createdAt: new Date().toISOString(),
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      assetId: '',
      name: '',
      email: '',
      phone: '',
      status: 'active',
      socialMedia: [],
      otherInformation: '',
    });
    setShowForm(false);
    setEditingTenant(null);
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      assetId: tenant.assetId,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      status: tenant.status,
      socialMedia: tenant.socialMedia || [],
      otherInformation: tenant.otherInformation || '',
    });
    setShowForm(true);
  };

  const addSocialMediaEntry = () => {
    setFormData({
      ...formData,
      socialMedia: [...formData.socialMedia, { platform: '', handle: '' }],
    });
  };

  const updateSocialMediaEntry = (index: number, field: 'platform' | 'handle', value: string) => {
    const updatedSocialMedia = [...formData.socialMedia];
    updatedSocialMedia[index] = { ...updatedSocialMedia[index], [field]: value };
    setFormData({ ...formData, socialMedia: updatedSocialMedia });
  };

  const removeSocialMediaEntry = (index: number) => {
    setFormData({
      ...formData,
      socialMedia: formData.socialMedia.filter((_, i) => i !== index),
    });
  };

  const getStatusColor = (status: Tenant['status']) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const getSocialMediaIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes('facebook')) return '📘';
    if (platformLower.includes('instagram')) return '📷';
    if (platformLower.includes('twitter') || platformLower.includes('x')) return '🐦';
    if (platformLower.includes('linkedin')) return '💼';
    if (platformLower.includes('tiktok')) return '🎵';
    if (platformLower.includes('youtube')) return '📺';
    return '🌐';
  };

  const getAssetName = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? asset.name : 'Unknown Asset';
  };

  const getAssetAddress = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? asset.address : '';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-600 mt-1">Manage tenant contact information and social profiles</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tenant
        </button>
      </div>

      {/* Tenant Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asset
                    </label>
                    <select
                      required
                      value={formData.assetId}
                      onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select an asset</option>
                      {assets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.name} - {asset.address}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Tenant['status'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Social Media</h3>
                  <button
                    type="button"
                    onClick={addSocialMediaEntry}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Social Media
                  </button>
                </div>
                
                {formData.socialMedia.length > 0 && (
                  <div className="space-y-3">
                    {formData.socialMedia.map((entry, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={entry.platform}
                            onChange={(e) => updateSocialMediaEntry(index, 'platform', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Platform (e.g., Facebook, Instagram)"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={entry.handle}
                            onChange={(e) => updateSocialMediaEntry(index, 'handle', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Handle or username"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSocialMediaEntry(index)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {formData.socialMedia.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No social media profiles added</p>
                )}
              </div>

              {/* Other Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Other Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    rows={4}
                    value={formData.otherInformation}
                    onChange={(e) => setFormData({ ...formData, otherInformation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Emergency contacts, preferences, special requirements, etc."
                  />
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
                  {editingTenant ? 'Update Tenant' : 'Add Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map((tenant) => (
          <div
            key={tenant.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                      {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(tenant)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTenant(tenant.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-600">
                  <Building2 className="h-4 w-4 mr-2" />
                  <div>
                    <span className="text-sm font-medium">{getAssetName(tenant.assetId)}</span>
                    <span className="text-xs text-gray-500 block">{getAssetAddress(tenant.assetId)}</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm">{tenant.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="text-sm">{tenant.phone}</span>
                </div>
              </div>

              {/* Social Media */}
              {tenant.socialMedia && tenant.socialMedia.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center text-gray-700 mb-2">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Social Media</span>
                  </div>
                  <div className="space-y-1">
                    {tenant.socialMedia.slice(0, 3).map((social, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">{getSocialMediaIcon(social.platform)}</span>
                        <span className="font-medium">{social.platform}:</span>
                        <span className="ml-1 text-gray-500">{social.handle}</span>
                      </div>
                    ))}
                    {tenant.socialMedia.length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{tenant.socialMedia.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Other Information */}
              {tenant.otherInformation && (
                <div className="mb-4">
                  <div className="flex items-center text-gray-700 mb-2">
                    <Info className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Additional Info</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {tenant.otherInformation}
                  </p>
                </div>
              )}
              
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Added:</span>
                  <span>{formatDate(tenant.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {tenants.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tenants yet</h3>
          <p className="text-gray-500 mb-4">Add tenant contact information and social profiles to your database</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Tenant
          </button>
        </div>
      )}
    </div>
  );
};