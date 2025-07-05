import React from 'react';
import { User, Mail, Phone, Edit, Trash2, MessageCircle, Info } from 'lucide-react';
import { Tenant } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface TenantCardProps {
  tenant: Tenant;
  onEdit: (tenant: Tenant) => void;
  onDelete: (id: string) => void;
}

export const TenantCard: React.FC<TenantCardProps> = ({
  tenant,
  onEdit,
  onDelete,
}) => {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
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
              onClick={() => onEdit(tenant)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(tenant.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          {tenant.email && (
            <div className="flex items-center text-gray-600">
              <Mail className="h-4 w-4 mr-2" />
              <span className="text-sm">{tenant.email}</span>
            </div>
          )}
          {tenant.phone && (
            <div className="flex items-center text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <span className="text-sm">{tenant.phone}</span>
            </div>
          )}
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
  );
};