<!-- Lazy loading ultra-optimizado para componentes críticos -->
<template>
  <div ref="container" class="critical-lazy-container">
    <!-- Mostrar skeleton hasta que sea visible -->
    <div v-if="!hasLoaded && !isVisible" class="lazy-skeleton">
      <slot name="skeleton">
        <div class="animate-pulse bg-gray-200 rounded h-32"></div>
      </slot>
    </div>
    
    <!-- Loading state cuando está cargando -->
    <div v-else-if="!hasLoaded && isVisible" class="loading-state">
      <div class="animate-pulse bg-gray-100 rounded h-32 flex items-center justify-center">
        <div class="text-gray-500">Cargando...</div>
      </div>
    </div>
    
    <!-- Componente real una vez cargado -->
    <component 
      v-else-if="hasLoaded && component" 
      :is="component" 
      v-bind="$attrs"
      @component-ready="$emit('ready')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { Component } from 'vue';

interface Props {
  componentLoader: () => Promise<{ default: Component }>;
  triggerMargin?: string;
  threshold?: number;
  immediate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  triggerMargin: '100px',
  threshold: 0.1,
  immediate: false
});

defineEmits<{
  ready: []
}>();

const container = ref<HTMLElement>();
const isVisible = ref(props.immediate);
const hasLoaded = ref(false);
const component = ref<Component | null>(null);

let observer: IntersectionObserver | null = null;

const loadComponent = async () => {
  if (hasLoaded.value) return;
  
  try {
    const componentModule = await props.componentLoader();
    component.value = componentModule.default;
    hasLoaded.value = true;
  } catch (error) {
    console.error('Error loading component:', error);
    // Fallback: mostrar error state
    hasLoaded.value = true;
  }
};

onMounted(() => {
  if (props.immediate) {
    loadComponent();
    return;
  }
  
  if (!container.value) return;
  
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isVisible.value) {
          isVisible.value = true;
          loadComponent();
          observer?.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: props.triggerMargin,
      threshold: props.threshold
    }
  );
  
  observer.observe(container.value);
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
.critical-lazy-container {
  min-height: 50px;
}

.lazy-skeleton,
.loading-state {
  min-height: inherit;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
