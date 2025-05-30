<template>
  <teleport to="body">
    <div class="notification-container fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <transition-group name="notification" tag="div" class="space-y-2">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="getNotificationClasses(notification.type)"
          class="notification-item relative rounded-lg shadow-lg p-4 border-l-4 backdrop-blur-sm"
        >
          <!-- Icono -->
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <component :is="getNotificationIcon(notification.type)" class="h-5 w-5" />
            </div>
            
            <!-- Contenido -->
            <div class="ml-3 flex-1">
              <h4 class="text-sm font-medium">{{ notification.title }}</h4>
              <p v-if="notification.message" class="mt-1 text-sm opacity-90">
                {{ notification.message }}
              </p>
            </div>
            
            <!-- Botón cerrar -->
            <button
              @click="removeNotification(notification.id)"
              class="ml-4 flex-shrink-0 rounded-md p-1 hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
              :class="getCloseButtonClasses(notification.type)"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Barra de progreso para auto-dismiss -->
          <div
            v-if="!notification.persistent && notification.duration"
            class="absolute bottom-0 left-0 h-1 bg-current opacity-30 transition-all duration-linear"
            :style="{ 
              width: '100%',
              animationDuration: `${notification.duration}ms`,
              animationName: 'notification-progress'
            }"
          ></div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNotifications, type NotificationType } from '@/composables/useNotifications';

const { notifications, removeNotification } = useNotifications();

function getNotificationClasses(type: NotificationType): string {
  const baseClasses = 'relative overflow-hidden';
  
  switch (type) {
    case 'success':
      return `${baseClasses} bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-400`;
    case 'error':
      return `${baseClasses} bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-400`;
    case 'warning':
      return `${baseClasses} bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-400`;
    case 'info':
      return `${baseClasses} bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-400`;
    default:
      return `${baseClasses} bg-gray-50 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200 border-gray-400`;
  }
}

function getCloseButtonClasses(type: NotificationType): string {
  switch (type) {
    case 'success':
      return 'text-green-500 dark:text-green-400 focus:ring-green-500';
    case 'error':
      return 'text-red-500 dark:text-red-400 focus:ring-red-500';
    case 'warning':
      return 'text-yellow-500 dark:text-yellow-400 focus:ring-yellow-500';
    case 'info':
      return 'text-blue-500 dark:text-blue-400 focus:ring-blue-500';
    default:
      return 'text-gray-500 dark:text-gray-400 focus:ring-gray-500';
  }
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'success':
      return {
        template: `
          <svg class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `
      };
    case 'error':
      return {
        template: `
          <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        `
      };
    case 'warning':
      return {
        template: `
          <svg class="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        `
      };
    case 'info':
    default:
      return {
        template: `
          <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `
      };
  }
}
</script>

<style scoped>
/* Transiciones para las notificaciones */
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Animación de la barra de progreso */
@keyframes notification-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .notification-container {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}
</style> 