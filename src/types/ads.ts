// 🔧 Tipos TypeScript para el Sistema de Publicidad
// Archivo: src/types/ads.ts

/**
 * Tipo de anuncio
 */
export interface Ad {
  /** ID del anuncio */
  id: number;
  
  /** Título del anuncio */
  titulo: string;
  
  /** Descripción del anuncio */
  descripcion: string;
  
  /** URL de la imagen del anuncio */
  image_url?: string;
  
  /** URL de destino del anuncio */
  enlace_destino: string;
  
  /** Texto opcional del anuncio */
  texto_opcional?: string;
  
  /** Categoría del anuncio */
  categoria: string;
  
  /** Prioridad del anuncio (1-10) */
  prioridad: number;
  
  /** Si el anuncio está activo */
  activo: boolean;
  
  /** Máximo de impresiones permitidas */
  impresiones_maximas: number;
  
  /** Impresiones actuales */
  impresiones_actuales: number;
  
  /** Contador de clics */
  clics_count: number;
  
  /** Fecha de creación */
  created_at: string;
  
  /** Fecha de última actualización */
  updated_at: string;
}

/**
 * Anuncio en el feed (mezclado con contenido)
 */
export interface FeedAd extends Ad {
  /** Indica que es un anuncio */
  is_ad: true;
  
  /** Tipo de contenido (3 = anuncio) */
  type: 3;
  
  /** No tiene likes */
  is_liked: false;
  
  /** No tiene likes count */
  likes_count: 0;
  
  /** No tiene comentarios */
  comments_count: 0;
}

/**
 * Parámetros para consultas de anuncios
 */
export interface AdsParams {
  page?: number;
  limit?: number;
  categoria?: string;
  activo?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Respuesta de la API de anuncios
 */
export interface AdsResponse {
  /** Datos de anuncios */
  data: Ad[];
  
  /** Información de paginación */
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Respuesta de anuncios activos
 */
export interface ActiveAdsResponse {
  /** Datos de anuncios activos */
  data: Ad[];
  
  /** Total de anuncios activos */
  total: number;
}

/**
 * Estadísticas de anuncios
 */
export interface AdsStats {
  /** Total de anuncios */
  total: number;
  
  /** Anuncios activos */
  activos: number;
  
  /** Anuncios inactivos */
  inactivos: number;
  
  /** Total de impresiones */
  total_impresiones: number;
  
  /** Total de clics */
  total_clics: number;
  
  /** CTR promedio */
  ctr_promedio: number;
  
  /** Anuncios por categoría */
  por_categoria: Record<string, number>;
}

/**
 * Respuesta de estadísticas
 */
export interface AdsStatsResponse {
  /** Datos de estadísticas */
  data: AdsStats;
}

/**
 * Formulario para crear/editar anuncio
 */
export interface AdForm {
  titulo: string;
  descripcion: string;
  image_url?: string;
  enlace_destino: string;
  texto_opcional?: string;
  categoria: string;
  prioridad: number;
  activo: boolean;
  impresiones_maximas: number;
}

/**
 * Parámetros para el feed con anuncios
 */
export interface FeedWithAdsParams {
  page?: number;
  limit?: number;
  includeAds?: boolean;
}

/**
 * Item del feed que puede ser contenido o anuncio
 */
export type FeedItemWithAds = FeedItem | FeedAd;

/**
 * Respuesta del feed con anuncios mezclados
 */
export interface FeedWithAdsResponse {
  /** Datos del feed (contenido + anuncios) */
  data: FeedItemWithAds[];
  
  /** Información de paginación */
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Configuración de mezcla de anuncios
 */
export interface AdMixingConfig {
  /** Probabilidad de insertar anuncio (0-1) */
  probability: number;
  
  /** Máximo de posts entre anuncios */
  maxPostsBetweenAds: number;
  
  /** Mínimo de posts entre anuncios */
  minPostsBetweenAds: number;
}

/**
 * Estado del sistema de publicidad
 */
export interface AdsState {
  /** Anuncios activos */
  activeAds: Ad[];
  
  /** Estadísticas de anuncios */
  stats: AdsStats | null;
  
  /** Estado de carga */
  isLoading: boolean;
  
  /** Error actual */
  error: string | null;
  
  /** Configuración de mezcla */
  mixingConfig: AdMixingConfig;
}

/**
 * Servicio de publicidad
 */
export interface AdsService {
  /** Obtener anuncios activos */
  getActiveAds(): Promise<ActiveAdsResponse>;
  
  /** Obtener todos los anuncios */
  getAllAds(params?: AdsParams): Promise<AdsResponse>;
  
  /** Obtener anuncio por ID */
  getAdById(id: number): Promise<Ad>;
  
  /** Crear nuevo anuncio */
  createAd(ad: AdForm): Promise<Ad>;
  
  /** Actualizar anuncio */
  updateAd(id: number, ad: Partial<AdForm>): Promise<Ad>;
  
  /** Eliminar anuncio */
  deleteAd(id: number): Promise<void>;
  
  /** Obtener estadísticas */
  getStats(): Promise<AdsStatsResponse>;
  
  /** Registrar impresión */
  registerImpression(id: number): Promise<void>;
  
  /** Registrar clic */
  registerClick(id: number): Promise<void>;
}

/**
 * Hook para usar publicidad
 */
export interface UseAdsReturn {
  /** Anuncios activos */
  activeAds: Readonly<Ref<Ad[]>>;
  
  /** Estadísticas */
  stats: Readonly<Ref<AdsStats | null>>;
  
  /** Estado de carga */
  isLoading: Readonly<Ref<boolean>>;
  
  /** Error actual */
  error: Readonly<Ref<string | null>>;
  
  /** Cargar anuncios activos */
  loadActiveAds: () => Promise<void>;
  
  /** Cargar estadísticas */
  loadStats: () => Promise<void>;
  
  /** Registrar impresión */
  registerImpression: (id: number) => Promise<void>;
  
  /** Registrar clic */
  registerClick: (id: number) => Promise<void>;
} 