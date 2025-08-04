// Exportar todos los stores para facilitar las importaciones
export { useAuthStore } from './auth'
export { useNewsStore } from './news'
export { useFeedStore } from './feedStore'
export { useLotteryStore } from './lottery'
export { useSurveyStore } from './survey'

// Configuración global de Pinia si fuera necesaria
export const storeConfig = {
  // Configuraciones globales aquí si las hubiera
} 