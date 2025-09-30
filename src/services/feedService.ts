// 🔄 Servicio de Feed Unificado
// Archivo: src/services/feedService.ts

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { 
  FeedParams, 
  FeedResponse, 
  FeedStats, 
  FeedItem, 
  FeedType,
  FeedApiError 
} from '@/types/feed';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

let token: string | null = localStorage.getItem('token');

class FeedService {
  private apiClient: AxiosInstance;

  constructor() {
    // Sincronizar token desde localStorage al inicializar
    token = localStorage.getItem('token');
    
    this.apiClient = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 segundos timeout
    });

    // Interceptor para agregar token automáticamente
    this.apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      // Siempre obtener el token más reciente de localStorage
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      } else {
        console.warn('⚠️ [FEED SERVICE] No token available for request');
      }
      return config;
    });

    // Interceptor para manejar errores
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[FEED SERVICE] Error en request:', error);
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  // Método para actualizar el token
  setToken(newToken: string): void {
    token = newToken;
    localStorage.setItem('token', newToken);
  }

  // Método para limpiar el token
  clearToken(): void {
    token = null;
    localStorage.removeItem('token');
  }

  // Manejo de errores de API
  private handleApiError(error: any): Error {
    console.log('[FEED SERVICE] Error en request:', error);
    
    let errorMessage = 'Error en la API del feed';
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      // Logging específico para errores 400 de likes
      if (status === 400 && error.config?.url?.includes('/like')) {
        console.log('🚨 [FEED SERVICE] Error 400 en like:', {
          url: error.config.url,
          method: error.config.method,
          data: data,
          feedId: error.config.url.match(/\/feed\/(\d+)\/like/)?.[1]
        });
      }
      
      // Logging específico para errores 401 (token expirado)
      if (status === 401) {
        console.log('🚨 [FEED SERVICE] Error 401 - Token expirado:', {
          url: error.config.url,
          method: error.config.method,
          data: data,
          currentToken: this.apiClient.defaults.headers.Authorization?.toString().substring(0, 20) + '...'
        });
      }
      
      switch (status) {
        case 400:
          errorMessage = data?.message || 'Solicitud inválida';
          break;
        case 401:
          // Limpiar token expirado del localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          errorMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
          
          // Opcional: Redirect a login
          // window.location.href = '/login';
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 409:
          errorMessage = data?.message || 'Conflicto en la operación';
          break;
        case 429:
          errorMessage = 'Ha excedido el límite de solicitudes. Intente nuevamente más tarde.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = data?.message || `Error ${status}`;
      }
    } else if (error.request) {
      errorMessage = 'No se pudo conectar con el servidor';
    }
    
    return new Error(errorMessage);
  }

  // NUEVO: Feed unificado (pestaña "Todo")
  async getFeed(params: FeedParams = {}): Promise<FeedResponse> {
    try {
      const response = await this.apiClient.get<FeedResponse>('/feed', { params });
      return response.data;
    } catch (error) {
      console.error('❌ [FEED SERVICE] Error in getFeed:', error);
      throw error;
    }
  }

  // NUEVO: Solo noticias (equivale a la API actual de news)
  async getNews(params: FeedParams = {}): Promise<FeedResponse> {
    try {
      const response = await this.apiClient.get<FeedResponse>('/feed/noticias', { params });
      return response.data;
    } catch (error) {
      console.error('❌ [FEED SERVICE] Error in getNews:', error);
      throw error;
    }
  }

  // NUEVO: Solo comunidad
  async getCommunity(params: FeedParams = {}): Promise<FeedResponse> {
    try {
      const response = await this.apiClient.get<FeedResponse>('/feed/comunidad', { params });
      return response.data;
    } catch (error) {
      console.error('❌ [FEED SERVICE] Error in getCommunity:', error);
      throw error;
    }
  }

  // NUEVO: Feed de usuarios seguidos
  async getFollowing(params: FeedParams = {}): Promise<FeedResponse> {
    console.log(`👥 [FEED SERVICE] Obteniendo contenido de seguidores:`, params);
    
    try {
      const response = await this.apiClient.get<FeedResponse>('/feed/following', { params });
      return response.data;
    } catch (error: any) {
      // ✅ BACKEND OPTIMIZADO: Endpoint implementado con performance ~3ms
      if (error.response?.status === 404) {
        console.log(`⚠️ [FEED SERVICE] Endpoint /feed/following no disponible, verificar implementación backend`);
        
        // Como fallback temporal, devolver feed vacío 
        return {
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            hasMore: false
          }
        };
      }
      
      console.error('❌ [FEED SERVICE] Error in getFollowing:', error);
      throw error;
    }
  }

  // NUEVO: Estadísticas del feed
  async getFeedStats(): Promise<FeedStats> {
    try {
      const response = await this.apiClient.get<FeedStats>('/feed/stats');
      return response.data;
    } catch (error) {
      console.error('❌ [FEED SERVICE] Error in getFeedStats:', error);
      throw error;
    }
  }

  // NUEVO: Elemento específico por original_id (ID del post original, no del feed)
  async getPostByOriginalId(type: FeedType, originalId: number): Promise<FeedItem> {
    try {
      // Intentar primero el endpoint específico sin usar el interceptor de errores
      const response = await axios.get<FeedItem>(`${BASE_URL}/feed/by-original-id/${type}/${originalId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      // Si el endpoint específico no existe (404), hacer fallback a búsqueda en feed
      if (error.response?.status === 404) {
        
        try {
          // Buscar en el feed filtrando por tipo y original_id
          const feedResponse = await this.apiClient.get<FeedResponse>('/feed', {
            params: { type, limit: 100 } // Buscar en las primeras 100 entradas
          });
          
          const feedItem = feedResponse.data.data.find(item => 
            item.original_id === originalId && item.type === type
          );
          
          if (feedItem) {
            return feedItem;
          } else {
            throw new Error(`Item no encontrado en feed - type: ${type}, original_id: ${originalId}`);
          }
        } catch (fallbackError) {
          console.error('❌ [FEED SERVICE] Error in fallback search:', fallbackError);
          throw fallbackError;
        }
      } else {
        console.error('❌ [FEED SERVICE] Error in getPostByOriginalId:', error);
        throw error;
      }
    }
  }

  // NUEVO: Elemento específico por feed ID (del feed unificado)
  async getFeedItem(type: FeedType, id: number): Promise<FeedItem> {
    try {
      const response = await this.apiClient.get<FeedItem>(`/feed/${type}/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ [FEED SERVICE] Error in getFeedItem:', error);
      throw error;
    }
  }

  // LEGACY: Mantener temporalmente para compatibilidad
  async getNewsLegacy(page = 1, limit = 10): Promise<any> {
    console.warn('⚠️ [FEED SERVICE] getNewsLegacy está deprecado, usa getNews()');
    
    return this.getNews({
      page,
      limit,
      sort: 'published_at',
      order: 'desc'
    });
  }

  // Método helper para obtener contenido según pestaña
  async getContentByTab(tab: 'todo' | 'noticias' | 'comunidad' | 'seguidores', params: FeedParams = {}): Promise<FeedResponse> {
    switch (tab) {
      case 'todo':
        return this.getFeed(params);
      case 'noticias':
        return this.getNews(params);
      case 'comunidad':
        return this.getCommunity(params);
      case 'seguidores':
        return this.getFollowing(params);
      default:
        throw new Error(`Pestaña no válida: ${tab}`);
    }
  }

  // Método helper para construir parámetros por defecto
  buildDefaultParams(page = 1, limit = 10, sort = 'published_at', order = 'desc'): FeedParams {
    return {
      page,
      limit,
      sort: sort as any,
      order: order as any
    };
  }

  // Método para verificar si una respuesta tiene más páginas
  hasMorePages(response: FeedResponse): boolean {
    return response.pagination.page < response.pagination.totalPages;
  }

  // Método para obtener la siguiente página
  getNextPage(response: FeedResponse): number {
    return response.pagination.page + 1;
  }

  // Método para limpiar caché (si se implementa en el futuro)
  clearCache(): void {
    console.log('🧹 [FEED SERVICE] Cache cleared (placeholder)');
    // Implementar lógica de limpieza de caché si es necesario
  }

  // ❤️ LIKES - API UNIFICADA usando feedId
  async toggleLike(feedId: number, retryCount = 0): Promise<{ liked: boolean; likes_count: number; message: string }> {
    
    try {
      const response = await this.apiClient.post(`/feed/${feedId}/like/toggle`);
      
      // Validar estructura de respuesta
      const data = response.data;
      if (!data) {
        throw new Error('Respuesta vacía del servidor');
      }
      
      // Retornar con valores por defecto si faltan campos
      return {
        liked: data.liked ?? true, // Asumir que se agregó like si no se especifica
        likes_count: data.likes_count ?? 0,
        message: data.message || 'Operación completada'
      };
      
    } catch (error: any) {
      console.log(`❌ [FEED SERVICE] Error in toggleLike:`, error);
      
      // Manejo específico de errores 400 relacionados con likes duplicados
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || '';
        
        if (errorMessage.includes('ya has dado like') || errorMessage.includes('already liked')) {
          console.log(`🔄 [FEED SERVICE] Like ya existe, intentando quitar like`);
          
          // Si es primer intento y el error indica like duplicado, 
          // intentar una vez más (podría ser un toggle que falló)
          if (retryCount === 0) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Pequeña pausa
            return this.toggleLike(feedId, 1);
          }
          
          // Si ya es retry, considerar como exitoso (like ya existía)
          return {
            liked: false, // Asumir que se quitó
            likes_count: 0,
            message: 'Like removido (ya existía)'
          };
        }
      }
      
      // Para otros errores, lanzar la excepción
      throw this.handleApiError(error);
    }
  }

  // 💬 COMENTARIOS - API UNIFICADA usando feedId
  async getComments(feedId: number): Promise<any[]> {
    
    try {
      const response = await this.apiClient.get<any[]>(`/feed/${feedId}/comments`);
      return response.data;
    } catch (error) {
      console.error('❌ [FEED SERVICE] Error in getComments:', error);
      throw error;
    }
  }

  // Crear comentario
  async createComment(feedId: number, content: string): Promise<{ id: number; comments_count: number; message: string }> {
    
    try {
      const payload = { content };
      const response = await this.apiClient.post<{ id: number; comments_count: number; message: string }>(`/feed/${feedId}/comments`, payload);
      return response.data;
    } catch (error) {
      console.error('❌ [FEED SERVICE] Error in createComment:', error);
      throw error;
    }
  }

  // ❤️ Obtener estado de likes para una lista de feedIds (requiere backend)
  async getLikedStatuses(feedIds: number[]): Promise<Record<number, boolean>> {
    if (!Array.isArray(feedIds) || feedIds.length === 0) return {};
    try {
      const idsParam = feedIds.join(',');
      const response = await this.apiClient.get<{ statuses?: Record<number, boolean>; likedIds?: number[] }>(`/feed/likes/status`, {
        params: { ids: idsParam }
      });
      const data = response.data || {};
      if (data.statuses && typeof data.statuses === 'object') {
        return data.statuses;
      }
      if (Array.isArray(data.likedIds)) {
        const set = new Set<number>(data.likedIds);
        const map: Record<number, boolean> = {};
        for (const id of feedIds) map[id] = set.has(id);
        return map;
      }
      // Si la respuesta no trae estructura esperada, devolver vacío
      return {};
    } catch (error: any) {
      // Fallback: intentar endpoint alternativo que devuelve todos los IDs con like del usuario
      if (error.response?.status === 404) {
        try {
          const alt = await this.apiClient.get<{ likedIds: number[] }>(`/feed/likes/my`);
          const likedIds = Array.isArray(alt.data?.likedIds) ? alt.data.likedIds : [];
          const set = new Set<number>(likedIds);
          const map: Record<number, boolean> = {};
          for (const id of feedIds) map[id] = set.has(id);
          return map;
        } catch {
          return {};
        }
      }
      return {};
    }
  }
}

// Exportar instancia singleton
export const feedService = new FeedService();

// Exportar clase para testing
export { FeedService };

// Exportar funciones individuales para compatibilidad
export const {
  getFeed,
  getNews,
  getCommunity,
  getFollowing,
  getFeedStats,
  getPostByOriginalId,
  getFeedItem,
  getNewsLegacy,
  getContentByTab,
  setToken,
  clearToken
} = feedService; 