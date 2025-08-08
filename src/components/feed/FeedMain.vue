<template>
  <div class="feed-main">
    <!-- Header con estadísticas (opcional) -->
    <div v-if="showStats && stats" class="feed-header">
      <div class="stats-container">
        <div class="stat-card">
          <span class="stat-icon">📊</span>
          <div class="stat-info">
            <span class="stat-number">{{ stats.total }}</span>
            <span class="stat-label">Total de contenido</span>
          </div>
        </div>
        
        <div class="stat-card">
          <span class="stat-icon">📰</span>
          <div class="stat-info">
            <span class="stat-number">{{ stats.by_type.news.count }}</span>
            <span class="stat-label">Noticias</span>
          </div>
        </div>
        
        <div class="stat-card">
          <span class="stat-icon">👥</span>
          <div class="stat-info">
            <span class="stat-number">{{ stats.by_type.community.count }}</span>
            <span class="stat-label">Comunidad</span>
          </div>
        </div>
        
        <button 
          @click="handleRefresh" 
          class="refresh-btn"
          :disabled="isLoading"
          title="Actualizar contenido"
        >
          <span class="refresh-icon" :class="{ spinning: isLoading }">🔄</span>
        </button>
      </div>
    </div>
    
    <!-- Encuestas Activas -->
    <div class="container mx-auto px-4 py-4">
      <HomeActiveSurveys />
    </div>
    
    <!-- Pestañas -->
    <FeedTabs 
      :current-tab="currentTab"
      :stats="stats"
      :is-loading="isLoading"
      @tab-change="handleTabChange"
    />
    
    <!-- Contenido del feed -->
    <div class="feed-content" ref="feedContentRef">
      <!-- Loading inicial -->
      <div v-if="isLoading && currentContent.length === 0" class="feed-skeleton">
        <div v-for="i in 3" :key="i" class="skeleton-item">
          <div class="skeleton-header">
            <div class="skeleton-type"></div>
            <div class="skeleton-meta"></div>
          </div>
          <div class="skeleton-title"></div>
          <div class="skeleton-description"></div>
          <div class="skeleton-image"></div>
          <div class="skeleton-footer">
            <div class="skeleton-stats"></div>
            <div class="skeleton-actions"></div>
          </div>
        </div>
      </div>
      
      <!-- Error -->
      <div v-else-if="error" class="feed-error">
        <div class="error-content">
          <span class="error-icon">❌</span>
          <h3 class="error-title">Error al cargar el contenido</h3>
          <p class="error-message">{{ error }}</p>
          <button @click="handleRetry" class="retry-btn">
            Reintentar
          </button>
        </div>
      </div>
      
      <!-- Lista de items -->
      <div v-else class="feed-list">
        <!-- Mensaje cuando no hay contenido -->
        <div v-if="currentContent.length === 0 && !isLoading" class="empty-state">
          <span class="empty-icon">📭</span>
          <h3 class="empty-title">No hay contenido disponible</h3>
          <p class="empty-message">
            No se encontró contenido en la pestaña "{{ getTabLabel(currentTab) }}".
          </p>
          <button @click="handleRefresh" class="refresh-btn">
            Actualizar
          </button>
        </div>
        
        <!-- Items del feed -->
        <div 
          v-else
          class="feed-items"
        >
          <template v-for="(item, index) in currentContent" :key="`${item.type}-${item.id}`">
            <!-- Contenido normal -->
            <FeedItem
              v-if="!item.is_ad"
              :item="item"
              :show-actions="true"
              @item-click="handleItemClick"
              @like="handleLike"
              @comments="handleComments"
              @share="handleShare"
            />
            
            <!-- Anuncio -->
            <FeedAdItem
              v-else
              :ad="item as unknown as Ad"
              @impression="handleAdImpression"
              @click="handleAdClick"
            />
            
            <!-- Insertar anuncios cada 4-7 posts -->
            <FeedLotteryAdItem
              v-if="shouldInsertAd(index) && getRandomAd() && isLotteryAd(getRandomAd()!)"
              :ad="getRandomAd()!"
              @impression="handleAdImpression"
              @click="handleAdClick"
            />
            <FeedAdItem
              v-else-if="shouldInsertAd(index) && getRandomAd()"
              :ad="getRandomAd()!"
              @impression="handleAdImpression"
              @click="handleAdClick"
            />
          </template>
        </div>
        
        <!-- Loading para infinite scroll -->
        <div v-if="isInfiniteLoading" class="infinite-loading">
          <div class="loading-spinner"></div>
          <span>Cargando más contenido...</span>
        </div>
        
        <!-- Indicador de fin de contenido -->
        <div v-else-if="!currentPagination?.hasMore && currentContent.length > 0" class="end-of-content">
          <span class="end-icon">🎉</span>
          <p>Has visto todo el contenido disponible</p>
        </div>
        
        <!-- Observer para infinite scroll -->
        <div 
          v-if="enableInfiniteScroll"
          ref="infiniteScrollTrigger" 
          class="scroll-trigger"
          :data-has-more="currentPagination?.hasMore"
          :data-ready="isReadyForInfiniteScroll"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useFeedStore } from '@/store/feedStore';
