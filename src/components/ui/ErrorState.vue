<template>
  <div class="error-state bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700 p-8">
    <div class="text-center max-w-md mx-auto">
      <!-- Icono animado -->
      <div class="error-icon-wrapper mb-6">
        <div class="error-icon text-6xl animate-bounce">
          {{ getErrorIcon(errorType) }}
        </div>
      </div>
      
      <!-- Título -->
      <h3 class="error-title text-2xl font-semibold text-red-800 dark:text-red-200 mb-3">
        {{ title || getErrorTitle(errorType) }}
      </h3>
      
      <!-- Mensaje de error -->
      <p class="error-message text-red-600 dark:text-red-400 mb-6 leading-relaxed">
        {{ error || getErrorMessage(errorType) }}
      </p>
      
      <!-- Detalles técnicos (solo en desarrollo) -->
      <details v-if="showDetails && isDev" class="error-details text-left bg-red-100 dark:bg-red-900/30 rounded p-3 mb-6 text-sm">
        <summary class="cursor-pointer font-medium text-red-700 dark:text-red-300 mb-2">
          Detalles técnicos
        </summary>
        <pre class="text-red-600 dark:text-red-400 overflow-auto">{{ technicalDetails }}</pre>
      </details>
      
      <!-- Acciones -->
      <div class="error-actions flex flex-col sm:flex-row gap-3 justify-center">
        <!-- Botón principal de retry -->
        <button 
          v-if="showRetry"
          @click="handleRetry"
          :disabled="isRetrying"
          class="retry-btn bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg v-if="isRetrying" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isRetrying ? 'Reintentando...' : retryText }}
        </button>
        
        <!-- Botón secundario -->
        <button 
          v-if="secondaryAction"
          @click="handleSecondaryAction"
          class="secondary-btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium px-6 py-3 rounded-lg transition-colors duration-200"
        >
          {{ secondaryActionText }}
        </button>
      </div>
      
      <!-- Información adicional -->
      <div v-if="showHelp" class="error-help mt-6 text-sm text-red-500 dark:text-red-400">
        <p>{{ helpText }}</p>
        <a v-if="helpLink" :href="helpLink" target="_blank" class="underline hover:no-underline">
          Más información
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

type ErrorType = 'network' | 'server' | 'auth' | 'notFound' | 'generic';

interface Props {
  error?: string;
  errorType?: ErrorType;
  title?: string;
  retryText?: string;
  showRetry?: boolean;
  showDetails?: boolean;
  showHelp?: boolean;
  helpText?: string;
  helpLink?: string;
  secondaryAction?: () => void;
  secondaryActionText?: string;
  technicalDetails?: string;
}

const props = withDefaults(defineProps<Props>(), {
  errorType: 'generic',
  retryText: 'Reintentar',
  showRetry: true,
  showDetails: false,
  showHelp: false,
  helpText: 'Si el problema persiste, contacta con soporte técnico.',
  secondaryActionText: 'Ir al inicio'
});

const emit = defineEmits<{
  retry: [];
  secondaryAction: [];
}>();

const isRetrying = ref(false);
const isDev = computed(() => import.meta.env.DEV);

// Mapeo de tipos de error a iconos
const getErrorIcon = (type: ErrorType): string => {
  const icons = {
    network: '🌐',
    server: '⚠️', 
    auth: '🔒',
    notFound: '🔍',
    generic: '❌'
  };
  return icons[type] || icons.generic;
};

// Mapeo de tipos de error a títulos
const getErrorTitle = (type: ErrorType): string => {
  const titles = {
    network: 'Error de conexión',
    server: 'Error del servidor',
    auth: 'Error de autenticación', 
    notFound: 'Contenido no encontrado',
    generic: 'Ha ocurrido un error'
  };
  return titles[type] || titles.generic;
};

// Mapeo de tipos de error a mensajes
const getErrorMessage = (type: ErrorType): string => {
  const messages = {
    network: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
    server: 'El servidor está experimentando problemas. Inténtalo de nuevo en unos momentos.',
    auth: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
    notFound: 'El contenido que buscas no está disponible o ha sido eliminado.',
    generic: 'Se ha producido un error inesperado. Por favor inténtalo de nuevo.'
  };
  return messages[type] || messages.generic;
};

const handleRetry = async () => {
  if (isRetrying.value) return;
  
  isRetrying.value = true;
  
  try {
    emit('retry');
    
    // Simular delay mínimo para UX
    await new Promise(resolve => setTimeout(resolve, 500));
  } finally {
    isRetrying.value = false;
  }
};

const handleSecondaryAction = () => {
  if (props.secondaryAction) {
    props.secondaryAction();
  } else {
    emit('secondaryAction');
  }
};
</script>

<style scoped>
.error-state {
  /* Optimizaciones de performance */
  contain: layout style;
  will-change: transform;
}

.error-icon-wrapper {
  /* Centrar y optimizar la animación del icono */
  display: flex;
  justify-content: center;
  align-items: center;
}

.retry-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.retry-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
}

.retry-btn:active:not(:disabled) {
  transform: translateY(0);
}

.secondary-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.error-details {
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.error-details pre {
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Animaciones optimizadas */
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -8px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -1px, 0);
  }
}

.animate-bounce {
  animation: bounce 2s infinite;
  will-change: transform;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .error-state {
    padding: 1.5rem;
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .retry-btn,
  .secondary-btn {
    width: 100%;
  }
}
</style> 