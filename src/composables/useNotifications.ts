import { ref, reactive } from 'vue';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  timestamp: Date;
}

const notifications = ref<Notification[]>([]);

let notificationId = 0;

function generateId(): string {
  return `notification-${++notificationId}-${Date.now()}`;
}

export function useNotifications() {
  
  const addNotification = (
    type: NotificationType,
    title: string,
    message?: string,
    options: { duration?: number; persistent?: boolean } = {}
  ): string => {
    const { duration = 5000, persistent = false } = options;
    
    const notification: Notification = {
      id: generateId(),
      type,
      title,
      message,
      duration,
      persistent,
      timestamp: new Date()
    };

    notifications.value.push(notification);

    // Auto-remove after duration if not persistent
    if (!persistent && duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, duration);
    }

    return notification.id;
  };

  const removeNotification = (id: string): void => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  const clearAllNotifications = (): void => {
    notifications.value = [];
  };

  const clearNotificationsByType = (type: NotificationType): void => {
    notifications.value = notifications.value.filter(n => n.type !== type);
  };

  // Helpers para tipos específicos
  const success = (title: string, message?: string, options?: { duration?: number; persistent?: boolean }) => {
    return addNotification('success', title, message, options);
  };

  const error = (title: string, message?: string, options?: { duration?: number; persistent?: boolean }) => {
    return addNotification('error', title, message, { duration: 8000, ...options }); // Errores duran más
  };

  const warning = (title: string, message?: string, options?: { duration?: number; persistent?: boolean }) => {
    return addNotification('warning', title, message, options);
  };

  const info = (title: string, message?: string, options?: { duration?: number; persistent?: boolean }) => {
    return addNotification('info', title, message, options);
  };

  // Helper para errores de API
  const apiError = (error: any, context?: string) => {
    const title = context ? `Error en ${context}` : 'Error de conexión';
    const message = error?.message || error?.error || 'Ha ocurrido un error inesperado';
    return addNotification('error', title, message, { duration: 10000 });
  };

  // Helper para errores de infinite scroll
  const infiniteScrollError = (error: any) => {
    return apiError(error, 'carga de noticias');
  };

  return {
    notifications: notifications.value,
    addNotification,
    removeNotification,
    clearAllNotifications,
    clearNotificationsByType,
    success,
    error,
    warning,
    info,
    apiError,
    infiniteScrollError
  };
}

// Singleton para uso global
export const globalNotifications = useNotifications(); 