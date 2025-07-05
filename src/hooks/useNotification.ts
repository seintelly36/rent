import { useState, useCallback, useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationState {
  id: string;
  message: string;
  type: NotificationType;
  isVisible: boolean;
  duration?: number;
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const showNotification = useCallback((
    message: string, 
    type: NotificationType = 'info', 
    duration: number = 5000
  ) => {
    const id = generateId();
    const notification: NotificationState = {
      id,
      message,
      type,
      isVisible: true,
      duration,
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-hide notification after duration
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, isVisible: false } : n)
        );
        
        // Remove from array after fade animation
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }, 300);
      }, duration);
    }

    return id;
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    return showNotification(message, 'success', duration);
  }, [showNotification]);

  const showError = useCallback((message: string, duration?: number) => {
    return showNotification(message, 'error', duration);
  }, [showNotification]);

  const showInfo = useCallback((message: string, duration?: number) => {
    return showNotification(message, 'info', duration);
  }, [showNotification]);

  const showWarning = useCallback((message: string, duration?: number) => {
    return showNotification(message, 'warning', duration);
  }, [showNotification]);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isVisible: false } : n)
    );
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 300);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isVisible: false }))
    );
    
    setTimeout(() => {
      setNotifications([]);
    }, 300);
  }, []);

  return {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    hideNotification,
    clearAll,
  };
};