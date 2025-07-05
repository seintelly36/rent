import React from 'react';
import { Plus, X } from 'lucide-react';
import { SocialMediaEntry } from '../../types';

interface TenantSocialMediaProps {
  socialMedia: SocialMediaEntry[];
  onSocialMediaChange: (socialMedia: SocialMediaEntry[]) => void;
}

export const TenantSocialMedia: React.FC<TenantSocialMediaProps> = ({
  socialMedia,
  onSocialMediaChange,
}) => {
  const addSocialMediaEntry = () => {
    onSocialMediaChange([...socialMedia, { platform: '', handle: '' }]);
  };

  const updateSocialMediaEntry = (index: number, field: 'platform' | 'handle', value: string) => {
    const updatedSocialMedia = [...socialMedia];
    updatedSocialMedia[index] = { ...updatedSocialMedia[index], [field]: value };
    onSocialMediaChange(updatedSocialMedia);
  };

  const removeSocialMediaEntry = (index: number) => {
    onSocialMediaChange(socialMedia.filter((_, i) => i !== index));
  };

  return (
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
      
      {socialMedia.length > 0 && (
        <div className="space-y-3">
          {socialMedia.map((entry, index) => (
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
      
      {socialMedia.length === 0 && (
        <p className="text-sm text-gray-500 italic">No social media profiles added</p>
      )}
    </div>
  );
};