import { useAds, useAdsWithLottery } from '@/composables/useAds';
import FeedTabs from './FeedTabs.vue';
import FeedItem from './FeedItem.vue';
import FeedAdItem from './FeedAdItem.vue';
import FeedLotteryAdItem from './FeedLotteryAdItem.vue';
import HomeActiveSurveys from '../survey/HomeActiveSurveys.vue';
import type { FeedMainProps, FeedItem as FeedItemType, FeedTab } from '@/types/feed';
import type { Ad } from '@/types/ads';

interface Props extends FeedMainProps {}

const props = withDefaults(defineProps<Props>(), {
  initialTab: 'todo',
  pageSize: 10,
  showStats: true,
  enableInfiniteScroll: true
});

// Router y Route
const router = useRouter();
const route = useRoute();

// Store y refs reactivos
const feedStore = useFeedStore();
const { 
  currentTab, 
  currentContent, 
  isLoading, 
  isInfiniteLoading, 
  stats, 
  error,
  pagination,
  isReadyForInfiniteScroll
} = storeToRefs(feedStore);

// Hook de publicidad con lotería
const { 
  activeAds, 
  loadActiveAds, 
  registerImpression, 
  registerClick,
  adsWithLottery,
  isLotteryAd,
  initializeAdsWithLottery
} = useAdsWithLottery();

// Refs para infinite scroll
const infiniteScrollTrigger = ref<HTMLElement | null>(null);
const intersectionObserver = ref<IntersectionObserver | null>(null);
const feedContentRef = ref<HTMLElement | null>(null);

// Refs para manejo de scroll por pestaña
const scrollPositions = ref<Record<FeedTab, number>>({
  todo: 0,
  noticias: 0,
  comunidad: 0
});
const isRestoringScroll = ref(false);
const scrollSaveTimeout = ref<number | null>(null);

// Computed
const getTabLabel = (tab: FeedTab): string => {
  const labels = {
    'todo': 'Todo',
    'noticias': 'Noticias', 
    'comunidad': 'Comunidad'
  };
  return labels[tab];
};

// Computed para obtener la paginación de la pestaña actual
const currentPagination = computed(() => {
  return pagination.value[currentTab.value];
});

// Función para obtener pestaña desde URL
const getTabFromUrl = (): FeedTab => {
  const urlTab = route.query.tab as string;
  console.log(`🔗 [FEED MAIN] Tab desde URL: ${urlTab}`);
  
  // Validar que la pestaña sea válida
  if (urlTab && ['todo', 'noticias', 'comunidad'].includes(urlTab)) {
    return urlTab as FeedTab;
  }
  
  // Por defecto, usar la pestaña inicial
  return props.initialTab;
};

