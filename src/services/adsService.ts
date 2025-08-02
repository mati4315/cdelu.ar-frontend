// 🔧 Servicio de Publicidad para el Frontend
// Archivo: src/services/adsService.ts

import axios from 'axios';
import type { 
  Ad, 
  AdsParams, 
  AdsResponse, 
  ActiveAdsResponse, 
  AdsStatsResponse,
  AdForm 
} from '@/types/ads';

/**
 * Configuración del servicio de publicidad
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Instancia de axios para el servicio de publicidad
 */
const adsApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

/**
 * Interceptor para agregar token de autenticación
 */
adsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Servicio de publicidad
 */
export const adsService = {
  /**
   * Obtener anuncios activos (público)
   */
  async getActiveAds(): Promise<ActiveAdsResponse> {
    const response = await adsApi.get('/api/v1/ads/active');
    return response.data;
  },

  /**
   * Obtener todos los anuncios (requiere autenticación)
   */
  async getAllAds(params?: AdsParams): Promise<AdsResponse> {
    const response = await adsApi.get('/api/v1/ads', { params });
    return response.data;
  },

  /**
   * Obtener anuncio por ID (requiere autenticación)
   */
  async getAdById(id: number): Promise<Ad> {
    const response = await adsApi.get(`/api/v1/ads/${id}`);
    return response.data.data;
  },

  /**
   * Crear nuevo anuncio (requiere autenticación)
   */
  async createAd(ad: AdForm): Promise<Ad> {
    const response = await adsApi.post('/api/v1/ads', ad);
    return response.data.data;
  },

  /**
   * Actualizar anuncio (requiere autenticación)
   */
  async updateAd(id: number, ad: Partial<AdForm>): Promise<Ad> {
    const response = await adsApi.put(`/api/v1/ads/${id}`, ad);
    return response.data.data;
  },

  /**
   * Eliminar anuncio (requiere autenticación)
   */
  async deleteAd(id: number): Promise<void> {
    await adsApi.delete(`/api/v1/ads/${id}`);
  },

  /**
   * Obtener estadísticas (requiere autenticación)
   */
  async getStats(): Promise<AdsStatsResponse> {
    const response = await adsApi.get('/api/v1/ads/stats');
    return response.data;
  },

  /**
   * Registrar impresión (público)
   */
  async registerImpression(id: number): Promise<void> {
    await adsApi.post(`/api/v1/ads/${id}/impression`);
  },

  /**
   * Registrar clic (público)
   */
  async registerClick(id: number): Promise<void> {
    await adsApi.post(`/api/v1/ads/${id}/click`);
  },

  /**
   * Obtener feed con anuncios mezclados (público)
   */
  async getFeedWithAds(params?: { page?: number; limit?: number; includeAds?: boolean }) {
    const response = await adsApi.get('/api/v1/feed', { params });
    return response.data;
  }
};

export default adsService; 