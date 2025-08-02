// 🔧 Composable para Publicidad
// Archivo: src/composables/useAds.ts

import { ref, computed } from 'vue';
import type { Ad, AdsStats, UseAdsReturn } from '@/types/ads';
import adsService from '@/services/adsService';

/**
 * Hook para usar publicidad en componentes Vue
 */
export function useAds(): UseAdsReturn {
  // Estado reactivo
  const activeAds = ref<Ad[]>([]);
  const stats = ref<AdsStats | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Cargar anuncios activos
   */
  const loadActiveAds = async (): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await adsService.getActiveAds();
      activeAds.value = response.data;
    } catch (err) {
      console.error('Error cargando anuncios activos:', err);
      error.value = 'Error al cargar anuncios';
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Cargar estadísticas
   */
  const loadStats = async (): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await adsService.getStats();
      stats.value = response.data;
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      error.value = 'Error al cargar estadísticas';
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Registrar impresión
   */
  const registerImpression = async (id: number): Promise<void> => {
    try {
      await adsService.registerImpression(id);
    } catch (err) {
      console.error('Error registrando impresión:', err);
    }
  };

  /**
   * Registrar clic
   */
  const registerClick = async (id: number): Promise<void> => {
    try {
      await adsService.registerClick(id);
    } catch (err) {
      console.error('Error registrando clic:', err);
    }
  };

  return {
    activeAds: computed(() => activeAds.value),
    stats: computed(() => stats.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    loadActiveAds,
    loadStats,
    registerImpression,
    registerClick
  };
}

/**
 * Hook para usar publicidad con feed mezclado
 */
export function useAdsWithFeed() {
  const { activeAds, loadActiveAds } = useAds();

  /**
   * Obtener feed con anuncios mezclados
   */
  const getFeedWithAds = async (params?: { page?: number; limit?: number; includeAds?: boolean }) => {
    try {
      const response = await adsService.getFeedWithAds(params);
      return response;
    } catch (err) {
      console.error('Error obteniendo feed con anuncios:', err);
      throw err;
    }
  };

  return {
    activeAds,
    loadActiveAds,
    getFeedWithAds
  };
} 