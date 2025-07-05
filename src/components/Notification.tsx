import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { NotificationState } from '../hooks/useNotification';

interface NotificationProps {
  notifications: NotificationState[];
  onHide: (id: string) => void;
}

export const Notification: React.FC<NotificationProps> = ({ notifications, onHide }) => {
  const getIcon = (type: NotificationState['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStyles = (type: NotificationState['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            flex items-start p-4 border rounded-lg shadow-lg transition-all duration-300 ease-in-out
            ${notification.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
            ${getStyles(notification.type)}
          `}
        >
          <div className="flex-shrink-0 mr-3">
            {getIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-5">
              {notification.message}
            </p>
          </div>
          
          <button
            onClick={() => onHide(notification.id)}
            className="flex-shrink-0 ml-3 p-1 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};