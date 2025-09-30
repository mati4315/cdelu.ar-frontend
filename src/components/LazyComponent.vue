<!-- Componente para lazy loading de componentes pesados -->
<template>
  <div ref="container">
    <div v-if="!isVisible" class="lazy-placeholder">
      <div class="skeleton-loader">
        <slot name="skeleton">
          <!-- Loading skeleton por defecto -->
          <div class="animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div class="h-32 bg-gray-200 rounded"></div>
          </div>
        </slot>
      </div>
    </div>
    
    <component 
      v-else 
      :is="component" 
      v-bind="$attrs"
      @component-loaded="$emit('loaded')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import type { Component } from 'vue';

interface Props {
  component: Component | (() => Promise<Component>);
  rootMargin?: string;
  threshold?: number;
}

const props = withDefaults(defineProps<Props>(), {
  rootMargin: '50px',
  threshold: 0.1
});

defineEmits<{
  loaded: []
}>();

const container = ref<HTMLElement>();
const isVisible = ref(false);
let observer: IntersectionObserver | null = null;

// Cargar componente lazy si es función
const component = typeof props.component === 'function' 
  ? defineAsyncComponent({
      loader: props.component as () => Promise<Component>,
      delay: 200,
      timeout: 10000,
      errorComponent: () => import('@/components/ui/ErrorState.vue'),
      loadingComponent: {
        template: '<div class="animate-pulse bg-gray-200 h-32 rounded"></div>'
      }
    })
  : props.component;

onMounted(() => {
  if (!container.value) return;
  
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true;
          observer?.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: props.rootMargin,
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
.lazy-placeholder {
  min-height: 100px;
}

.skeleton-loader {
  padding: 1rem;
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
