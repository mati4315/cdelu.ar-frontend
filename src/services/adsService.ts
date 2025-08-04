// 🔧 Servicio de Publicidad para el Frontend
// Archivo: src/services/adsService.ts

import axios from 'axios';
import type { 
  Ad, 
  AdsParams, 
  AdsResponse, 
  ActiveAdsResponse, 
  AdsStatsResponse,
  AdForm,
  LotteryAdData
} from '@/types/ads';
import type { Lottery } from '@/types/lottery';

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
  },

  /**
   * Generar anuncio dinámico de lotería
   */
  async generateLotteryAd(activeLotteries: Lottery[], userTickets?: any[]): Promise<Ad | null> {
    if (!activeLotteries || activeLotteries.length === 0) {
      return null;
    }

    // Seleccionar lotería aleatoria
    const randomIndex = Math.floor(Math.random() * activeLotteries.length);
    const selectedLottery = activeLotteries[randomIndex];

    // Verificar si el usuario participó
    const userParticipated = userTickets?.some(ticket => ticket.lottery_id === selectedLottery.id) || false;
    const userTicketNumbers = userTickets
      ?.filter(ticket => ticket.lottery_id === selectedLottery.id)
      .map(ticket => ticket.ticket_number) || [];

    // Crear datos del anuncio dinámico
    const lotteryData: LotteryAdData = {
      lottery_id: selectedLottery.id,
      lottery_title: selectedLottery.title,
      lottery_description: selectedLottery.description,
      lottery_image: selectedLottery.image_url,
      is_free: selectedLottery.is_free,
      ticket_price: selectedLottery.ticket_price,
      tickets_sold: selectedLottery.tickets_sold || 0,
      max_tickets: selectedLottery.max_tickets,
      num_winners: selectedLottery.num_winners,
      end_date: selectedLottery.end_date,
      status: selectedLottery.status,
      user_participated: userParticipated,
      user_ticket_numbers: userTicketNumbers
    };

    // Crear anuncio dinámico
    const dynamicAd: Ad = {
      id: -1, // ID temporal para anuncios dinámicos
      titulo: `🎰 ${selectedLottery.title}`,
      descripcion: selectedLottery.description || '¡Participa en nuestra lotería y gana premios increíbles!',
      image_url: selectedLottery.image_url,
      enlace_destino: `/lotteries/${selectedLottery.id}`,
      texto_opcional: userParticipated 
        ? `Ya participaste con los números: ${userTicketNumbers.join(', ')}`
        : selectedLottery.is_free 
          ? '¡Participación gratuita!' 
          : `Precio: $${selectedLottery.ticket_price}`,
      categoria: 'eventos',
      prioridad: 3, // Prioridad especial para anuncios de lotería
      activo: true,
      impresiones_maximas: 0, // Sin límite para anuncios dinámicos
      impresiones_actuales: 0,
      clics_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tipo_especial: 'lottery_dynamic',
      datos_especiales: lotteryData
    };

    return dynamicAd;
  },

  /**
   * Verificar si un anuncio es de lotería dinámica
   */
  isLotteryAd(ad: Ad): boolean {
    return ad.titulo.includes('🎰') || 
           ad.titulo.includes('Lotería') || 
           ad.categoria === 'eventos' && ad.prioridad === 3;
  }
};

export default adsService; 