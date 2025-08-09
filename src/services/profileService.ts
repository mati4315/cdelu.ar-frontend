import axios from 'axios';
import { ProfilePictureUploadResponse, ProfileResponse, FileValidation, User } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Validaciones del cliente
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

class ProfileService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  // Validar archivo de imagen
  validateImageFile(file: File): FileValidation {
    // Verificar tipo
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de archivo no permitido. Solo se permiten JPG, PNG y WebP.'
      };
    }

    // Verificar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'El archivo es demasiado grande. Máximo 5MB.'
      };
    }

    return { valid: true };
  }

  // Subir/actualizar foto de perfil
  async uploadProfilePicture(file: File): Promise<ProfilePictureUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);

      const response = await axios.post<ProfilePictureUploadResponse>(
        `${API_BASE_URL}/profile/picture`,
        formData,
        {
          headers: {
            ...this.getAuthHeaders(),
            // No establecer Content-Type, axios lo hace automáticamente con FormData
          }
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.error || error.response.data.message || 'Error al subir la imagen');
      }
      throw new Error('Error de conexión. Intente nuevamente.');
    }
  }

  // Eliminar foto de perfil
  async removeProfilePicture(): Promise<{ message: string }> {
    try {
      const response = await axios.delete<{ message: string }>(
        `${API_BASE_URL}/profile/picture`,
        {
          headers: this.getAuthHeaders()
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.error || error.response.data.message || 'Error al eliminar la imagen');
      }
      throw new Error('Error de conexión. Intente nuevamente.');
    }
  }

  // Obtener mi perfil completo
  async getMyProfile(): Promise<ProfileResponse> {
    try {
      const response = await axios.get<ProfileResponse>(
        `${API_BASE_URL}/profile/me`,
        {
          headers: this.getAuthHeaders()
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.error || error.response.data.message || 'Error al cargar el perfil');
      }
      throw new Error('Error de conexión. Intente nuevamente.');
    }
  }

  // Obtener perfil público de usuario
  async getPublicProfile(userId: number): Promise<ProfileResponse> {
    try {
      const response = await axios.get<ProfileResponse>(
        `${API_BASE_URL}/profile/${userId}`
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.error || error.response.data.message || 'Error al cargar el perfil');
      }
      throw new Error('Error de conexión. Intente nuevamente.');
    }
  }

  // Construir URL completa de imagen
  getFullImageUrl(relativeUrl: string | null | undefined): string {
    if (!relativeUrl) {
      return '/default-avatar.png';
    }
    
    // Si ya es una URL completa, devolverla tal como está
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    
    // Construir URL completa
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${relativeUrl}`;
  }

  // Crear imagen preview para mostrar antes de subir
  createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Error al crear preview'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  }
}

export const profileService = new ProfileService();
export default profileService; 