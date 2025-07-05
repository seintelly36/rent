import { useNotificationContext } from '../context/NotificationContext';

export const useNotification = () => {
  return useNotificationContext();
};

// Add showWarning method
export const useNotificationWithWarning = () => {
  const context = useNotificationContext();
  return {
    ...context,
    showWarning: context.showWarning,
  };
};

// Re-export types for convenience
export type { NotificationType, NotificationState } from '../context/NotificationContext';