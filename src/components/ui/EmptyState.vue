<template>
  <div class="empty-state bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12">
    <div class="text-center max-w-md mx-auto">
      <!-- Icono animado -->
      <div class="empty-icon-wrapper mb-6">
        <div class="empty-icon text-6xl animate-float">
          {{ getEmptyIcon(variant) }}
        </div>
      </div>
      
      <!-- Título -->
      <h3 class="empty-title text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
        {{ title || getEmptyTitle(variant) }}
      </h3>
      
      <!-- Mensaje -->
      <p class="empty-message text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
        {{ message || getEmptyMessage(variant) }}
      </p>
      
      <!-- Acciones -->
      <div v-if="showAction || $slots.action" class="empty-actions">
        <slot name="action">
          <button 
            v-if="showAction"
            @click="handleAction"
            class="action-btn bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 inline-flex items-center gap-2"
          >
            <svg v-if="actionIcon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="actionIcon" />
            </svg>
            {{ actionText }}
          </button>
        </slot>
      </div>
      
      <!-- Sugerencias -->
      <div v-if="suggestions.length > 0" class="empty-suggestions mt-8">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Sugerencias:
        </h4>
        <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <li v-for="(suggestion, index) in suggestions" :key="index" class="flex items-start gap-2">
            <span class="text-blue-500 mt-0.5">•</span>
            {{ suggestion }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FeedTab } from '@/types/feed';

type EmptyVariant = 'general' | 'search' | 'filter' | 'network' | 'todo' | 'noticias' | 'comunidad';

interface Props {
  variant?: EmptyVariant;
  tab?: FeedTab;
  title?: string;
  message?: string;
  showAction?: boolean;
  actionText?: string;
  actionIcon?: string;
  suggestions?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'general',
  actionText: 'Refrescar',
  actionIcon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  suggestions: () => []
});

const emit = defineEmits<{
  action: [];
}>();

// Determinar variant basado en tab si se proporciona
const computedVariant = computed(() => {
  if (props.tab) {
    return props.tab as EmptyVariant;
  }
  return props.variant;
});

// Mapeo de variants a iconos
const getEmptyIcon = (variant: EmptyVariant): string => {
  const icons = {
    general: '📭',
    search: '🔍',
    filter: '🎯',
    network: '🌐',
    todo: '📋',
    noticias: '📰',
    comunidad: '👥'
  };
  return icons[variant] || icons.general;
};

// Mapeo de variants a títulos
const getEmptyTitle = (variant: EmptyVariant): string => {
  const titles = {
    general: 'No hay contenido disponible',
    search: 'Sin resultados',
    filter: 'Sin coincidencias',
    network: 'Sin conexión',
    todo: 'Feed vacío',
    noticias: 'Sin noticias',
    comunidad: 'Sin posts de comunidad'
  };
  return titles[variant] || titles.general;
};

// Mapeo de variants a mensajes
const getEmptyMessage = (variant: EmptyVariant): string => {
  const messages = {
    general: 'No se encontró contenido para mostrar en este momento.',
    search: 'No encontramos resultados para tu búsqueda. Intenta con otros términos.',
    filter: 'No hay elementos que coincidan con los filtros aplicados.',
    network: 'Verifica tu conexión a internet e inténtalo de nuevo.',
    todo: 'Aún no hay contenido en el feed. ¡Vuelve pronto para ver las novedades!',
    noticias: 'No hay noticias disponibles en este momento. ¡Vuelve pronto para estar al día!',
    comunidad: 'La comunidad está tranquila. ¡Sé el primero en compartir algo!'
  };
  return messages[variant] || messages.general;
};

const handleAction = () => {
  emit('action');
};

// Sugerencias por defecto basadas en variant
const defaultSuggestions = computed(() => {
  const suggestionMap = {
    search: [
      'Verifica la ortografía de los términos de búsqueda',
      'Intenta con palabras más generales',
      'Reduce el número de palabras clave'
    ],
    filter: [
      'Intenta quitar algunos filtros',
      'Amplía el rango de fechas',
      'Verifica que los filtros sean compatibles'
    ],
    network: [
      'Verifica tu conexión WiFi o datos móviles',
      'Intenta refrescar la página',
      'Contacta a tu proveedor de internet si persiste'
    ]
  };
  
  return suggestionMap[computedVariant.value as keyof typeof suggestionMap] || [];
});

// Usar sugerencias proporcionadas o por defecto
const suggestions = computed(() => {
  return props.suggestions.length > 0 ? props.suggestions : defaultSuggestions.value;
});
</script>

<style scoped>
.empty-state {
  /* Optimizaciones de performance */
  contain: layout style;
  will-change: transform;
}

.empty-icon-wrapper {
  /* Centrar y optimizar la animación del icono */
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.action-btn:active {
  transform: translateY(0);
}

/* Animación de flotación suave */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
  will-change: transform;
}

/* Optimizaciones para listas */
.empty-suggestions ul {
  contain: content;
}

.empty-suggestions li {
  transition: color 0.15s ease;
}

.empty-suggestions li:hover {
  color: rgb(59 130 246); /* blue-500 */
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .empty-state {
    padding: 2rem 1.5rem;
  }
  
  .empty-icon {
    font-size: 3rem;
  }
  
  .empty-title {
    font-size: 1.5rem;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
}

/* Dark mode específico */
.dark .empty-suggestions li:hover {
  color: rgb(96 165 250); /* blue-400 */
}
</style> 