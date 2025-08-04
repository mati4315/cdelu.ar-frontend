<template>
  <article class="feed-lottery-ad-item bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
    <!-- Header del anuncio de lotería -->
    <div class="ad-header flex items-center justify-between mb-3">
      <div class="ad-badge flex items-center space-x-2">
        <span class="ad-icon text-yellow-600">🎰</span>
        <span class="ad-label text-sm font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
          Lotería Especial
        </span>
        <span class="category-badge text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
          {{ ad.categoria }}
        </span>
      </div>
      <div class="ad-priority text-xs text-gray-500">
        Prioridad: {{ ad.prioridad }}
      </div>
    </div>

    <!-- Contenido del anuncio de lotería -->
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
      <p v-if="ad.texto_opcional" class="ad-optional-text text-sm text-yellow-600 font-medium mb-3">
        {{ ad.texto_opcional }}
      </p>

      <!-- Imagen de la lotería -->
      <div v-if="ad.image_url" class="ad-image-container mb-3">
        <img 
          :src="ad.image_url" 
          :alt="ad.titulo"
          class="ad-image w-full h-48 object-cover rounded-lg shadow-sm"
          @load="handleImageLoad"
          @error="handleImageError"
        />
      </div>

      <!-- Información específica de la lotería -->
      <div v-if="lotteryData" class="lottery-info mb-3">
        <div class="lottery-stats grid grid-cols-2 gap-4 text-sm">
          <div class="stat-item">
            <span class="stat-label text-gray-600">Tickets vendidos:</span>
            <span class="stat-value font-semibold">{{ lotteryData.tickets_sold }}/{{ lotteryData.max_tickets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label text-gray-600">Ganadores:</span>
            <span class="stat-value font-semibold">{{ lotteryData.num_winners }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label text-gray-600">Precio:</span>
            <span class="stat-value font-semibold" :class="lotteryData.is_free ? 'text-green-600' : 'text-blue-600'">
              {{ lotteryData.is_free ? 'Gratis' : `$${lotteryData.ticket_price}` }}
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label text-gray-600">Finaliza:</span>
            <span class="stat-value font-semibold">{{ formatEndDate(lotteryData.end_date) }}</span>
          </div>
        </div>

        <!-- Progreso de la lotería -->
        <div class="lottery-progress mt-3">
          <div class="progress-bar bg-gray-200 rounded-full h-2">
            <div 
              class="progress-fill bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
          <div class="progress-text text-xs text-gray-500 mt-1">
            {{ lotteryData.tickets_sold }} de {{ lotteryData.max_tickets }} tickets vendidos
          </div>
        </div>
      </div>

      <!-- Estado de participación del usuario -->
      <div v-if="lotteryData" class="user-participation mb-3">
        <div v-if="lotteryData.user_participated" class="participated-info bg-green-50 border border-green-200 rounded-lg p-3">
          <div class="flex items-center space-x-2 mb-2">
            <span class="text-green-600">✅</span>
            <span class="text-sm font-medium text-green-800">Ya participaste</span>
          </div>
          <div class="ticket-numbers text-sm text-green-700">
            <span class="font-medium">Tus números:</span>
            <span class="ml-1">{{ lotteryData.user_ticket_numbers?.join(', ') || 'N/A' }}</span>
          </div>
        </div>
        <div v-else class="not-participated-info bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div class="flex items-center space-x-2">
            <span class="text-blue-600">🎯</span>
            <span class="text-sm font-medium text-blue-800">¡Aún no participas!</span>
          </div>
        </div>
      </div>

      <!-- Botón de acción dinámico -->
      <div class="ad-action">
        <router-link 
          :to="ad.enlace_destino"
          @click="handleAdClick"
          class="ad-button w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium py-3 px-4 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>{{ actionButtonText }}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
        </router-link>
      </div>
    </div>

    <!-- Footer del anuncio -->
    <div class="ad-footer mt-3 pt-3 border-t border-yellow-100">
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span class="ad-date">
          {{ formatDate(ad.created_at) }}
        </span>
        <span class="ad-status text-green-600">
          Activo
        </span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { Ad, LotteryAdData } from '@/types/ads';

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

// Computed
const lotteryData = computed((): LotteryAdData | null => {
  return props.ad.datos_especiales || null;
});

const progressPercentage = computed((): number => {
  if (!lotteryData.value) return 0;
  const sold = lotteryData.value.tickets_sold || 0;
  const max = lotteryData.value.max_tickets || 1;
  return Math.round((sold / max) * 100);
});

const actionButtonText = computed((): string => {
  if (!lotteryData.value) return 'Ver más';
  
  if (lotteryData.value.user_participated) {
    return 'Ver mi número';
  } else {
    return 'Participar';
  }
});

// Métodos
const handleImageLoad = () => {
  // Registrar impresión cuando la imagen se carga
  emit('impression', props.ad);
};

const handleImageError = () => {
  console.warn('Error cargando imagen del anuncio de lotería:', props.ad.id);
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

const formatEndDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff <= 0) return 'Finalizada';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return 'Pronto';
};

// Registrar impresión al montar el componente
onMounted(() => {
  emit('impression', props.ad);
});
</script>

<style scoped>
.feed-lottery-ad-item {
  position: relative;
  overflow: hidden;
}

.feed-lottery-ad-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #f59e0b, #ea580c);
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
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

/* Animación de entrada */
.feed-lottery-ad-item {
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
  .feed-lottery-ad-item {
    margin: 0.5rem;
    padding: 0.75rem;
  }
  
  .ad-title {
    font-size: 1rem;
  }
  
  .ad-image {
    height: 32;
  }
  
  .lottery-stats {
    grid-template-columns: 1fr;
  }
}
</style> 