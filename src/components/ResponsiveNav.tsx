import React, { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, LogOut, Building2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ResponsiveNavProps {
  navigation: { id: string; name: string; icon: React.ElementType; path: string }[];
  isOpen: boolean;
  onClose: () => void;
}

export const ResponsiveNav: React.FC<ResponsiveNavProps> = ({ 
  navigation, 
  isOpen, 
  onClose 
}) => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const handleLinkClick = () => {
    onClose();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Navigation Menu - Slides from left */}
      <div
        ref={menuRef}
        id="responsive-menu"
        role="menu"
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-[-100%]'
        } flex flex-col`}
      >
        {/* Header with close button */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">RentManager</h1>
                <p className="text-sm text-gray-500">Asset Management</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Close navigation menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center px-6 py-4 text-base font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                role="menuitem"
                onClick={handleLinkClick}
              >
                <Icon className={`h-6 w-6 mr-4 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info and Sign Out */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="mb-4">
            <p className="text-sm text-gray-600">Signed in as:</p>
            <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
            role="menuitem"
          >
            <LogOut className="h-5 w-5 mr-3 text-gray-400" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};