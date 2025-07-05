import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database } from 'lucide-react';
import { TimeConverter } from './TimeConverter';

export const Settings: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your application preferences and tools</p>
      </div>

      {/* Time Converter Tool */}
      <div className="mb-8">
        <TimeConverter />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
              <p className="text-sm text-gray-600">Update your personal information</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-600">Configure alert preferences</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Bell className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Security</h3>
              <p className="text-sm text-gray-600">Password and authentication</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
              <p className="text-sm text-gray-600">Export and backup options</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Database className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <SettingsIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">More Settings Coming Soon</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            We're building comprehensive settings to help you customize your experience, 
            manage notifications, security preferences, and data export options.
          </p>
        </div>
      </div>
    </div>
  );
};