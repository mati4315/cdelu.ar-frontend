<template>
  <div v-if="showDebug" class="fixed bottom-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
    <div class="mb-2 font-bold text-green-400">🔍 Infinite Scroll Debug</div>
    
    <div class="space-y-1">
      <div class="text-blue-300">📊 Store State:</div>
      <div>• isLoading: <span :class="newsStore.isLoading ? 'text-red-400' : 'text-green-400'">{{ newsStore.isLoading }}</span></div>
      <div>• hasMoreNews: <span :class="newsStore.hasMoreNews ? 'text-green-400' : 'text-red-400'">{{ newsStore.hasMoreNews }}</span></div>
      <div>• isInitialized: <span :class="newsStore.isInitialized ? 'text-green-400' : 'text-red-400'">{{ newsStore.isInitialized }}</span></div>
      <div>• currentPage: <span class="text-yellow-400">{{ newsStore.currentPage }}</span></div>
      <div>• newsList.length: <span class="text-yellow-400">{{ newsStore.newsList.length }}</span></div>
      <div>• error: <span :class="newsStore.error ? 'text-red-400' : 'text-green-400'">{{ newsStore.error || 'null' }}</span></div>
    </div>

    <div class="mt-3 space-y-1">
      <div class="text-blue-300">🎯 Component State:</div>
      <div>• isInitialized: <span :class="isInitialized ? 'text-green-400' : 'text-red-400'">{{ isInitialized }}</span></div>
      <div>• isObserving: <span :class="isObserving ? 'text-green-400' : 'text-red-400'">{{ isObserving }}</span></div>
      <div>• scrollSentinel: <span :class="scrollSentinel ? 'text-green-400' : 'text-red-400'">{{ scrollSentinel ? 'found' : 'null' }}</span></div>
    </div>

    <div class="mt-3 space-y-1">
      <div class="text-blue-300">🌐 Navigation:</div>
      <div>• route.path: <span class="text-yellow-400">{{ route.path }}</span></div>
      <div>• navigation.type: <span class="text-yellow-400">{{ navigationType }}</span></div>
    </div>

    <div class="mt-3 space-y-1">
      <div class="text-blue-300">⏱️ Timing:</div>
      <div>• lastFetch: <span class="text-yellow-400">{{ lastFetchFormatted }}</span></div>
      <div>• retryCount: <span class="text-yellow-400">{{ newsStore.retryCount }}</span></div>
    </div>

    <div class="mt-3 flex gap-2">
      <button 
        @click="forceReconnect" 
        class="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
      >
        🔄 Reconnect
      </button>
      <button 
        @click="forceRefresh" 
        class="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
      >
        🔄 Refresh
      </button>
      <button 
        @click="toggleDebug" 
        class="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
      >
        ❌ Close
      </button>
    </div>
  </div>

  <!-- Toggle button cuando está cerrado -->
  <button 
    v-else
    @click="toggleDebug"
    class="fixed bottom-4 left-4 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full z-50 text-xs"
    title="Abrir Debug Panel"
  >
    🔍
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useNewsStore } from '@/store/news';
import { useRoute } from 'vue-router';

interface Props {
  isInitialized?: boolean;
  isObserving?: boolean;
  scrollSentinel?: HTMLElement | null;
  onReconnect?: () => void;
  onRefresh?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  isInitialized: false,
  isObserving: false,
  scrollSentinel: null
});

const newsStore = useNewsStore();
const route = useRoute();

const showDebug = ref(false);
const navigationType = ref('unknown');
const isDev = ref(false);

const lastFetchFormatted = computed(() => {
  if (!newsStore.lastFetchTime) return 'never';
  const now = new Date();
  const diff = now.getTime() - newsStore.lastFetchTime.getTime();
  return `${Math.round(diff / 1000)}s ago`;
});

function toggleDebug() {
  showDebug.value = !showDebug.value;
}

function forceReconnect() {
  console.log('🔄 [DEBUG] Force reconnect triggered');
  if (props.onReconnect) {
    props.onReconnect();
  }
}

function forceRefresh() {
  console.log('🔄 [DEBUG] Force refresh triggered');
  if (props.onRefresh) {
    props.onRefresh();
  }
}

onMounted(() => {
  // Establecer si estamos en desarrollo
  isDev.value = import.meta.env.DEV;
  
  // Detectar tipo de navegación
  if (performance.navigation) {
    switch ((performance.navigation as any).type) {
      case 0:
        navigationType.value = 'navigate';
        break;
      case 1:
        navigationType.value = 'reload';
        break;
      case 2:
        navigationType.value = 'back_forward';
        break;
      default:
        navigationType.value = 'unknown';
    }
  }
  
  // Auto-abrir en desarrollo si hay problemas
  if (isDev.value && !newsStore.isInitialized) {
    setTimeout(() => {
      showDebug.value = true;
    }, 2000);
  }
});
</script>

<style scoped>
/* Asegurar que el debug panel esté siempre visible */
.fixed {
  position: fixed !important;
}
</style> 