// Event handlers
const handleTabChange = async (tab: FeedTab) => {
  console.log(`🔄 [FEED MAIN] Tab change requested: ${tab}`);
  
  // Guardar posición de scroll de la pestaña actual antes de cambiar
  saveScrollPosition();
  
  // Actualizar URL con query parameter
  try {
    await router.push({
      path: route.path,
      query: {
        ...route.query,
        tab: tab
      }
    });
    console.log(`🔗 [FEED MAIN] URL actualizada con tab=${tab}`);
  } catch (error) {
    console.warn('⚠️ [FEED MAIN] Error al actualizar URL:', error);
  }
  
  // Cambiar pestaña en el store
  await feedStore.switchTab(tab);
  
  // Restaurar posición de scroll para la nueva pestaña
  restoreScrollPosition(tab);
};

// Función para sincronizar pestaña desde URL
const syncTabFromUrl = async () => {
  const urlTab = getTabFromUrl();
  
  // Solo cambiar si es diferente de la pestaña actual
  if (urlTab !== currentTab.value) {
    console.log(`🔄 [FEED MAIN] Sincronizando pestaña desde URL: ${currentTab.value} -> ${urlTab}`);
    
    // Guardar posición actual antes de cambiar (si no estamos en carga inicial)
    if (currentTab.value) {
      saveScrollPosition();
    }
    
    await feedStore.switchTab(urlTab);
    
    // Restaurar posición para la nueva pestaña
    restoreScrollPosition(urlTab);
  }
};

const handleRefresh = async () => {
  console.log('🔄 [FEED MAIN] Refresh requested');
  await feedStore.refresh();
};

const handleRetry = async () => {
  console.log('🔄 [FEED MAIN] Retry requested');
  await feedStore.loadFeed(currentTab.value, true);
};

const handleItemClick = (item: FeedItemType) => {
  console.log('🖱️ [FEED MAIN] Item clicked:', item);
  // TODO: Navegar a detalle del item
  // router.push(`/feed/${item.type}/${item.original_id}`);
};

const handleLike = (item: FeedItemType) => {
  console.log('❤️ [FEED MAIN] Like clicked:', item);
  // Ya no necesitamos llamar toggleLike aquí porque FeedItem ya lo hace
  // El evento 'like' se emite DESPUÉS de que el like se procesa exitosamente
};

const handleComments = (item: FeedItemType) => {
  console.log('💬 [FEED MAIN] Comments clicked:', item);
  // TODO: Implementar modal de comentarios o navegación
  feedStore.getComments(item).then(comments => {
    console.log('Comentarios cargados:', comments);
    // Aquí puedes abrir un modal con los comentarios
  }).catch(error => {
    console.error('Error al cargar comentarios:', error);
  });
};

const handleShare = (item: FeedItemType) => {
  console.log('🔗 [FEED MAIN] Share clicked:', item);
  // TODO: Implementar funcionalidad de compartir
  if (navigator.share) {
    navigator.share({
      title: item.titulo,
      text: item.descripcion,
      url: window.location.href
    });
  } else {
    // Fallback: copiar al clipboard
    navigator.clipboard.writeText(window.location.href);
  }
};

// Métodos para manejar anuncios
const handleAdImpression = async (ad: Ad) => {
  console.log('👁️ [FEED MAIN] Ad impression:', ad.id);
  await registerImpression(ad.id);
};

const handleAdClick = async (ad: Ad) => {
  console.log('🖱️ [FEED MAIN] Ad click:', ad.id);
  await registerClick(ad.id);
};

// Lógica para insertar anuncios con lotería
const shouldInsertAd = (index: number): boolean => {
  // Insertar anuncio cada 4-7 posts con 30% de probabilidad
  const postsBetweenAds = 4 + Math.floor(Math.random() * 4); // 4-7
  const probability = 0.3;
  
  return index > 0 && 
         index % postsBetweenAds === 0 && 
         Math.random() < probability &&
         adsWithLottery.value.length > 0;
};

