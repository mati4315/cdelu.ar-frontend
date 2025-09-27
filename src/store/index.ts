// Exportar todos los stores para facilitar las importaciones
export { useAuthStore } from './auth'
export { useNewsStore } from './news'
export { useFeedStore } from './feedStore'
export { useLotteryStore } from './lottery'
export { useSurveyStore } from './survey'
export { useLiveStore } from './live'
export { useProfileStore } from './profileStore'
export { useFollowStore } from './followStore'
export { useVideoStore } from './videoStore'

// Configuración global de Pinia si fuera necesaria
export const storeConfig = {
  // Configuraciones globales aquí si las hubiera
} 