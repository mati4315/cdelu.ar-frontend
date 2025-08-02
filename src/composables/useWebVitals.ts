import { ref, onMounted, onUnmounted, readonly } from 'vue';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  unit: string;
  timestamp: number;
}

interface PerformanceMetrics {
  // Core Web Vitals
  lcp: WebVitalMetric | null; // Largest Contentful Paint
  fid: WebVitalMetric | null; // First Input Delay
  cls: WebVitalMetric | null; // Cumulative Layout Shift
  
  // Other important metrics
  fcp: WebVitalMetric | null; // First Contentful Paint
  ttfb: WebVitalMetric | null; // Time to First Byte
  
  // Custom metrics
  pageLoadTime: WebVitalMetric | null;
  memoryUsage: WebVitalMetric | null;
  
  // Navigation timing
  navigationTiming: PerformanceNavigationTiming | null;
  
  // Summary
  score: number;
}

interface UseWebVitalsOptions {
  enableLogging?: boolean;
  enableReporting?: boolean;
  reportEndpoint?: string;
  sampleRate?: number; // Porcentaje de usuarios a monitorear (0-1)
}

export function useWebVitals(options: UseWebVitalsOptions = {}) {
  const {
    enableLogging = import.meta.env.DEV,
    enableReporting = false,
    reportEndpoint = '/api/analytics/web-vitals',
    sampleRate = 0.1
  } = options;

  // Intentar obtener router de forma segura
  let router: any = null;
  try {
    const { useRouter } = require('vue-router');
    router = useRouter();
  } catch (error) {
    if (enableLogging) {
      console.warn('⚠️ [WEB VITALS] Router not available, skipping route watching');
    }
  }
  
  // Estado reactivo
  const metrics = ref<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    pageLoadTime: null,
    memoryUsage: null,
    navigationTiming: null,
    score: 0
  });
  
  const isSupported = ref(false);
  const isCollecting = ref(false);
  
  // Verificar si el usuario está en la muestra
  const shouldCollect = Math.random() < sampleRate;
  
  // Funciones de rating
  const getLCPRating = (value: number): 'good' | 'needs-improvement' | 'poor' => {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  };
  
  const getFIDRating = (value: number): 'good' | 'needs-improvement' | 'poor' => {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  };
  
  const getCLSRating = (value: number): 'good' | 'needs-improvement' | 'poor' => {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  };
  
  const getFCPRating = (value: number): 'good' | 'needs-improvement' | 'poor' => {
    if (value <= 1800) return 'good';
    if (value <= 3000) return 'needs-improvement';
    return 'poor';
  };
  
  const getTTFBRating = (value: number): 'good' | 'needs-improvement' | 'poor' => {
    if (value <= 800) return 'good';
    if (value <= 1800) return 'needs-improvement';
    return 'poor';
  };

  // Crear métrica
  const createMetric = (
    name: string, 
    value: number, 
    rating: 'good' | 'needs-improvement' | 'poor',
    unit: string = 'ms'
  ): WebVitalMetric => ({
    name,
    value,
    rating,
    unit,
    timestamp: performance.now()
  });

  // Observar métricas usando PerformanceObserver
  const observeMetrics = () => {
    if (!isSupported.value || !shouldCollect) return;
    
    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;
        
        if (lastEntry) {
          const value = Math.round(lastEntry.startTime);
          metrics.value.lcp = createMetric('LCP', value, getLCPRating(value));
          log('LCP', metrics.value.lcp);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as PerformanceEventTiming;
          const value = Math.round(fidEntry.processingStart - fidEntry.startTime);
          metrics.value.fid = createMetric('FID', value, getFIDRating(value));
          log('FID', metrics.value.fid);
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      
      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as PerformanceEntry & { value: number, hadRecentInput: boolean };
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        }
        metrics.value.cls = createMetric('CLS', Math.round(clsValue * 1000) / 1000, getCLSRating(clsValue), '');
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      
      // First Contentful Paint (FCP)
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            const value = Math.round(entry.startTime);
            metrics.value.fcp = createMetric('FCP', value, getFCPRating(value));
            log('FCP', metrics.value.fcp);
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      
      // Navigation Timing
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const navEntry = entry as PerformanceNavigationTiming;
          metrics.value.navigationTiming = navEntry;
          
          // Time to First Byte (TTFB)
          const ttfbValue = Math.round(navEntry.responseStart - navEntry.requestStart);
          metrics.value.ttfb = createMetric('TTFB', ttfbValue, getTTFBRating(ttfbValue));
          
          // Page Load Time
          const loadTime = Math.round(navEntry.loadEventEnd - navEntry.fetchStart);
          metrics.value.pageLoadTime = createMetric('Page Load', loadTime, loadTime <= 3000 ? 'good' : loadTime <= 5000 ? 'needs-improvement' : 'poor');
          
          log('Navigation Timing', {
            TTFB: metrics.value.ttfb,
            'Page Load': metrics.value.pageLoadTime
          });
        }
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      
    } catch (error) {
      console.warn('⚠️ [WEB VITALS] Error setting up performance observers:', error);
    }
  };

  // Monitorear uso de memoria
  const observeMemoryUsage = () => {
    if (!('memory' in performance)) return;
    
    const memory = (performance as any).memory;
    if (memory) {
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
      
      metrics.value.memoryUsage = createMetric(
        'Memory Usage', 
        usedMB, 
        usedMB <= 50 ? 'good' : usedMB <= 100 ? 'needs-improvement' : 'poor',
        'MB'
      );
      
      log('Memory Usage', metrics.value.memoryUsage);
    }
  };

  // Calcular score general
  const calculateScore = (): number => {
    const scores = [];
    
    if (metrics.value.lcp) {
      scores.push(metrics.value.lcp.rating === 'good' ? 100 : metrics.value.lcp.rating === 'needs-improvement' ? 75 : 50);
    }
    
    if (metrics.value.fid) {
      scores.push(metrics.value.fid.rating === 'good' ? 100 : metrics.value.fid.rating === 'needs-improvement' ? 75 : 50);
    }
    
    if (metrics.value.cls) {
      scores.push(metrics.value.cls.rating === 'good' ? 100 : metrics.value.cls.rating === 'needs-improvement' ? 75 : 50);
    }
    
    if (metrics.value.fcp) {
      scores.push(metrics.value.fcp.rating === 'good' ? 100 : metrics.value.fcp.rating === 'needs-improvement' ? 75 : 50);
    }
    
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  };

  // Logging
  const log = (name: string, data: any) => {
    if (enableLogging) {
      console.log(`📊 [WEB VITALS] ${name}:`, data);
    }
  };

  // Reportar métricas al servidor
  const reportMetrics = async () => {
    if (!enableReporting || !shouldCollect) return;
    
    try {
      const payload = {
        url: window.location.href,
        userAgent: navigator.userAgent,
        metrics: metrics.value,
        timestamp: Date.now(),
        sessionId: sessionStorage.getItem('sessionId') || 'unknown'
      };
      
      await fetch(reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      log('Metrics reported', payload);
    } catch (error) {
      console.warn('⚠️ [WEB VITALS] Error reporting metrics:', error);
    }
  };

  // Inicializar
  const initWebVitals = () => {
    // Verificar soporte
    isSupported.value = 'PerformanceObserver' in window && 'performance' in window;
    
    if (!isSupported.value) {
      console.warn('⚠️ [WEB VITALS] PerformanceObserver not supported');
      return;
    }
    
    if (!shouldCollect) {
      console.log('📊 [WEB VITALS] User not in sample, skipping collection');
      return;
    }
    
    isCollecting.value = true;
    observeMetrics();
    
    // Monitorear memoria cada 30 segundos
    const memoryInterval = setInterval(observeMemoryUsage, 30000);
    
    // Calcular score cada 5 segundos
    const scoreInterval = setInterval(() => {
      metrics.value.score = calculateScore();
    }, 5000);
    
    // Reportar métricas antes de cerrar la página
    const handleBeforeUnload = () => {
      reportMetrics();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup
    onUnmounted(() => {
      clearInterval(memoryInterval);
      clearInterval(scoreInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      isCollecting.value = false;
    });
  };

  // Obtener resumen de performance
  const getPerformanceSummary = () => {
    const summary = {
      score: metrics.value.score,
      coreWebVitals: {
        lcp: metrics.value.lcp,
        fid: metrics.value.fid,
        cls: metrics.value.cls
      },
      otherMetrics: {
        fcp: metrics.value.fcp,
        ttfb: metrics.value.ttfb,
        pageLoadTime: metrics.value.pageLoadTime,
        memoryUsage: metrics.value.memoryUsage
      },
      issues: [] as string[]
    };
    
    // Identificar problemas
    if (metrics.value.lcp?.rating === 'poor') {
      summary.issues.push('Largest Contentful Paint es lento');
    }
    if (metrics.value.fid?.rating === 'poor') {
      summary.issues.push('First Input Delay es alto');
    }
    if (metrics.value.cls?.rating === 'poor') {
      summary.issues.push('Cumulative Layout Shift es alto');
    }
    if (metrics.value.memoryUsage && metrics.value.memoryUsage.rating === 'poor') {
      summary.issues.push('Uso de memoria es alto');
    }
    
    return summary;
  };

  // Lifecycle
  onMounted(() => {
    // Delay para evitar interferir con la carga inicial
    setTimeout(initWebVitals, 1000);
  });

  // Watch route changes para reportar por página (solo si router está disponible)
  if (router) {
    router.afterEach(() => {
      setTimeout(() => {
        if (enableReporting) {
          reportMetrics();
        }
      }, 2000); // Esperar a que se estabilice la nueva página
    });
  }

  return {
    // Estado reactivo
    metrics: readonly(metrics),
    isSupported: readonly(isSupported),
    isCollecting: readonly(isCollecting),
    
    // Funciones
    getPerformanceSummary,
    reportMetrics,
    
    // Para debugging
    calculateScore: () => metrics.value.score
  };
} 