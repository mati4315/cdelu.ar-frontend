import { ref, onMounted, onUnmounted, nextTick, readonly } from 'vue';

interface UseLazyLoadingOptions {
  rootMargin?: string;
  threshold?: number;
  enableBlur?: boolean;
  placeholderColor?: string;
  errorRetryCount?: number;
  enableWebP?: boolean; // Detectar soporte para WebP
  preloadNext?: number; // Precargar las siguientes N imágenes
}

interface LazyImage {
  src: string;
  alt?: string;
  isLoaded: boolean;
  isLoading: boolean;
  hasError: boolean;
  retryCount: number;
}

export function useLazyLoading(options: UseLazyLoadingOptions = {}) {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    enableBlur = true,
    placeholderColor = '#f3f4f6',
    errorRetryCount = 2,
    enableWebP = true,
    preloadNext = 2
  } = options;

  const images = ref<Map<string, LazyImage>>(new Map());
  const observer = ref<IntersectionObserver | null>(null);
  const loadedImages = new Set<string>();
  
  // NUEVO: Detectar soporte para WebP
  const supportsWebP = ref<boolean | null>(null);
  
  // NUEVO: Pool de elementos Image para reutilización
  const imagePool: HTMLImageElement[] = [];
  const maxPoolSize = 10;

  // OPTIMIZADO: Detectar soporte WebP una sola vez
  const detectWebPSupport = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (supportsWebP.value !== null) {
        resolve(supportsWebP.value);
        return;
      }

      const webP = new Image();
      webP.onload = webP.onerror = () => {
        const isSupported = webP.height === 2;
        supportsWebP.value = isSupported;
        resolve(isSupported);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  };

  // OPTIMIZADO: Obtener o crear elemento de pool
  const getImageElement = (): HTMLImageElement => {
    if (imagePool.length > 0) {
      return imagePool.pop()!;
    }
    return new Image();
  };

  // OPTIMIZADO: Devolver elemento al pool
  const returnImageElement = (img: HTMLImageElement) => {
    if (imagePool.length < maxPoolSize) {
      // Limpiar referencias para evitar memory leaks
      img.onload = null;
      img.onerror = null;
      img.src = '';
      imagePool.push(img);
    }
  };

  // OPTIMIZADO: Convertir URL a WebP si es compatible
  const optimizeImageUrl = async (originalUrl: string): Promise<string> => {
    if (!enableWebP) return originalUrl;
    
    const webpSupported = await detectWebPSupport();
    if (!webpSupported) return originalUrl;
    
    // Si la URL ya es WebP, devolverla tal como está
    if (originalUrl.includes('.webp')) return originalUrl;
    
    // Solo convertir para ciertos dominios que sabemos que soportan WebP
    const webpDomains = ['images.unsplash.com', 'cdn.example.com'];
    const url = new URL(originalUrl);
    
    if (webpDomains.some(domain => url.hostname.includes(domain))) {
      // Agregar parámetro para WebP (esto depende del CDN específico)
      url.searchParams.set('fm', 'webp');
      return url.toString();
    }
    
    return originalUrl;
  };

  // OPTIMIZADO: Función de carga con retry y pooling
  const loadImageWithRetry = async (
    src: string, 
    retryCount: number = 0
  ): Promise<void> => {
    const imageData = images.value.get(src);
    if (!imageData) return;

    imageData.isLoading = true;
    imageData.hasError = false;

    try {
      const optimizedSrc = await optimizeImageUrl(src);
      const img = getImageElement();
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          imageData.isLoaded = true;
          imageData.isLoading = false;
          loadedImages.add(src);
          returnImageElement(img);
          resolve();
        };
        
        img.onerror = () => {
          returnImageElement(img);
          reject(new Error(`Failed to load image: ${src}`));
        };
        
        img.src = optimizedSrc;
      });
      
    } catch (error) {
      imageData.isLoading = false;
      
      if (retryCount < errorRetryCount) {
        console.log(`🔄 [LAZY LOADING] Retrying image load (${retryCount + 1}/${errorRetryCount}): ${src}`);
        imageData.retryCount = retryCount + 1;
        
        // Retry con delay exponencial
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          loadImageWithRetry(src, retryCount + 1);
        }, delay);
      } else {
        console.error(`❌ [LAZY LOADING] Failed to load image after ${errorRetryCount} retries: ${src}`);
        imageData.hasError = true;
        imageData.retryCount = errorRetryCount;
      }
    }
  };

  // NUEVO: Precargar imágenes siguientes
  const preloadNextImages = (currentSrc: string) => {
    if (preloadNext <= 0) return;
    
    const imageKeys = Array.from(images.value.keys());
    const currentIndex = imageKeys.indexOf(currentSrc);
    
    if (currentIndex === -1) return;
    
    // Precargar las siguientes N imágenes
    for (let i = 1; i <= preloadNext; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < imageKeys.length) {
        const nextSrc = imageKeys[nextIndex];
        const nextImage = images.value.get(nextSrc);
        
        if (nextImage && !nextImage.isLoaded && !nextImage.isLoading) {
          console.log(`🔮 [LAZY LOADING] Preloading next image: ${nextSrc}`);
          loadImageWithRetry(nextSrc);
        }
      }
    }
  };

  // OPTIMIZADO: Configurar IntersectionObserver con mejores opciones
  const setupObserver = async () => {
    await nextTick();
    
    if (observer.value) return;
    
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src && !loadedImages.has(src)) {
              console.log(`👁️ [LAZY LOADING] Image entered viewport: ${src}`);
              loadImageWithRetry(src);
              
              // Precargar siguientes imágenes
              preloadNextImages(src);
              
              // Dejar de observar esta imagen
              observer.value?.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin,
        threshold,
        // NUEVO: Optimización para reducir llamadas innecesarias
        root: null
      }
    );
  };

  // NUEVO: Registrar imagen para lazy loading
  const registerImage = (src: string, alt?: string): LazyImage => {
    if (!images.value.has(src)) {
      images.value.set(src, {
        src,
        alt,
        isLoaded: loadedImages.has(src),
        isLoading: false,
        hasError: false,
        retryCount: 0
      });
    }
    
    return images.value.get(src)!;
  };

  // NUEVO: Observar elemento de imagen
  const observeImage = (element: HTMLImageElement, src: string) => {
    if (!observer.value) {
      setupObserver();
    }
    
    element.dataset.src = src;
    observer.value?.observe(element);
  };

  // NUEVO: Generar placeholder optimizado
  const generatePlaceholder = (width: number = 400, height: number = 300): string => {
    if (enableBlur) {
      // SVG placeholder con blur effect
      const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="blur">
              <feGaussianBlur stdDeviation="2"/>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="${placeholderColor}" filter="url(#blur)"/>
          <circle cx="50%" cy="50%" r="20" fill="rgba(255,255,255,0.5)"/>
        </svg>
      `;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    } else {
      // Placeholder simple
      const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${placeholderColor}"/>
        </svg>
      `;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
  };

  // NUEVO: Cleanup optimizado
  const cleanup = () => {
    if (observer.value) {
      observer.value.disconnect();
      observer.value = null;
    }
    
    // Limpiar pool de imágenes
    imagePool.length = 0;
  };

  // NUEVO: Precargar imagen manualmente
  const preloadImage = async (src: string): Promise<void> => {
    const imageData = registerImage(src);
    if (!imageData.isLoaded && !imageData.isLoading) {
      await loadImageWithRetry(src);
    }
  };

  // NUEVO: Estadísticas de carga
  const getLoadingStats = () => {
    const totalImages = images.value.size;
    const loadedCount = Array.from(images.value.values()).filter(img => img.isLoaded).length;
    const loadingCount = Array.from(images.value.values()).filter(img => img.isLoading).length;
    const errorCount = Array.from(images.value.values()).filter(img => img.hasError).length;
    
    return {
      total: totalImages,
      loaded: loadedCount,
      loading: loadingCount,
      errors: errorCount,
      percentage: totalImages > 0 ? Math.round((loadedCount / totalImages) * 100) : 0
    };
  };

  onMounted(() => {
    setupObserver();
    detectWebPSupport(); // Detectar soporte WebP al montar
  });

  onUnmounted(() => {
    cleanup();
  });

  return {
    // Estado reactivo
    images: readonly(images),
    supportsWebP: readonly(supportsWebP),
    
    // Funciones principales
    registerImage,
    observeImage,
    preloadImage,
    generatePlaceholder,
    
    // Utilidades
    getLoadingStats,
    cleanup,
    
    // Helpers para componentes
    getImageData: (src: string) => images.value.get(src) || null,
    isImageLoaded: (src: string) => loadedImages.has(src),
    
    // Para debugging
    getLoadedImagesCount: () => loadedImages.size,
    getPoolSize: () => imagePool.length
  };
} 