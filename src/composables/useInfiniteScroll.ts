import { ref, onMounted, onUnmounted, nextTick, computed, watch, type ComputedRef } from 'vue';

interface UseInfiniteScrollOptions {
  rootMargin?: string;
  threshold?: number;
  enabled?: boolean | ComputedRef<boolean>;
  debug?: boolean;
}

export function useInfiniteScroll(
  callback: () => Promise<void> | void,
  options: UseInfiniteScrollOptions = {}
) {
  const {
    rootMargin = '100px',
    threshold = 0.1,
    enabled = true,
    debug = false
  } = options;

  const target = ref<HTMLElement>();
  const isLoading = ref(false);
  const isObserving = ref(false);
  const setupAttempts = ref(0);
  
  let observer: IntersectionObserver | null = null;

  const isEnabled = computed(() => {
    if (typeof enabled === 'boolean') {
      return enabled;
    }
    return enabled.value;
  });

  const log = (...args: any[]) => {
    if (debug || import.meta.env.DEV) {
      console.log('[useInfiniteScroll]', ...args);
    }
  };

  const setupObserver = async () => {
    setupAttempts.value++;
    log(`🔧 Setup attempt #${setupAttempts.value}`);
    
    // Esperar múltiples ticks para asegurar que el DOM esté completamente listo
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!target.value) {
      log('🚨 Target element not found, retrying in 500ms...');
      
      // Reintentar hasta 5 veces
      if (setupAttempts.value < 5) {
        setTimeout(() => setupObserver(), 500);
      } else {
        log('❌ Max setup attempts reached, giving up');
      }
      return;
    }

    if (!isEnabled.value) {
      log('⏸️ Disabled, skipping setup');
      return;
    }

    // Limpiar observer anterior si existe
    if (observer) {
      observer.disconnect();
      isObserving.value = false;
      log('🧹 Cleaned up previous observer');
    }

    log('🔍 Setting up new observer', {
      rootMargin,
      threshold,
      targetElement: target.value.tagName
    });

    observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        
        log('📍 Intersection event', {
          isIntersecting: entry.isIntersecting,
          isLoading: isLoading.value,
          isEnabled: isEnabled.value,
          intersectionRatio: entry.intersectionRatio
        });
        
        if (entry.isIntersecting && !isLoading.value && isEnabled.value) {
          log('✅ Triggering callback');
          isLoading.value = true;
          
          try {
            await callback();
            log('✅ Callback completed successfully');
          } catch (error) {
            log('❌ Callback error:', error);
          } finally {
            isLoading.value = false;
          }
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(target.value);
    isObserving.value = true;
    log('✅ Observer started successfully');
  };

  const disconnect = () => {
    if (observer) {
      log('🔌 Disconnecting observer');
      observer.disconnect();
      observer = null;
      isObserving.value = false;
    }
  };

  const reconnect = async () => {
    log('🔄 Reconnecting...');
    disconnect();
    setupAttempts.value = 0; // Reset attempts counter
    await setupObserver();
  };

  // Watcher para reaccionar a cambios en el estado enabled
  watch(isEnabled, async (newEnabled, oldEnabled) => {
    if (newEnabled !== oldEnabled) {
      log('🔄 Enabled changed to:', newEnabled);
      if (newEnabled) {
        await setupObserver();
      } else {
        disconnect();
      }
    }
  });

  // Watcher para detectar cambios en el target
  watch(target, async (newTarget, oldTarget) => {
    if (newTarget !== oldTarget && newTarget) {
      log('🎯 Target changed, reconnecting');
      setupAttempts.value = 0; // Reset attempts counter
      await setupObserver();
    }
  });

  onMounted(async () => {
    log('🚀 Component mounted');
    
    // Detectar si es un refresh y agregar delay adicional
    if (performance.navigation && (performance.navigation as any).type === 1) {
      log('🔄 Refresh detected, adding extra delay...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    await setupObserver();
  });

  onUnmounted(() => {
    log('💀 Component unmounted');
    disconnect();
  });

  return {
    target,
    isLoading,
    isObserving,
    disconnect,
    reconnect,
    setupObserver
  };
} 