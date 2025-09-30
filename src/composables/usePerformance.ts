/**
 * Composable para optimizaciones de performance
 */
import { onMounted, onUnmounted } from 'vue';

/**
 * Reduce forced reflows usando requestAnimationFrame
 */
export function useThrottledResize(callback: () => void, delay = 16) {
  let timeoutId: number | null = null;
  
  const throttledCallback = () => {
    if (timeoutId) {
      cancelAnimationFrame(timeoutId);
    }
    
    timeoutId = requestAnimationFrame(() => {
      callback();
      timeoutId = null;
    });
  };
  
  onMounted(() => {
    window.addEventListener('resize', throttledCallback, { passive: true });
  });
  
  onUnmounted(() => {
    window.removeEventListener('resize', throttledCallback);
    if (timeoutId) {
      cancelAnimationFrame(timeoutId);
    }
  });
  
  return throttledCallback;
}

/**
 * Optimiza scroll listeners
 */
export function useThrottledScroll(callback: () => void, delay = 16) {
  let timeoutId: number | null = null;
  let isScrolling = false;
  
  const throttledCallback = () => {
    if (!isScrolling) {
      isScrolling = true;
      
      if (timeoutId) {
        cancelAnimationFrame(timeoutId);
      }
      
      timeoutId = requestAnimationFrame(() => {
        callback();
        isScrolling = false;
        timeoutId = null;
      });
    }
  };
  
  onMounted(() => {
    window.addEventListener('scroll', throttledCallback, { passive: true });
  });
  
  onUnmounted(() => {
    window.removeEventListener('scroll', throttledCallback);
    if (timeoutId) {
      cancelAnimationFrame(timeoutId);
    }
  });
  
  return throttledCallback;
}

/**
 * Batching de DOM reads/writes para evitar layout thrashing
 */
export function useDOMBatch() {
  const readQueue: (() => void)[] = [];
  const writeQueue: (() => void)[] = [];
  let isScheduled = false;
  
  const flush = () => {
    // Ejecutar todas las lecturas primero
    readQueue.forEach(task => task());
    readQueue.length = 0;
    
    // Luego todas las escrituras
    writeQueue.forEach(task => task());
    writeQueue.length = 0;
    
    isScheduled = false;
  };
  
  const schedule = () => {
    if (!isScheduled) {
      isScheduled = true;
      requestAnimationFrame(flush);
    }
  };
  
  const read = (task: () => void) => {
    readQueue.push(task);
    schedule();
  };
  
  const write = (task: () => void) => {
    writeQueue.push(task);
    schedule();
  };
  
  return { read, write };
}

/**
 * Intersect Observer optimizado para lazy loading
 */
export function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) {
  let observer: IntersectionObserver | null = null;
  
  onMounted(() => {
    observer = new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });
  });
  
  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  });
  
  const observe = (element: Element) => {
    observer?.observe(element);
  };
  
  const unobserve = (element: Element) => {
    observer?.unobserve(element);
  };
  
  return { observe, unobserve };
}

/**
 * Preload de recursos críticos
 */
export function preloadCriticalResources() {
  const preloadScript = (src: string) => {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = src;
    document.head.appendChild(link);
  };
  
  const preloadStyle = (href: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  };
  
  // Preload de componentes críticos
  if (window.location.pathname === '/') {
    preloadScript('/src/components/feed/FeedMain.vue');
    preloadScript('/src/components/feed/FeedTabs.vue');
    preloadScript('/src/components/feed/FeedItem.vue');
  }
  
  return { preloadScript, preloadStyle };
}
