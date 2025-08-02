<template>
  <article class="feed-ad-item bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
    <!-- Header del anuncio -->
    <div class="ad-header flex items-center justify-between mb-3">
      <div class="ad-badge flex items-center space-x-2">
        <span class="ad-icon text-purple-600">📢</span>
        <span class="ad-label text-sm font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
          Publicidad
        </span>
        <span v-if="ad.categoria" class="category-badge text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
          {{ ad.categoria }}
        </span>
      </div>
      <div class="ad-priority text-xs text-gray-500">
        Prioridad: {{ ad.prioridad }}
      </div>
    </div>

    <!-- Contenido del anuncio -->
    <div class="ad-content">
      <!-- Título -->
      <h3 class="ad-title text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {{ ad.titulo }}
      </h3>

      <!-- Descripción -->
      <p v-if="ad.descripcion" class="ad-description text-gray-700 mb-3 line-clamp-3">
        {{ ad.descripcion }}
      </p>

      <!-- Texto opcional -->
      <p v-if="ad.texto_opcional" class="ad-optional-text text-sm text-purple-600 font-medium mb-3">
        {{ ad.texto_opcional }}
      </p>

      <!-- Imagen -->
      <div v-if="ad.image_url" class="ad-image-container mb-3">
        <img 
          :src="ad.image_url" 
          :alt="ad.titulo"
          class="ad-image w-full h-48 object-cover rounded-lg shadow-sm"
          @load="handleImageLoad"
          @error="handleImageError"
        />
      </div>

      <!-- Estadísticas del anuncio -->
      <div class="ad-stats flex items-center justify-between text-xs text-gray-500 mb-3">
        <div class="stats-left flex space-x-4">
          <span class="impressions">
            👁️ {{ ad.impresiones_actuales }}/{{ ad.impresiones_maximas }}
          </span>
          <span class="clicks">
            🖱️ {{ ad.clics_count }} clics
          </span>
        </div>
        <div class="stats-right">
          <span class="ctr" v-if="ad.impresiones_actuales > 0">
            CTR: {{ ((ad.clics_count / ad.impresiones_actuales) * 100).toFixed(1) }}%
          </span>
        </div>
      </div>

      <!-- Botón de acción -->
      <div class="ad-action">
        <a 
          :href="ad.enlace_destino" 
          target="_blank" 
          rel="noopener noreferrer"
          @click="handleAdClick"
          class="ad-button w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>Ver más</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
        </a>
      </div>
    </div>

    <!-- Footer del anuncio -->
    <div class="ad-footer mt-3 pt-3 border-t border-purple-100">
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span class="ad-date">
          {{ formatDate(ad.created_at) }}
        </span>
        <span class="ad-status" :class="ad.activo ? 'text-green-600' : 'text-red-600'">
          {{ ad.activo ? 'Activo' : 'Inactivo' }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import type { Ad } from '@/types/ads';

// Props
interface Props {
  ad: Ad;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  impression: [ad: Ad];
  click: [ad: Ad];
}>();

// Métodos
const handleImageLoad = () => {
  // Registrar impresión cuando la imagen se carga
  emit('impression', props.ad);
};

const handleImageError = () => {
  console.warn('Error cargando imagen del anuncio:', props.ad.id);
};

const handleAdClick = () => {
  // Registrar clic cuando se hace click en el anuncio
  emit('click', props.ad);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Registrar impresión al montar el componente
onMounted(() => {
  emit('impression', props.ad);
});
</script>

<style scoped>
.feed-ad-item {
  position: relative;
  overflow: hidden;
}

.feed-ad-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #8b5cf6, #3b82f6);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ad-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

/* Animación de entrada */
.feed-ad-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .feed-ad-item {
    margin: 0.5rem;
    padding: 0.75rem;
  }
  
  .ad-title {
    font-size: 1rem;
  }
  
  .ad-image {
    height: 32;
  }
}
</style> 