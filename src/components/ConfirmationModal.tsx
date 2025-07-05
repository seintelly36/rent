import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isProcessing?: boolean;
  confirmButtonText?: string;
  confirmButtonColor?: 'red' | 'blue' | 'amber';
  icon?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isProcessing = false,
  confirmButtonText = 'Confirm',
  confirmButtonColor = 'red',
  icon,
}) => {
  if (!isOpen) return null;

  const getButtonStyles = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
      case 'amber':
        return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500';
      default:
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'red':
        return 'text-red-600';
      case 'blue':
        return 'text-blue-600';
      case 'amber':
        return 'text-amber-600';
      default:
        return 'text-red-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`p-2 bg-${confirmButtonColor}-100 rounded-lg mr-3`}>
                {icon || <AlertTriangle className={`h-6 w-6 ${getIconColor(confirmButtonColor)}`} />}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isProcessing}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600">{message}</p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${getButtonStyles(confirmButtonColor)}`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                confirmButtonText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};