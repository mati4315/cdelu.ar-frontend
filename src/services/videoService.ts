import axios from 'axios';

export interface VideoSettings {
  isVideoEnabled: boolean;
  lastModified: string;
  modifiedBy: string;
}

export interface VideoSettingsResponse {
  isVideoEnabled: boolean;
  lastModified: string;
  modifiedBy: string;
}

export interface UpdateVideoSettingsRequest {
  isVideoEnabled: boolean;
  modifiedBy: string;
}

export interface UpdateVideoSettingsResponse {
  success: boolean;
  settings: VideoSettings;
}

class VideoService {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';
  }

  /**
   * Obtiene la configuración actual del video (requiere permisos de admin)
   */
  async getVideoSettings(): Promise<VideoSettings> {
    console.log('🎥 [VIDEO SERVICE] Obteniendo configuración de video (admin)');
    
    try {
      const response = await axios.get<VideoSettingsResponse>(
        `${this.baseURL}/admin/video-settings`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ [VIDEO SERVICE] Configuración obtenida:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ [VIDEO SERVICE] Error obteniendo configuración:', error);
      
      // Si es error 401/403, es problema de autenticación
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('No tienes permisos para acceder a la configuración de video');
      }
      
      // Si es error 404, puede ser que no exista configuración (primera vez)
      if (error.response?.status === 404) {
        console.log('📝 [VIDEO SERVICE] No existe configuración, usando valores por defecto');
        return {
          isVideoEnabled: true,
          lastModified: new Date().toISOString(),
          modifiedBy: 'Sistema'
        };
      }
      
      throw new Error(`Error al obtener configuración de video: ${error.message}`);
    }
  }

  /**
   * Obtiene la configuración pública del video (sin autenticación)
   * Para que todos los usuarios puedan ver el estado global
   */
  async getPublicVideoSettings(): Promise<VideoSettings> {
    console.log('🎥 [VIDEO SERVICE] Obteniendo configuración pública de video');
    
    try {
      const response = await axios.get<VideoSettingsResponse>(
        `${this.baseURL}/video-settings/public`
      );

      console.log('✅ [VIDEO SERVICE] Configuración pública obtenida:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ [VIDEO SERVICE] Error obteniendo configuración pública:', error);
      
      // Si es error 404, puede ser que no exista configuración (primera vez)
      if (error.response?.status === 404) {
        console.log('📝 [VIDEO SERVICE] No existe configuración pública, usando valores por defecto');
        return {
          isVideoEnabled: true,
          lastModified: new Date().toISOString(),
          modifiedBy: 'Sistema'
        };
      }
      
      throw new Error(`Error al obtener configuración pública de video: ${error.message}`);
    }
  }

  /**
   * Actualiza la configuración del video
   */
  async updateVideoSettings(settings: UpdateVideoSettingsRequest): Promise<VideoSettings> {
    console.log('🎥 [VIDEO SERVICE] Actualizando configuración:', settings);
    
    try {
      const response = await axios.put<UpdateVideoSettingsResponse>(
        `${this.baseURL}/admin/video-settings`,
        settings,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new Error('El servidor no pudo actualizar la configuración');
      }

      console.log('✅ [VIDEO SERVICE] Configuración actualizada:', response.data.settings);
      return response.data.settings;
      
    } catch (error: any) {
      console.error('❌ [VIDEO SERVICE] Error actualizando configuración:', error);
      
      // Si es error 401/403, es problema de autenticación  
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('No tienes permisos para modificar la configuración de video');
      }
      
      // Si es error 422, validación fallida
      if (error.response?.status === 422) {
        throw new Error('Datos inválidos para actualizar la configuración');
      }
      
      throw new Error(`Error al actualizar configuración de video: ${error.message}`);
    }
  }

  /**
   * Verifica si el usuario tiene permisos de administrador
   */
  private hasAdminPermissions(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // Decodificar token JWT básico (sin verificar firma por simplicidad)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.rol === 'administrador' || payload.role === 'administrador';
    } catch {
      return false;
    }
  }

  /**
   * Valida que el usuario pueda usar este servicio
   */
  validateAdminAccess(): void {
    if (!this.hasAdminPermissions()) {
      throw new Error('Acceso denegado: se requieren permisos de administrador');
    }
  }
}

// Exportar instancia singleton
export const videoService = new VideoService();

// Exportar clase para testing
export { VideoService };
