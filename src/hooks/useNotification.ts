import { useNotificationContext } from '../context/NotificationContext';

export const useNotification = () => {
  return useNotificationContext();
};

// Re-export types for convenience
export type { NotificationType, NotificationState } from '../context/NotificationContext';