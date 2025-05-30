import { defineStore } from 'pinia';
import { News, NewsWithPagination, Comment, NewsItemCreatePayload, CommentCreatePayload } from '@/types/api';
import { apiService } from '@/services/apiService';
import { globalNotifications } from '@/composables/useNotifications';
import type { UploadProgressEvent } from '@/types/index'; // Importar tipo

interface NewsState {
  newsList: News[];
  currentNewsItem: News | null;
  comments: Comment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  // Propiedades para el progreso de subida
  uploadProgress: number; // Porcentaje 0-100
  isUploading: boolean;
  uploadLoadedBytes: number;
  uploadTotalBytes: number | undefined;
  // Propiedades para scroll infinito
  currentPage: number;
  hasMoreNews: boolean;
  // Propiedades adicionales para mejor UX
  lastFetchTime: Date | null;
  retryCount: number;
  isInitialized: boolean;
  newsItemIds: Set<number>;
}

export const useNewsStore = defineStore('news', {
  state: (): NewsState => ({
    newsList: [],
    currentNewsItem: null,
    comments: [],
    pagination: null,
    isLoading: false,
    error: null,
    // Inicializar propiedades de subida
    uploadProgress: 0,
    isUploading: false,
    uploadLoadedBytes: 0,
    uploadTotalBytes: undefined,
    // Inicializar para scroll infinito
    currentPage: 1,
    hasMoreNews: true,
    // Nuevas propiedades
    lastFetchTime: null,
    retryCount: 0,
    isInitialized: false,
    newsItemIds: new Set(),
  }),
  
  getters: {
    // Getter para verificar si hay noticias cargadas
    hasNews: (state) => state.newsList.length > 0,
    
    // Getter para obtener noticias ordenadas por fecha
    newsListSorted: (state) => {
      return [...state.newsList].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    
    // Getter para verificar si se puede reintentar la carga
    canRetry: (state) => state.retryCount < 3 && state.error !== null,
    
    // Getter para verificar si está listo para infinite scroll
    isReadyForInfiniteScroll: (state) => state.isInitialized && !state.isLoading && state.hasMoreNews,
  },
  
  actions: {
    async fetchNoticias(page?: number, limit?: number) {
      // Determinar qué página cargar
      const pageToFetch = page ?? this.currentPage;
      const limitToFetch = limit ?? 10;

      console.log(`📄 [NEWS STORE] fetchNoticias called - page: ${pageToFetch}, limit: ${limitToFetch}`);
      console.log(`📄 [NEWS STORE] Current state - isLoading: ${this.isLoading}, hasMoreNews: ${this.hasMoreNews}, currentPage: ${this.currentPage}`);

      // Evitar cargas múltiples
      if (this.isLoading) {
        console.log('⏳ [NEWS STORE] Ya se está cargando, omitiendo llamada');
        return;
      }

      // Si no hay más noticias y no es una carga inicial explícita
      if (!this.hasMoreNews && pageToFetch > 1) {
        console.log('🚫 [NEWS STORE] No hay más noticias para cargar');
        return;
      }

      this.isLoading = true;
      this.error = null;
      
      console.log(`📄 [NEWS STORE] Iniciando carga página ${pageToFetch}, límite: ${limitToFetch}`);

      try {
        const response = await apiService.getNoticias(pageToFetch, limitToFetch);
        
        console.log(`📄 [NEWS STORE] Respuesta recibida:`, response);
        
        if (response?.data) {
          // Agregar nuevas noticias evitando duplicados
          for (const newsItem of response.data) {
            if (!this.newsItemIds.has(newsItem.id)) {
              this.newsList.push(newsItem);
              this.newsItemIds.add(newsItem.id);
            }
          }

          // Log para debug (solo en development)
          if (import.meta.env.DEV && response.data.length > 0) {
            console.log(`📰 [NEWS STORE] Se agregaron ${response.data.length} nuevas noticias`);
          }
          
          // Actualizar información de paginación
          this.pagination = response.pagination;
          
          // Determinar si hay más noticias
          if (this.pagination) {
            this.hasMoreNews = this.pagination.page < this.pagination.totalPages;
            this.currentPage = this.pagination.page + 1;
            console.log(`📊 [NEWS STORE] Paginación API - page: ${this.pagination.page}, totalPages: ${this.pagination.totalPages}`);
          } else {
            // Fallback si no hay información de paginación
            this.hasMoreNews = response.data.length === limitToFetch;
            this.currentPage = pageToFetch + 1;
            console.log(`📊 [NEWS STORE] Fallback paginación - items: ${response.data.length}, limit: ${limitToFetch}`);
          }
          
          // Actualizar estado de éxito
          this.lastFetchTime = new Date();
          this.retryCount = 0;
          this.isInitialized = true;
          
          console.log(`📊 [NEWS STORE] Estado actualizado - hasMore: ${this.hasMoreNews}, nextPage: ${this.currentPage}, initialized: ${this.isInitialized}`);
        } else {
          // No hay datos en la respuesta
          console.log('📭 [NEWS STORE] No se recibieron datos en la respuesta');
          this.hasMoreNews = false;
          if (pageToFetch === 1) {
            this.newsList = [];
            this.pagination = null;
            globalNotifications.info('Sin noticias', 'No hay noticias disponibles en este momento');
          }
          this.isInitialized = true;
        }

      } catch (error: any) {
        console.error('❌ [NEWS STORE] Error al cargar noticias:', error);
        this.error = error.message || 'Error al cargar noticias';
        this.hasMoreNews = false;
        this.retryCount++;
        
        // Mostrar notificación de error
        if (pageToFetch === 1) {
          globalNotifications.apiError(error, 'carga inicial de noticias');
        } else {
          globalNotifications.infiniteScrollError(error);
        }
      } finally {
        this.isLoading = false;
        console.log(`✅ [NEWS STORE] fetchNoticias completado - isLoading: ${this.isLoading}, initialized: ${this.isInitialized}`);
      }
    },

    async fetchNoticia(id: number | string) {
      this.isLoading = true;
      this.error = null;
      this.currentNewsItem = null;
      
      try {
        const response = await apiService.getNoticia(id);
        this.currentNewsItem = response;
      } catch (error: any) {
        this.error = error.message || 'Error al cargar la noticia';
        console.error('❌ Error al cargar noticia:', error);
        globalNotifications.apiError(error, 'carga de noticia');
      } finally {
        this.isLoading = false;
      }
    },

    async crearNoticia(payload: NewsItemCreatePayload) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const nuevaNoticia = await apiService.crearNoticia(payload);
        // Agregar la nueva noticia al inicio de la lista
        this.newsList.unshift(nuevaNoticia);
        
        globalNotifications.success(
          '¡Noticia creada!',
          `La noticia "${nuevaNoticia.titulo}" se ha publicado correctamente`
        );
        
        return nuevaNoticia;
      } catch (error: any) {
        this.error = error.message || 'Error al crear la noticia';
        globalNotifications.apiError(error, 'creación de noticia');
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchComentarios(noticiaId: number | string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        this.comments = await apiService.getComentarios(noticiaId);
      } catch (error: any) {
        this.error = error.message || 'Error al cargar comentarios';
        this.comments = [];
        console.error('❌ Error al cargar comentarios:', error);
        globalNotifications.apiError(error, 'carga de comentarios');
      } finally {
        this.isLoading = false;
      }
    },

    async crearComentario(noticiaId: number | string, payload: CommentCreatePayload) {
      this.error = null;
      
      try {
        const nuevoComentario = await apiService.crearComentario(noticiaId, payload);
        // Recargar comentarios para obtener la lista actualizada
        await this.fetchComentarios(noticiaId);
        
        globalNotifications.success('Comentario añadido', 'Tu comentario se ha publicado correctamente');
        
        return nuevoComentario;
      } catch (error: any) {
        this.error = error.message || 'Error al crear comentario';
        globalNotifications.apiError(error, 'publicación de comentario');
        throw error;
      }
    },

    async darLike(noticiaId: number | string) {
      try {
        await apiService.darLike(noticiaId);
        
        // Actualizar contador en la noticia actual si existe
        if (this.currentNewsItem && this.currentNewsItem.id === noticiaId) {
          this.currentNewsItem.likes_count = (this.currentNewsItem.likes_count || 0) + 1;
        }
        
        // Actualizar contador en la lista de noticias
        const noticiaEnLista = this.newsList.find(n => n.id === noticiaId);
        if (noticiaEnLista) {
          noticiaEnLista.likes_count = (noticiaEnLista.likes_count || 0) + 1;
        }
      } catch (error: any) {
        console.error('❌ Error al dar like:', error.message);
        globalNotifications.error('Error al dar me gusta', 'No se pudo registrar tu like. Inténtalo de nuevo.');
        throw error;
      }
    },

    async quitarLike(noticiaId: number | string) {
      try {
        await apiService.quitarLike(noticiaId);
        
        // Actualizar contador en la noticia actual si existe
        if (this.currentNewsItem && this.currentNewsItem.id === noticiaId) {
          this.currentNewsItem.likes_count = Math.max(0, (this.currentNewsItem.likes_count || 0) - 1);
        }
        
        // Actualizar contador en la lista de noticias
        const noticiaEnLista = this.newsList.find(n => n.id === noticiaId);
        if (noticiaEnLista) {
          noticiaEnLista.likes_count = Math.max(0, (noticiaEnLista.likes_count || 0) - 1);
        }
      } catch (error: any) {
        console.error('❌ Error al quitar like:', error.message);
        globalNotifications.error('Error al quitar me gusta', 'No se pudo quitar tu like. Inténtalo de nuevo.');
        throw error;
      }
    },

    resetNewsState() {
      console.log('🔄 [NEWS STORE] Reiniciando estado de noticias');
      this.newsList = [];
      this.currentNewsItem = null;
      this.comments = [];
      this.pagination = null;
      this.isLoading = false;
      this.error = null;
      this.currentPage = 1;
      this.hasMoreNews = true;
      this.lastFetchTime = null;
      this.retryCount = 0;
      this.isInitialized = false;
      this.newsItemIds = new Set();
    },

    async crearComunicacion(formData: FormData): Promise<any> {
      this.isUploading = true;
      this.isLoading = true;
      this.error = null;
      this.uploadProgress = 0;
      this.uploadLoadedBytes = 0;
      this.uploadTotalBytes = undefined;

      const handleProgress = (progressEvent: UploadProgressEvent) => {
        this.uploadLoadedBytes = progressEvent.loaded;
        this.uploadTotalBytes = progressEvent.total;
        if (progressEvent.total) {
          this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        } else {
          this.uploadProgress = 0;
        }
      };

      try {
        const nuevaComunicacion = await apiService.crearComunicacion(formData, handleProgress);
        
        globalNotifications.success(
          '¡Comunicación enviada!',
          'Tu comunicación se ha enviado correctamente'
        );
        
        return nuevaComunicacion;
      } catch (error: any) {
        this.error = error.message || 'Error al crear la comunicación';
        globalNotifications.apiError(error, 'envío de comunicación');
        throw error;
      } finally {
        this.isLoading = false;
        this.isUploading = false;
      }
    }
  },
}); 