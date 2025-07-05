import React from 'react';
import { Menu, Building2 } from 'lucide-react';

interface TopBarProps {
  onToggleNav: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleNav }) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow-md border-b border-gray-200 z-40">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side - Menu toggle and logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleNav}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Toggle navigation menu"
            aria-expanded="false"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div className="ml-2 hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">RentManager</h1>
            </div>
          </div>
        </div>

        {/* Right side - Could add user menu, notifications, etc. */}
        <div className="flex items-center space-x-3">
          {/* Placeholder for future features like user avatar, notifications */}
        </div>
      </div>
    </div>
  );
};