<template>
  <div class="lazy-image-container" :class="containerClass">
    <!-- Placeholder mientras carga -->
    <div 
      v-if="!isLoaded && !hasError" 
      class="lazy-placeholder animate-pulse" 
      :style="placeholderStyle"
    >
      <div class="placeholder-icon">
        <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
        </svg>
      </div>
      <div v-if="showProgressBar" class="progress-bar">
        <div class="progress-fill" :style="{ width: `${loadingProgress}%` }"></div>
      </div>
    </div>
    
    <!-- Imagen cargada -->
    <img
      v-show="isLoaded && !hasError"
      ref="imageRef"
      :alt="alt"
      :class="imageClass"
      :style="imageStyle"
      @load="onImageLoad"
      @error="onImageError"
    />
    
    <!-- Error state -->
    <div 
      v-if="hasError" 
      class="error-placeholder" 
      :style="errorPlaceholderStyle"
    >
      <div class="error-icon text-red-500">
        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      <span class="error-text text-sm text-red-600">{{ errorMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, shallowRef, watch } from 'vue';
import { useLazyLoading } from '@/composables/useLazyLoading';

interface Props {
  src: string;
  alt?: string;
  placeholderColor?: string;
  errorMessage?: string;
  enableBlur?: boolean;
  showProgressBar?: boolean;
  retryCount?: number;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  placeholderColor: '#f3f4f6',
  errorMessage: 'Error al cargar imagen',
  enableBlur: true,
  showProgressBar: false,
  retryCount: 2
});

const emit = defineEmits<{
  load: [event: Event];
  error: [error: Error];
  progress: [progress: number];
}>();

// Composable de lazy loading
const {
  registerImage,
  observeImage,
  getImageData,
  generatePlaceholder
} = useLazyLoading({
  enableBlur: props.enableBlur,
  placeholderColor: props.placeholderColor,
  errorRetryCount: props.retryCount,
  enableWebP: true,
  preloadNext: 1
});

// Referencias
const imageRef = shallowRef<HTMLImageElement>();
const containerRef = shallowRef<HTMLElement>();

// Estado reactivo
const isLoaded = ref(false);
const hasError = ref(false);
const loadingProgress = ref(0);

// Registrar imagen en el composable
const imageData = computed(() => getImageData(props.src));

// Estilos computados
const containerClass = computed(() => [
  'lazy-image-container relative overflow-hidden',
  props.class
]);

const placeholderStyle = computed(() => ({
  backgroundColor: props.placeholderColor,
  backgroundImage: `url("${generatePlaceholder(400, 300)}")`,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center'
}));

const errorPlaceholderStyle = computed(() => ({
  backgroundColor: props.placeholderColor,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '200px'
}));

const imageClass = computed(() => [
  'lazy-image transition-opacity duration-300',
  {
    'opacity-100': isLoaded.value,
    'opacity-0': !isLoaded.value
  }
]);

const imageStyle = computed(() => ({
  width: '100%',
  height: 'auto'
}));

// Handlers
const onImageLoad = (event: Event) => {
  isLoaded.value = true;
  hasError.value = false;
  loadingProgress.value = 100;
  emit('load', event);
};

const onImageError = (event: Event) => {
  hasError.value = true;
  isLoaded.value = false;
  const error = new Error(`Failed to load image: ${props.src}`);
  emit('error', error);
};

// Simular progreso de carga
const simulateProgress = () => {
  if (hasError.value || isLoaded.value) return;
  
  const interval = setInterval(() => {
    if (hasError.value || isLoaded.value) {
      clearInterval(interval);
      return;
    }
    
    loadingProgress.value = Math.min(loadingProgress.value + Math.random() * 15, 90);
    emit('progress', loadingProgress.value);
  }, 200);
  
  return interval;
};

// Watch para cambios en src
watch(() => props.src, (newSrc, oldSrc) => {
  if (newSrc !== oldSrc) {
    isLoaded.value = false;
    hasError.value = false;
    loadingProgress.value = 0;
    
    if (newSrc) {
      registerImage(newSrc, props.alt);
      if (imageRef.value) {
        observeImage(imageRef.value, newSrc);
      }
      
      if (props.showProgressBar) {
        simulateProgress();
      }
    }
  }
}, { immediate: true });

onMounted(() => {
  if (props.src) {
    registerImage(props.src, props.alt);
    
    if (imageRef.value) {
      observeImage(imageRef.value, props.src);
    }
    
    if (props.showProgressBar) {
      simulateProgress();
    }
  }
});

// Observar cuando el elemento img esté disponible
watch(imageRef, (newElement) => {
  if (newElement && props.src) {
    observeImage(newElement, props.src);
  }
});
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
  background-color: var(--placeholder-color, #f3f4f6);
}

.lazy-placeholder {
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.placeholder-icon {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.progress-bar {
  width: 80%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  transition: width 0.3s ease;
  border-radius: 2px;
}

.error-placeholder {
  width: 100%;
  height: 100%;
  min-height: 200px;
  gap: 0.5rem;
}

.error-icon {
  margin-bottom: 0.5rem;
}

.lazy-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

/* Animación de pulse para el placeholder */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

/* Optimizaciones de performance */
.lazy-image-container {
  contain: layout style;
  will-change: contents;
}

.lazy-image {
  will-change: opacity;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .lazy-placeholder {
    min-height: 150px;
  }
  
  .placeholder-icon svg,
  .error-icon svg {
    width: 1.5rem;
    height: 1.5rem;
  }
}
</style> 