const getRandomAd = (): Ad | null => {
  if (adsWithLottery.value.length === 0) return null;
  
  // Priorizar anuncios de lotería (prioridad 3)
  const lotteryAds = adsWithLottery.value.filter(ad => ad.prioridad === 3);
  const regularAds = adsWithLottery.value.filter(ad => ad.prioridad !== 3);
  
  // 70% de probabilidad de mostrar anuncio de lotería si existe
  if (lotteryAds.length > 0 && Math.random() < 0.7) {
    const adIndex = Math.floor(Math.random() * lotteryAds.length);
    return lotteryAds[adIndex] || null;
  }
  
  // Si no hay anuncios de lotería o no se seleccionó, usar anuncios regulares
  if (regularAds.length > 0) {
    const adIndex = Math.floor(Math.random() * regularAds.length);
    return regularAds[adIndex] || null;
  }
  
  return null;
};

// Infinite scroll setup
const setupInfiniteScroll = () => {
  if (!props.enableInfiniteScroll) {
    console.log('⚠️ [FEED MAIN] Infinite scroll deshabilitado en props');
    return;
  }

  if (!infiniteScrollTrigger.value) {
    console.log('⚠️ [FEED MAIN] Trigger element no disponible');
    return;
  }

  console.log('♾️ [FEED MAIN] Configurando infinite scroll');
  console.log(`📊 [FEED MAIN] Estado actual - hasMore: ${currentPagination.value?.hasMore}, ready: ${isReadyForInfiniteScroll.value}`);

  // Limpiar observer anterior si existe
  destroyInfiniteScroll();

  intersectionObserver.value = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      const hasMore = currentPagination.value?.hasMore;
      const ready = isReadyForInfiniteScroll.value;
      
      console.log(`👀 [FEED MAIN] Intersection observed - isIntersecting: ${entry.isIntersecting}, hasMore: ${hasMore}, ready: ${ready}`);
      
      if (entry.isIntersecting && hasMore && ready) {
        console.log('♾️ [FEED MAIN] Cargando más contenido...');
        feedStore.loadMore();
      } else if (entry.isIntersecting && !hasMore) {
        console.log('🏁 [FEED MAIN] No hay más contenido para cargar');
      } else if (entry.isIntersecting && !ready) {
        console.log('⏳ [FEED MAIN] Sistema no listo para cargar más contenido');
      }
    },
    {
      root: null,
      rootMargin: '200px', // Cargar cuando esté a 200px del final
      threshold: 0.1
    }
  );

  intersectionObserver.value.observe(infiniteScrollTrigger.value);
  console.log('✅ [FEED MAIN] Infinite scroll observer configurado correctamente');
};

const destroyInfiniteScroll = () => {
  if (intersectionObserver.value) {
    console.log('🧹 [FEED MAIN] Limpiando infinite scroll observer');
    intersectionObserver.value.disconnect();
    intersectionObserver.value = null;
  }
};

// Watchers
watch(
  () => infiniteScrollTrigger.value,
  (newValue) => {
    if (newValue && props.enableInfiniteScroll) {
      setTimeout(setupInfiniteScroll, 100);
    }
  }
);

// Watcher para reconfigurar cuando cambie el estado de paginación
watch(
  () => currentPagination.value?.hasMore,
  (hasMore) => {
    console.log(`📊 [FEED MAIN] Paginación cambió - hasMore: ${hasMore}`);
    if (infiniteScrollTrigger.value && props.enableInfiniteScroll) {
      setTimeout(setupInfiniteScroll, 100);
    }
  }
);

// Watcher para detectar cambios en query parameters de la URL
watch(
  () => route.query.tab,
  async (newTab) => {
    console.log(`🔗 [FEED MAIN] Query parameter 'tab' cambió a: ${newTab}`);
    await syncTabFromUrl();
  }
);

// Watcher para detectar cambios en la ruta completa (útil para navegación hacia atrás)
watch(
  () => route.fullPath,
  async (newPath, oldPath) => {
    // Solo actuar si estamos en la página principal y venimos de otra página
    if (route.name === 'Home' && oldPath && oldPath !== newPath) {
      console.log(`🔙 [FEED MAIN] Navegación detectada - de: ${oldPath} a: ${newPath}`);
      await syncTabFromUrl();
    }
  }
);

