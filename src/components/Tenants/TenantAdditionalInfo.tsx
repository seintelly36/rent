import React from 'react';

interface TenantAdditionalInfoProps {
  otherInformation: string;
  onOtherInformationChange: (value: string) => void;
}

export const TenantAdditionalInfo: React.FC<TenantAdditionalInfoProps> = ({
  otherInformation,
  onOtherInformationChange,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Other Information</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes
        </label>
        <textarea
          rows={4}
          value={otherInformation}
          onChange={(e) => onOtherInformationChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Emergency contacts, preferences, special requirements, etc."
        />
      </div>
    </div>
  );
};