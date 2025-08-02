<template>
  <div class="loading-spinner-container flex flex-col items-center justify-center" :class="containerClass">
    <!-- Spinner principal -->
    <div 
      class="loading-spinner border-gray-200 dark:border-gray-600 animate-spin" 
      :class="spinnerClasses"
      :style="spinnerStyles"
    >
      <div class="spinner-inner" :class="innerClass"></div>
    </div>
    
    <!-- Mensaje de loading -->
    <div v-if="message" class="loading-message mt-3 text-center">
      <p class="text-gray-600 dark:text-gray-400 font-medium animate-pulse">
        {{ message }}
      </p>
    </div>
    
    <!-- Progreso (opcional) -->
    <div v-if="showProgress && progress !== null" class="loading-progress mt-4 w-full max-w-xs">
      <div class="progress-bar bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div 
          class="progress-fill bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
          :style="{ width: `${Math.min(Math.max(progress, 0), 100)}%` }"
        ></div>
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
        {{ Math.round(progress) }}%
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'default' | 'dots' | 'pulse' | 'gradient';

interface Props {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  message?: string;
  color?: string;
  showProgress?: boolean;
  progress?: number | null;
  fullscreen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'default',
  color: '#3B82F6', // blue-500
  showProgress: false,
  progress: null,
  fullscreen: false
});

// Clases de tamaño
const sizeClasses = computed(() => {
  const sizes = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4'
  };
  return sizes[props.size];
});

// Clases del contenedor
const containerClass = computed(() => {
  return {
    'fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50': props.fullscreen,
    'py-8': !props.fullscreen
  };
});

// Clases del spinner basadas en variant
const spinnerClasses = computed(() => {
  const baseClasses = `${sizeClasses.value} rounded-full border-solid`;
  
  switch (props.variant) {
    case 'dots':
      return `${baseClasses} border-transparent relative`;
    case 'pulse':
      return `${baseClasses} border-transparent bg-current animate-pulse`;
    case 'gradient':
      return `${baseClasses} border-transparent bg-gradient-to-r from-blue-500 to-purple-500`;
    default:
      return `${baseClasses} border-t-current`;
  }
});

// Clase interna para variants especiales
const innerClass = computed(() => {
  if (props.variant === 'dots') {
    return 'absolute inset-0 rounded-full border-2 border-current border-t-transparent animate-spin';
  }
  return '';
});

// Estilos dinámicos
const spinnerStyles = computed(() => {
  return {
    color: props.color,
    borderTopColor: props.variant === 'default' ? props.color : undefined
  };
});
</script>

<style scoped>
.loading-spinner-container {
  /* Optimizaciones de performance */
  contain: layout style;
  will-change: transform;
}

.loading-spinner {
  will-change: transform;
}

/* Animación optimizada de spin */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Variant dots - múltiples puntos girando */
.loading-spinner.dots::before,
.loading-spinner.dots::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  border: 2px solid currentColor;
  animation: spin 1.5s linear infinite;
}

.loading-spinner.dots::before {
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
  animation-delay: -0.5s;
}

.loading-spinner.dots::after {
  width: 30%;
  height: 30%;
  top: 35%;
  left: 35%;
  animation-delay: -1s;
}

/* Variant pulse - efecto de latido */
.loading-spinner.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

/* Optimización para progress bar */
.progress-fill {
  will-change: width;
}

/* Efecto de shimmer para el mensaje */
.loading-message .animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .loading-spinner-container.fullscreen {
    padding: 2rem;
  }
  
  .loading-progress {
    max-width: 16rem;
  }
}

/* Dark mode optimizations */
.dark .progress-bar {
  background-color: #374151;
}

/* Backdrop blur optimizado */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Hardware acceleration para mejor performance */
.loading-spinner,
.progress-fill,
.loading-message {
  transform: translateZ(0);
}
</style> 