// Funciones para manejo de scroll
const saveScrollPosition = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  scrollPositions.value[currentTab.value] = scrollTop;
  
  // Debounce para sessionStorage
  if (scrollSaveTimeout.value) {
    clearTimeout(scrollSaveTimeout.value);
  }
  
  scrollSaveTimeout.value = setTimeout(() => {
    try {
      const storageKey = `feedScrollPositions`;
      sessionStorage.setItem(storageKey, JSON.stringify(scrollPositions.value));
    } catch (error) {
      // Error guardando en sessionStorage
    }
  }, 300) as unknown as number; // Debounce de 300ms
};

const restoreScrollPosition = (tab: FeedTab) => {
  const savedPosition = scrollPositions.value[tab];
  
  if (savedPosition > 0) {
    isRestoringScroll.value = true;
    console.log(`📜 [SCROLL] Restaurando posición para ${tab}: ${savedPosition}px`);
    
    // Scroll instantáneo sin delay
    window.scrollTo({
      top: savedPosition,
      behavior: 'auto' // Sin animación para restauración
    });
    
    // Resetear flag inmediatamente
    isRestoringScroll.value = false;
  } else {
    console.log(`📜 [SCROLL] No hay posición guardada para ${tab}, mantener posición actual`);
  }
};

const loadScrollPositions = () => {
  try {
    const storageKey = `feedScrollPositions`;
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      const parsedPositions = JSON.parse(saved);
      scrollPositions.value = { ...scrollPositions.value, ...parsedPositions };
      console.log(`📂 [SCROLL] Posiciones cargadas desde sessionStorage:`, parsedPositions);
    }
  } catch (error) {
    console.log(`📂 [SCROLL] No se pudieron cargar posiciones desde sessionStorage`);
  }
};

