<template>
  <div class="news-list container mx-auto py-8 px-4">
    <!-- Estado inicial de carga -->
    <div v-if="newsStore.isLoading && newsStore.newsList.length === 0" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">Cargando noticias...</p>
    </div>
    
    <!-- Estado de error inicial -->
    <div v-else-if="newsStore.error && newsStore.newsList.length === 0" class="text-center text-red-500 py-12">
      <svg class="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <p class="text-lg font-medium">Error al cargar noticias</p>
      <p class="text-sm mt-2">{{ newsStore.error }}</p>
      <button 
        @click="retryLoad" 
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Intentar de nuevo
      </button>
    </div>
    
    <!-- Estado sin noticias -->
    <div v-else-if="newsStore.newsList.length === 0 && !newsStore.isLoading" class="text-center py-12">
      <svg class="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
      <p class="text-gray-600 dark:text-gray-400">No hay noticias disponibles.</p>
    </div>
    
    <!-- Lista de noticias -->
    <div v-else class="space-y-6">
      <transition-group name="news-list" tag="div" class="space-y-6">
        <NewsItem 
          v-for="noticia in newsStore.newsList" 
          :key="noticia.id" 
          :noticia="noticia"
          class="news-item-container"
        />
      </transition-group>
    </div>
    
    <!-- Indicador de carga para más noticias -->
    <div v-if="newsStore.isLoading && newsStore.newsList.length > 0" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Cargando más noticias...</p>
    </div>
    
    <!-- Mensaje de fin de contenido -->
    <div v-if="!newsStore.hasMoreNews && newsStore.newsList.length > 0" class="text-center py-8">
      <div class="border-t border-gray-200 dark:border-gray-700 pt-8">
        <svg class="h-8 w-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <p class="text-gray-500 dark:text-gray-400">Has visto todas las noticias disponibles</p>
      </div>
    </div>
    
    <!-- Elemento invisible para detectar scroll -->
    <div 
      ref="scrollSentinel" 
      class="h-4 w-full"
      :class="{ 'opacity-50': newsStore.isLoading }"
    >
      <!-- Indicador visual opcional para debug -->
      <div v-if="showDebugInfo" class="text-xs text-center text-gray-400">
        📄 Trigger Zone ({{ newsStore.hasMoreNews ? 'Activo' : 'Inactivo' }})
      </div>
    </div>

    <!-- Componente de debug (solo en desarrollo) -->
    <InfiniteScrollDebug 
      v-if="showDebugPanel"
      :is-initialized="isInitialized"
      :is-observing="isObserving"
      :scroll-sentinel="scrollSentinel"
      :on-reconnect="reconnect"
      :on-refresh="refreshNews"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch, nextTick } from 'vue';
import { useNewsStore } from '@/store/news';
import { useInfiniteScroll } from '@/composables/useInfiniteScroll';
import { useRoute } from 'vue-router';
import NewsItem from './NewsItem.vue';
import InfiniteScrollDebug from '@/components/debug/InfiniteScrollDebug.vue';

const newsStore = useNewsStore();
const route = useRoute();

// Configuración de debug (puedes cambiar a false en producción)
const showDebugInfo = ref(false);
const showDebugPanel = ref(false);

// Estado de inicialización
const isInitialized = ref(false);
const retryCount = ref(0);

// Configurar infinite scroll usando el composable
const { target: scrollSentinel, reconnect, isObserving } = useInfiniteScroll(
  async () => {
    if (newsStore.hasMoreNews && !newsStore.isLoading && isInitialized.value) {
      console.log('🔄 Infinite scroll activado - Cargando más noticias...');
      await newsStore.fetchNoticias();
    }
  },
  {
    rootMargin: '150px', // Cargar antes de llegar al final
    threshold: 0.1,
    enabled: computed(() => newsStore.hasMoreNews && !newsStore.isLoading && isInitialized.value),
    debug: true // Habilitar debug para diagnosticar el problema
  }
);

async function retryLoad() {
  console.log('🔄 Reintentando carga...');
  retryCount.value++;
  newsStore.resetNewsState();
  isInitialized.value = false;
  await loadInitialNews();
}

async function loadInitialNews() {
  try {
    console.log('📰 Iniciando carga de noticias...');
    
    // Resetear estado si es necesario
    if (newsStore.newsList.length === 0 || retryCount.value > 0) {
      await newsStore.fetchNoticias(1, 12); // Carga inicial con más elementos
    }
    
    // Marcar como inicializado después de la primera carga
    isInitialized.value = true;
    console.log('✅ Inicialización completa');
    
    // Reconectar el observer después de la inicialización
    await nextTick();
    reconnect();
    
  } catch (error) {
    console.error('❌ Error en carga inicial:', error);
    isInitialized.value = false;
  }
}

// Función para refresh manual (puede ser útil para pull-to-refresh en móvil)
async function refreshNews() {
  console.log('🔄 Refrescando noticias...');
  isInitialized.value = false;
  newsStore.resetNewsState();
  await newsStore.fetchNoticias(1, 12);
  isInitialized.value = true;
  await nextTick();
  reconnect();
}

// Watcher para detectar cambios en la ruta y reinicializar si es necesario
watch(() => route.path, async (newPath, oldPath) => {
  console.log('🛤️ Cambio de ruta detectado:', oldPath, '->', newPath);
  
  // Si venimos de otra página a la home, asegurar que está inicializado
  if (newPath === '/' && oldPath && oldPath !== '/') {
    console.log('🏠 Regresando a home, verificando inicialización...');
    
    // Pequeño delay para que el DOM se actualice
    await nextTick();
    
    if (!isInitialized.value || newsStore.newsList.length === 0) {
      await loadInitialNews();
    } else {
      // Reconectar el observer en caso de que se haya perdido
      reconnect();
    }
  }
});

// Watcher para reconectar cuando haya noticias disponibles
watch(() => newsStore.newsList.length, async (newLength) => {
  if (newLength > 0 && isInitialized.value) {
    await nextTick();
    reconnect();
  }
});

onMounted(async () => {
  console.log('🚀 NewsList montado en ruta:', route.path);
  
  // Habilitar debug panel solo en desarrollo
  showDebugPanel.value = import.meta.env.DEV;
  
  // Asegurar que el store esté en estado limpio en refresh
  if (performance.navigation && (performance.navigation as any).type === 1) { // 1 = reload/refresh
    console.log('🔄 Refresh detectado, limpiando estado...');
    newsStore.resetNewsState();
  }
  
  await loadInitialNews();
});

// Exponer funciones para uso externo si es necesario
defineExpose({
  refreshNews,
  retryLoad,
  isInitialized
});
</script>

<style scoped>
.news-list {
  padding-top: 80px; /* Ajustar según la altura del header fijo */
}

/* Transiciones para las noticias */
.news-list-enter-active {
  transition: all 0.5s ease-out;
}

.news-list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.news-list-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.news-item-container {
  transition: all 0.3s ease;
}

/* Optimización de performance para animaciones */
.news-item-container {
  will-change: transform, opacity;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .news-list {
    padding-top: 70px;
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style> 