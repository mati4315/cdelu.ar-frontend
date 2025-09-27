// 👤 Servicio de Perfil - Gestión de posts de usuario
// Archivo: src/services/profileService.ts

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { 
  ProfileResponse, 
  UserPost, 
  UserPostsResponse, 
  UserPostUpdatePayload,
  UserPostMediaUpdatePayload,
  ApiError 
} from '@/types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

class ProfileService {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 segundos para uploads
    });

    // Interceptor para agregar token automáticamente
    this.apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      return config;
    });

    // Interceptor para manejar errores
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[PROFILE SERVICE] Error en request:', error);
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  // Manejo de errores de API
  private handleApiError(error: any): Error {
    let errorMessage = 'Error en la API del perfil';
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          errorMessage = data?.message || 'Solicitud inválida';
          break;
        case 401:
          // Limpiar token expirado
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          errorMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 413:
          errorMessage = 'El archivo es demasiado grande';
          break;
        case 415:
          errorMessage = 'Tipo de archivo no permitido';
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

  // 👤 Obtener mi perfil
  async getMyProfile(): Promise<ProfileResponse> {
    try {
      const response = await this.apiClient.get<ProfileResponse>('/profile/me');
      return response.data;
    } catch (error) {
      console.error('❌ [PROFILE SERVICE] Error in getMyProfile:', error);
      throw error;
    }
  }

  // 👤 Obtener perfil público de usuario
  async getUserProfile(userId: number): Promise<ProfileResponse> {
    try {
      const response = await this.apiClient.get<ProfileResponse>(`/profile/${userId}`);
      return response.data;
    } catch (error) {
      console.error('❌ [PROFILE SERVICE] Error in getUserProfile:', error);
      throw error;
    }
  }

  // 📝 Obtener MIS posts
  async getMyPosts(params: {
    page?: number;
    limit?: number;
    order?: 'asc' | 'desc';
  } = {}): Promise<UserPostsResponse> {
    try {
      const { page = 1, limit = 10, order = 'desc' } = params;
      const response = await this.apiClient.get<UserPostsResponse>('/profile/me/posts', {
        params: { page, limit, order }
      });
      return response.data;
    } catch (error) {
      console.error('❌ [PROFILE SERVICE] Error in getMyPosts:', error);
      throw error;
    }
  }

  // 📝 Obtener posts de un usuario específico
  async getUserPosts(userId: number, params: {
    page?: number;
    limit?: number;
    order?: 'asc' | 'desc';
  } = {}): Promise<UserPostsResponse> {
    try {
      const { page = 1, limit = 10, order = 'desc' } = params;
      const response = await this.apiClient.get<UserPostsResponse>(`/profile/${userId}/posts`, {
        params: { page, limit, order }
      });
      return response.data;
    } catch (error) {
      console.error('❌ [PROFILE SERVICE] Error in getUserPosts:', error);
      throw error;
    }
  }

  // ✏️ Actualizar texto de MI post
  async updateMyPostText(postId: number, payload: UserPostUpdatePayload): Promise<UserPost> {
    try {
      const response = await this.apiClient.put<UserPost>(`/profile/me/posts/${postId}`, payload);
      return response.data;
    } catch (error) {
      console.error('❌ [PROFILE SERVICE] Error in updateMyPostText:', error);
      throw error;
    }
  }

  // 🖼️ Actualizar media de MI post
  async updateMyPostMedia(postId: number, formData: FormData): Promise<UserPost> {
    try {
      const response = await this.apiClient.put<UserPost>(`/profile/me/posts/${postId}/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ [PROFILE SERVICE] Error in updateMyPostMedia:', error);
      throw error;
    }
  }

  // 🗑️ Eliminar MI post
  async deleteMyPost(postId: number): Promise<void> {
    try {
      await this.apiClient.delete(`/profile/me/posts/${postId}`);
    } catch (error) {
      console.error('❌ [PROFILE SERVICE] Error in deleteMyPost:', error);
      throw error;
    }
  }

  // 📤 Crear nuevo post de comunidad
  async createCommunityPost(formData: FormData): Promise<UserPost> {
    try {
      const response = await this.apiClient.post<UserPost>('/com', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ [PROFILE SERVICE] Error in createCommunityPost:', error);
      throw error;
    }
  }

  // 🔧 Helper para crear FormData para actualización de media
  createMediaFormData(options: {
    images?: File[];
    video?: File;
    removeVideo?: boolean;
    removeImages?: string[];
  }): FormData {
    const formData = new FormData();

    // Agregar imágenes
    if (options.images) {
      options.images.forEach(image => {
        formData.append('image', image);
      });
    }

    // Agregar video
    if (options.video) {
      formData.append('video', options.video);
    }

    // Remover video
    if (options.removeVideo) {
      formData.append('remove_video', 'true');
    }

    // Remover imágenes específicas
    if (options.removeImages && options.removeImages.length > 0) {
      formData.append('remove_images', options.removeImages.join(','));
    }

    return formData;
  }

  // 🔧 Helper para crear FormData para post de comunidad
  createCommunityPostFormData(data: {
    titulo: string;
    descripcion: string;
    images?: File[];
    video?: File;
  }): FormData {
    const formData = new FormData();
    
    formData.append('titulo', data.titulo);
    formData.append('descripcion', data.descripcion);

    // Agregar imágenes
    if (data.images) {
      data.images.forEach(image => {
        formData.append('image', image);
      });
    }

    // Agregar video
    if (data.video) {
      formData.append('video', data.video);
    }

    return formData;
  }

  // 📊 Validaciones del lado cliente
  validateImage(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tipo de imagen no permitido. Solo JPEG, PNG y WebP.' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'La imagen es demasiado grande. Máximo 10MB.' };
    }

    return { valid: true };
  }

  validateVideo(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['video/mp4'];
    const maxSize = 200 * 1024 * 1024; // 200MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tipo de video no permitido. Solo MP4.' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'El video es demasiado grande. Máximo 200MB.' };
    }

    return { valid: true };
  }

  validateImages(files: File[]): { valid: boolean; errors: string[] } {
    const maxImages = 6;
    const errors: string[] = [];

    if (files.length > maxImages) {
      errors.push(`Máximo ${maxImages} imágenes permitidas.`);
    }

    files.forEach((file, index) => {
      const validation = this.validateImage(file);
      if (!validation.valid) {
        errors.push(`Imagen ${index + 1}: ${validation.error}`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  // 🖼️ Métodos de foto de perfil (compatibilidad con código existente)
  getFullImageUrl(imageUrl?: string | null): string {
    if (!imageUrl) {
      return '/default-avatar.png'; // Avatar por defecto
    }
    
    // Si ya es una URL completa, devolverla tal como está
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const serverBase = baseUrl.replace('/api/v1', '');
    
    // Si comienza con /public, remover el /public para evitar duplicación
    if (imageUrl.startsWith('/public/')) {
      const cleanUrl = imageUrl.replace('/public/', '/');
      return `${serverBase}${cleanUrl}`;
    }
    
    // Si comienza con /, es una ruta absoluta del servidor
    if (imageUrl.startsWith('/')) {
      return `${serverBase}${imageUrl}`;
    }
    
    // Si es una ruta relativa, construir URL completa
    return `${serverBase}/${imageUrl}`;
  }

  async uploadProfilePicture(file: File): Promise<{ message: string; profile_picture_url: string }> {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await this.apiClient.post<{ message: string; profile_picture_url: string }>('/profile/me/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ [PROFILE SERVICE] Error in uploadProfilePicture:', error);
      throw error;
    }
  }

  async removeProfilePicture(): Promise<{ message: string }> {
    try {
      const response = await this.apiClient.delete<{ message: string }>('/profile/me/picture');
      return response.data;
    } catch (error) {
      console.error('❌ [PROFILE SERVICE] Error in removeProfilePicture:', error);
      throw error;
    }
  }

  validateImageFile(file: File): { valid: boolean; error?: string } {
    return this.validateImage(file);
  }

  async createImagePreview(file: File): Promise<string> {
    return URL.createObjectURL(file);
  }
}

// Exportar instancia singleton
export const profileService = new ProfileService();

// Exportar clase para testing
export { ProfileService };

// Exportar funciones individuales para compatibilidad
export const {
  getMyProfile,
  getUserProfile,
  getMyPosts,
  getUserPosts,
  updateMyPostText,
  updateMyPostMedia,
  deleteMyPost,
  createCommunityPost,
  createMediaFormData,
  createCommunityPostFormData,
  validateImage,
  validateVideo,
  validateImages,
  getFullImageUrl,
  uploadProfilePicture,
  removeProfilePicture,
  validateImageFile,
  createImagePreview
} = profileService;