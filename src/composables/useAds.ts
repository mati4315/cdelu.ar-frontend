// 🔧 Composable para Publicidad
// Archivo: src/composables/useAds.ts

import { ref, computed } from 'vue';
import type { Ad, AdsStats, UseAdsReturn, LotteryAdData } from '@/types/ads';
import type { Lottery } from '@/types/lottery';
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
export function useAdsWithLottery() {
  const { activeAds, stats, isLoading, error, loadActiveAds, loadStats, registerImpression, registerClick } = useAds();
  
  // Estado para loterías activas
  const activeLotteries = ref<Lottery[]>([]);
  const userTickets = ref<any[]>([]);
  const dynamicLotteryAd = ref<Ad | null>(null);

  /**
   * Cargar loterías activas
   */
  const loadActiveLotteries = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/lotteries?status=active');
      if (response.ok) {
        const data = await response.json();
        activeLotteries.value = data.data || [];
        console.log('🎰 Loterías activas cargadas:', activeLotteries.value.length);
      } else {
        console.warn('⚠️ No se pudieron cargar loterías activas');
        activeLotteries.value = [];
      }
    } catch (err) {
      console.error('Error cargando loterías activas:', err);
      activeLotteries.value = [];
    }
  };

  /**
   * Cargar tickets del usuario
   */
  const loadUserTickets = async (): Promise<void> => {
    try {
      // Aquí deberías llamar al servicio de loterías
      // Por ahora usamos datos de ejemplo
      userTickets.value = [];
    } catch (err) {
      console.error('Error cargando tickets del usuario:', err);
    }
  };

  /**
   * Generar anuncio dinámico de lotería
   */
  const generateLotteryAd = async (): Promise<void> => {
    try {
      if (activeLotteries.value.length === 0) {
        dynamicLotteryAd.value = null;
        return;
      }

      const lotteryAd = await adsService.generateLotteryAd(activeLotteries.value, userTickets.value);
      dynamicLotteryAd.value = lotteryAd;
    } catch (err) {
      console.error('Error generando anuncio de lotería:', err);
      dynamicLotteryAd.value = null;
    }
  };

  /**
   * Obtener anuncios con lotería dinámica
   */
  const adsWithLottery = computed(() => {
    const ads = [...activeAds.value];
    
    // Insertar anuncio de lotería dinámico si existe
    if (dynamicLotteryAd.value) {
      // Insertar al principio con prioridad 3
      ads.unshift(dynamicLotteryAd.value);
    }
    
    return ads;
  });

  /**
   * Verificar si un anuncio es de lotería
   */
  const isLotteryAd = (ad: Ad): boolean => {
    return adsService.isLotteryAd(ad);
  };

  /**
   * Inicializar anuncios con lotería
   */
  const initializeAdsWithLottery = async (): Promise<void> => {
    await Promise.all([
      loadActiveAds(),
      loadActiveLotteries(),
      loadUserTickets()
    ]);
    
    await generateLotteryAd();
  };

  return {
    // Funciones del hook base
    activeAds,
    stats,
    isLoading,
    error,
    loadActiveAds,
    loadStats,
    registerImpression,
    registerClick,
    
    // Funciones específicas para lotería
    activeLotteries: computed(() => activeLotteries.value),
    userTickets: computed(() => userTickets.value),
    dynamicLotteryAd: computed(() => dynamicLotteryAd.value),
    adsWithLottery,
    isLotteryAd,
    loadActiveLotteries,
    loadUserTickets,
    generateLotteryAd,
    initializeAdsWithLottery
  };
} 