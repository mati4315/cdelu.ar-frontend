// Declaraciones de tipos para Google Analytics
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Servicio de Analytics Básico
export class AnalyticsService {
  private static instance: AnalyticsService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Inicializa Google Analytics
   */
  initialize(measurementId: string): void {
    if (this.isInitialized) return;

    // Cargar Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Configurar gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', measurementId);

    // Hacer gtag disponible globalmente
    window.gtag = gtag;
    
    this.isInitialized = true;
    console.log('Analytics inicializado:', measurementId);
  }

  /**
   * Trackea un evento personalizado
   */
  trackEvent(eventName: string, parameters?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.warn('Analytics no inicializado');
      return;
    }

    if (window.gtag) {
      window.gtag('event', eventName, parameters);
      console.log('Evento trackeado:', eventName, parameters);
    }
  }

  /**
   * Trackea vista de página
   */
  trackPageView(pageTitle: string, pagePath: string): void {
    if (!this.isInitialized) return;

    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: pagePath
      });
    }
  }

  /**
   * Trackea clics en anuncios
   */
  trackAdClick(adId: string, adTitle: string, position: string): void {
    this.trackEvent('ad_click', {
      ad_id: adId,
      ad_title: adTitle,
      position: position,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Trackea impresiones de anuncios
   */
  trackAdImpression(adId: string, adTitle: string, position: string): void {
    this.trackEvent('ad_impression', {
      ad_id: adId,
      ad_title: adTitle,
      position: position,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Trackea inicio de sesión
   */
  trackLogin(method: string = 'email'): void {
    this.trackEvent('login', {
      method: method,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Trackea registro de usuario
   */
  trackSignUp(method: string = 'email'): void {
    this.trackEvent('sign_up', {
      method: method,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Trackea navegación entre páginas
   */
  trackNavigation(fromPage: string, toPage: string): void {
    this.trackEvent('page_navigation', {
      from_page: fromPage,
      to_page: toPage,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Trackea interacciones con noticias
   */
  trackNewsInteraction(action: 'view' | 'like' | 'share' | 'comment', newsId: string): void {
    this.trackEvent('news_interaction', {
      action: action,
      news_id: newsId,
      timestamp: new Date().toISOString()
    });
  }
}

// Exportar instancia singleton
export const analyticsService = AnalyticsService.getInstance(); 