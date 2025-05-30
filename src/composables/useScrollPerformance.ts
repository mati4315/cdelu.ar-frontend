import { ref, onMounted, onUnmounted } from 'vue';

interface UseScrollPerformanceOptions {
  throttleMs?: number;
  debounceMs?: number;
}

export function useScrollPerformance(options: UseScrollPerformanceOptions = {}) {
  const { throttleMs = 16, debounceMs = 100 } = options; // 16ms ≈ 60fps
  
  const isScrolling = ref(false);
  const scrollPosition = ref({ x: 0, y: 0 });
  const scrollDirection = ref<'up' | 'down' | 'left' | 'right' | null>(null);
  
  let lastScrollTop = 0;
  let lastScrollLeft = 0;
  let throttleTimer: number | null = null;
  let debounceTimer: number | null = null;

  const updateScrollPosition = (x: number, y: number) => {
    // Determinar dirección del scroll
    if (y > lastScrollTop) {
      scrollDirection.value = 'down';
    } else if (y < lastScrollTop) {
      scrollDirection.value = 'up';
    } else if (x > lastScrollLeft) {
      scrollDirection.value = 'right';
    } else if (x < lastScrollLeft) {
      scrollDirection.value = 'left';
    }

    lastScrollTop = y;
    lastScrollLeft = x;
    scrollPosition.value = { x, y };
  };

  const handleScroll = () => {
    const x = window.scrollX || window.pageXOffset;
    const y = window.scrollY || window.pageYOffset;

    // Throttle para actualizaciones frecuentes
    if (throttleTimer === null) {
      throttleTimer = window.setTimeout(() => {
        updateScrollPosition(x, y);
        throttleTimer = null;
      }, throttleMs);
    }

    // Marcar como scrolling
    isScrolling.value = true;

    // Debounce para detectar fin de scroll
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }
    
    debounceTimer = window.setTimeout(() => {
      isScrolling.value = false;
      scrollDirection.value = null;
      debounceTimer = null;
    }, debounceMs);
  };

  const cleanup = () => {
    if (throttleTimer !== null) {
      clearTimeout(throttleTimer);
      throttleTimer = null;
    }
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  };

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Inicializar posición
    updateScrollPosition(
      window.scrollX || window.pageXOffset,
      window.scrollY || window.pageYOffset
    );
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    cleanup();
  });

  return {
    isScrolling,
    scrollPosition,
    scrollDirection,
    cleanup
  };
} 