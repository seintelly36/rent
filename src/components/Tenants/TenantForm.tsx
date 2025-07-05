import React from 'react';
import { X } from 'lucide-react';
import { Tenant, SocialMediaEntry } from '../../types';
import { TenantBasicInfo } from './TenantBasicInfo';
import { TenantSocialMedia } from './TenantSocialMedia';
import { TenantAdditionalInfo } from './TenantAdditionalInfo';

interface TenantFormProps {
  isOpen: boolean;
  editingTenant: Tenant | null;
  formData: {
    name: string;
    email: string;
    phone: string;
    status: Tenant['status'];
    socialMedia: SocialMediaEntry[];
    otherInformation: string;
  };
  onFormDataChange: (data: Partial<TenantFormProps['formData']>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const TenantForm: React.FC<TenantFormProps> = ({
  isOpen,
  editingTenant,
  formData,
  onFormDataChange,
  onSubmit,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <TenantBasicInfo
            formData={formData}
            onFormDataChange={onFormDataChange}
          />

          <TenantSocialMedia
            socialMedia={formData.socialMedia}
            onSocialMediaChange={(socialMedia) => onFormDataChange({ socialMedia })}
          />

          <TenantAdditionalInfo
            otherInformation={formData.otherInformation}
            onOtherInformationChange={(otherInformation) => onFormDataChange({ otherInformation })}
          />
          
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
              {editingTenant ? 'Update Tenant' : 'Add Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};