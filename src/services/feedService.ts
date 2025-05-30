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
    this.apiClient = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 segundos timeout
    });

    // Interceptor para agregar token automáticamente
    this.apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data as FeedApiError;
      return new Error(apiError.message || 'Error en la API del feed');
    }
    return new Error(error.message || 'Error desconocido en el feed');
  }

  // NUEVO: Feed unificado (pestaña "Todo")
  async getFeed(params: FeedParams = {}): Promise<FeedResponse> {
    console.log('🗞️ [FEED SERVICE] getFeed called with params:', params);
    
    try {
      const response = await this.apiClient.get<FeedResponse>('/feed', { params });
      console.log('✅ [FEED SERVICE] getFeed response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [FEED SERVICE] Error in getFeed:', error);
      throw error;
    }
  }

  // NUEVO: Solo noticias (equivale a la API actual de news)
  async getNews(params: FeedParams = {}): Promise<FeedResponse> {
    console.log('📰 [FEED SERVICE] getNews called with params:', params);
    
    try {
      const response = await this.apiClient.get<FeedResponse>('/feed/noticias', { params });
      console.log('✅ [FEED SERVICE] getNews response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [FEED SERVICE] Error in getNews:', error);
      throw error;
    }
  }

  // NUEVO: Solo comunidad
  async getCommunity(params: FeedParams = {}): Promise<FeedResponse> {
    console.log('👥 [FEED SERVICE] getCommunity called with params:', params);
    
    try {
      const response = await this.apiClient.get<FeedResponse>('/feed/comunidad', { params });
      console.log('✅ [FEED SERVICE] getCommunity response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [FEED SERVICE] Error in getCommunity:', error);
      throw error;
    }
  }

  // NUEVO: Estadísticas del feed
  async getFeedStats(): Promise<FeedStats> {
    console.log('📊 [FEED SERVICE] getFeedStats called');
    
    try {
      const response = await this.apiClient.get<FeedStats>('/feed/stats');
      console.log('✅ [FEED SERVICE] getFeedStats response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [FEED SERVICE] Error in getFeedStats:', error);
      throw error;
    }
  }

  // NUEVO: Elemento específico por original_id (ID del post original, no del feed)
  async getPostByOriginalId(type: FeedType, originalId: number): Promise<FeedItem> {
    console.log(`🔍 [FEED SERVICE] getPostByOriginalId called - type: ${type}, originalId: ${originalId}`);
    
    try {
      // Usar la ruta específica para obtener por original_id
      // Esto debería coincidir con las rutas que espera el backend
      const endpoint = type === 1 ? `/news/${originalId}` : `/com/${originalId}`;
      const response = await this.apiClient.get<FeedItem>(endpoint);
      console.log('✅ [FEED SERVICE] getPostByOriginalId response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [FEED SERVICE] Error in getPostByOriginalId:', error);
      throw error;
    }
  }

  // NUEVO: Elemento específico por feed ID (del feed unificado)
  async getFeedItem(type: FeedType, id: number): Promise<FeedItem> {
    console.log(`🔍 [FEED SERVICE] getFeedItem called - type: ${type}, feedId: ${id}`);
    
    try {
      const response = await this.apiClient.get<FeedItem>(`/feed/${type}/${id}`);
      console.log('✅ [FEED SERVICE] getFeedItem response:', response.data);
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
  async getContentByTab(tab: 'todo' | 'noticias' | 'comunidad', params: FeedParams = {}): Promise<FeedResponse> {
    console.log(`🎯 [FEED SERVICE] getContentByTab called - tab: ${tab}, params:`, params);
    
    switch (tab) {
      case 'todo':
        return this.getFeed(params);
      case 'noticias':
        return this.getNews(params);
      case 'comunidad':
        return this.getCommunity(params);
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
  async toggleLike(feedId: number): Promise<{ liked: boolean; likes_count: number; message: string }> {
    console.log(`❤️ [FEED SERVICE] toggleLike called - feedId: ${feedId}`);
    
    try {
      const response = await this.apiClient.post<{ liked: boolean; likes_count: number; message: string }>(`/feed/${feedId}/like`);
      console.log('✅ [FEED SERVICE] toggleLike response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [FEED SERVICE] Error in toggleLike:', error);
      throw error;
    }
  }

  // Método específico para dar like
  async addLike(feedId: number): Promise<{ likes_count: number; message: string }> {
    console.log(`❤️ [FEED SERVICE] addLike called - feedId: ${feedId}`);
    
    try {
      const response = await this.apiClient.post<{ likes_count: number; message: string }>(`/feed/${feedId}/like`);
      console.log('✅ [FEED SERVICE] addLike response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [FEED SERVICE] Error in addLike:', error);
      throw error;
    }
  }

  // Método específico para quitar like
  async removeLike(feedId: number): Promise<{ likes_count: number; message: string }> {
    console.log(`💔 [FEED SERVICE] removeLike called - feedId: ${feedId}`);
    
    try {
      const response = await this.apiClient.delete<{ likes_count: number; message: string }>(`/feed/${feedId}/like`);
      console.log('✅ [FEED SERVICE] removeLike response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [FEED SERVICE] Error in removeLike:', error);
      throw error;
    }
  }

  // 💬 COMENTARIOS - API UNIFICADA usando feedId
  async getComments(feedId: number): Promise<any[]> {
    console.log(`💬 [FEED SERVICE] getComments called - feedId: ${feedId}`);
    
    try {
      const response = await this.apiClient.get<any[]>(`/feed/${feedId}/comments`);
      console.log('✅ [FEED SERVICE] getComments response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [FEED SERVICE] Error in getComments:', error);
      throw error;
    }
  }

  // Crear comentario
  async createComment(feedId: number, content: string): Promise<{ id: number; comments_count: number; message: string }> {
    console.log(`💬 [FEED SERVICE] createComment called - feedId: ${feedId}, content:`, content);
    
    try {
      const payload = { content };
      const response = await this.apiClient.post<{ id: number; comments_count: number; message: string }>(`/feed/${feedId}/comments`, payload);
      console.log('✅ [FEED SERVICE] createComment response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [FEED SERVICE] Error in createComment:', error);
      throw error;
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
  getFeedStats,
  getPostByOriginalId,
  getFeedItem,
  getNewsLegacy,
  getContentByTab,
  setToken,
  clearToken
} = feedService; 