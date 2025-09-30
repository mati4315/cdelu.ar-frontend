<template>
  <div class="feed-skeleton-item bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 mb-4 shadow-sm animate-pulse" style="min-height: 180px; contain: layout;">
    <!-- Header con tipo y metadatos -->
    <div class="skeleton-header mb-4">
      <div class="skeleton-type bg-gray-200 dark:bg-gray-600 rounded-full w-20 h-6 mb-2"></div>
      <div class="skeleton-meta bg-gray-200 dark:bg-gray-600 rounded w-32 h-4"></div>
    </div>
    
    <!-- Título -->
    <div class="skeleton-title mb-3">
      <div class="bg-gray-200 dark:bg-gray-600 rounded h-7 w-full mb-2"></div>
      <div class="bg-gray-200 dark:bg-gray-600 rounded h-7 w-3/4"></div>
    </div>
    
    <!-- Descripción -->
    <div class="skeleton-description mb-4">
      <div class="bg-gray-200 dark:bg-gray-600 rounded h-4 w-full mb-2"></div>
      <div class="bg-gray-200 dark:bg-gray-600 rounded h-4 w-full mb-2"></div>
      <div class="bg-gray-200 dark:bg-gray-600 rounded h-4 w-2/3"></div>
    </div>
    
    <!-- Imagen (opcional) -->
    <div v-if="showImage" class="skeleton-image bg-gray-200 dark:bg-gray-600 rounded-lg h-48 mb-4"></div>
    
    <!-- Footer con estadísticas y acciones -->
    <div class="skeleton-footer flex justify-between items-center">
      <div class="skeleton-stats flex gap-4">
        <div class="bg-gray-200 dark:bg-gray-600 rounded w-16 h-5"></div>
        <div class="bg-gray-200 dark:bg-gray-600 rounded w-20 h-5"></div>
      </div>
      <div class="skeleton-actions flex gap-2">
        <div class="bg-gray-200 dark:bg-gray-600 rounded w-8 h-8"></div>
        <div class="bg-gray-200 dark:bg-gray-600 rounded w-8 h-8"></div>
        <div class="bg-gray-200 dark:bg-gray-600 rounded w-8 h-8"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  showImage?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

withDefaults(defineProps<Props>(), {
  showImage: true,
  variant: 'default'
});
</script>

<style scoped>
.feed-skeleton-item {
  /* Optimización: usar will-change para animaciones suaves */
  will-change: opacity;
  contain: layout style;
}

/* Animación de pulse optimizada */
@keyframes skeleton-pulse {
  0%, 100% { 
    opacity: 1; 
  }
  50% { 
    opacity: 0.7; 
  }
}

.animate-pulse {
  animation: skeleton-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Variant compact */
.feed-skeleton-item.compact {
  padding: 1rem;
  margin-bottom: 0.5rem;
}

.feed-skeleton-item.compact .skeleton-image {
  height: 8rem;
}

/* Dark mode optimizations */
.dark .skeleton-type,
.dark .skeleton-meta,
.dark .skeleton-title > div,
.dark .skeleton-description > div,
.dark .skeleton-image,
.dark .skeleton-stats > div,
.dark .skeleton-actions > div {
  background-color: #4B5563;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .feed-skeleton-item {
    padding: 1rem;
    margin-bottom: 0.75rem;
  }
  
  .skeleton-image {
    height: 12rem;
  }
}
</style> 