// Lifecycle
onMounted(async () => {
  // Cargar posiciones de scroll guardadas
  loadScrollPositions();
  
  // Primero sincronizar con URL
  await syncTabFromUrl();
  
  // Si no hay pestaña en URL, establecer la inicial y actualizar URL
  if (!route.query.tab) {
    try {
      await router.replace({
        path: route.path,
        query: {
          ...route.query,
          tab: props.initialTab
        }
      });
    } catch (error) {
      console.warn('⚠️ Error al establecer tab inicial en URL:', error);
    }
  }
  
  // Cargar anuncios con lotería
  await initializeAdsWithLottery();
  
  // Cargar contenido y estadísticas
  await Promise.all([
    feedStore.loadFeed(currentTab.value, true),
    feedStore.loadStats()
  ]);
  
  // Configurar infinite scroll después de la carga inicial
  if (props.enableInfiniteScroll) {
    setTimeout(setupInfiniteScroll, 100);
  }
  
  // Añadir listener para guardar scroll antes de que el usuario navegue fuera
  const handleBeforeUnload = () => {
    saveScrollPosition();
  };
  
  // Listener para guardar scroll mientras navega
  const handleScroll = () => {
    if (!isRestoringScroll.value) {
      saveScrollPosition();
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Cleanup en unmount
  onUnmounted(() => {
    destroyInfiniteScroll();
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('scroll', handleScroll);
    
    // Limpiar timeout si existe
    if (scrollSaveTimeout.value) {
      clearTimeout(scrollSaveTimeout.value);
    }
  });
});
</script>

<style scoped>
.feed-main {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px 20px 20px; /* Sin padding-top, solo lateral y bottom */
  background: #f8f9fa;
  min-height: 100vh;
}

/* Header con estadísticas */
.feed-header {
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-container {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  flex: 1;
  min-width: 140px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #007bff;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.refresh-btn {
  padding: 12px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-btn:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-2px);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-icon {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

/* Contenido del feed */
.feed-content {
  background: white;
  border-radius: 0 0 16px 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* Estados de carga */
.feed-skeleton {
  padding: 20px;
}

.skeleton-item {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  animation: skeleton-pulse 1.5s ease-in-out infinite alternate;
}

.skeleton-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.skeleton-type {
  width: 80px;
  height: 24px;
  background: #e9ecef;
  border-radius: 12px;
}

.skeleton-meta {
  width: 150px;
  height: 24px;
  background: #e9ecef;
  border-radius: 12px;
}

.skeleton-title {
  width: 70%;
  height: 28px;
  background: #e9ecef;
  border-radius: 8px;
  margin-bottom: 12px;
}

.skeleton-description {
  width: 90%;
  height: 60px;
  background: #e9ecef;
  border-radius: 8px;
  margin-bottom: 16px;
}

.skeleton-image {
  width: 100%;
  height: 200px;
  background: #e9ecef;
  border-radius: 12px;
  margin-bottom: 16px;
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
}

.skeleton-stats {
  width: 120px;
  height: 24px;
  background: #e9ecef;
  border-radius: 12px;
}

.skeleton-actions {
  width: 160px;
  height: 24px;
  background: #e9ecef;
  border-radius: 12px;
}

/* Error state */
.feed-error {
  padding: 60px 20px;
  text-align: center;
}

.error-content {
  max-width: 400px;
  margin: 0 auto;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.error-title {
  font-size: 24px;
  font-weight: 600;
  color: #dc3545;
  margin-bottom: 12px;
}

.error-message {
  color: #6c757d;
  margin-bottom: 24px;
  line-height: 1.5;
}

.retry-btn {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #0056b3;
}

/* Empty state */
.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 12px;
}

.empty-message {
  color: #6c757d;
  margin-bottom: 24px;
  line-height: 1.5;
}

/* Lista de items */
.feed-list {
  min-height: 400px;
}

.feed-items {
  padding: 20px;
}

/* Infinite scroll */
.infinite-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  color: #6c757d;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e9ecef;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.end-of-content {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.end-icon {
  font-size: 32px;
  margin-bottom: 12px;
  display: block;
}

.scroll-trigger {
  height: 1px;
  background: transparent;
}

/* Transiciones eliminadas para mayor velocidad de cambio entre pestañas */

/* Responsive */
@media (max-width: 768px) {
  .feed-main {
    padding: 8px; /* Reducido significativamente para más espacio */
    max-width: 100%; /* Asegurar que use todo el ancho disponible */
  }
  
  .feed-content {
    margin: 0 -4px; /* Expandir ligeramente más allá del padding del contenedor */
    border-radius: 8px; /* Bordes más pequeños */
  }
  
  .stats-container {
    flex-direction: column;
    gap: 12px;
  }
  
  .stat-card {
    min-width: 100%;
  }
  
  .feed-items {
    padding: 1px; /* Padding mínimo para que los items ocupen casi todo el ancho */
  }
}

@media (max-width: 480px) {
  .feed-main {
    padding: 1px; /* Padding mínimo en pantallas muy pequeñas */
  }
  
  .feed-content {
    margin: 0 -2px; /* Expandir aún más en pantallas pequeñas */
    border-radius: 4px;
  }
  
  .feed-items {
    padding: 2px; /* Padding absolutamente mínimo */
  }
}

/* Animaciones */
@keyframes skeleton-pulse {
  0% {
    background-color: #e9ecef;
  }
  100% {
    background-color: #f8f9fa;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .feed-main {
    background: #121212;
  }
  
  .feed-header, .feed-content {
    background: #1a1a1a;
    color: #e0e0e0;
  }
  
  .stat-card {
    background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
  }
  
  .stat-number {
    color: #3182ce;
  }
  
  .skeleton-type, .skeleton-meta, .skeleton-title, 
  .skeleton-description, .skeleton-image, 
  .skeleton-stats, .skeleton-actions {
    background: #2a2a2a;
  }
  
  .error-title {
    color: #f56565;
  }
  
  .empty-title {
    color: #e0e0e0;
  }
  
  .infinite-loading, .end-of-content {
    color: #a0a0a0;
  }
  
  .loading-spinner {
    border-color: #2a2a2a;
    border-top-color: #3182ce;
  }
}
</style> 