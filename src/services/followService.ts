import axios from 'axios';
import type { 
  PublicProfileResponse, 
  FollowersResponse, 
  FollowingResponse, 
  FollowActionResponse,
  UserSearchResponse,
  UserSearchQuery,
  UserPostsResponse
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

class FollowService {
  /**
   * Obtener perfil público de un usuario por username o ID
   */
  async getPublicProfile(usernameOrId: string | number): Promise<PublicProfileResponse> {
    try {
      console.log(`👤 [FOLLOW SERVICE] Obteniendo perfil público: ${usernameOrId}`);
      
      // La URL directa sin prefix de username
      const identifier = usernameOrId;
      
      const response = await axios.get(`${API_BASE_URL}/users/profile/${identifier}`, {
        headers: this.getAuthHeaders()
      });
      
      console.log(`✅ [FOLLOW SERVICE] Perfil público obtenido:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ [FOLLOW SERVICE] Error obteniendo perfil público:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener posts públicos de un usuario
   */
  async getUserPublicPosts(
    usernameOrId: string | number, 
    page: number = 1, 
    limit: number = 10
  ): Promise<UserPostsResponse> {
    try {
      console.log(`📄 [FOLLOW SERVICE] Obteniendo posts públicos: ${usernameOrId}, página ${page}`);
      
      const identifier = typeof usernameOrId === 'string' ? `username/${usernameOrId}` : usernameOrId;
      
      const response = await axios.get(`${API_BASE_URL}/users/profile/${identifier}/posts`, {
        params: { page, limit },
        headers: this.getAuthHeaders()
      });
      
      console.log(`✅ [FOLLOW SERVICE] Posts públicos obtenidos:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ [FOLLOW SERVICE] Error obteniendo posts públicos:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Seguir a un usuario
   */
  async followUser(userId: number): Promise<FollowActionResponse> {
    try {
      console.log(`👥 [FOLLOW SERVICE] Siguiendo usuario: ${userId}`);
      
      const response = await axios.post(
        `${API_BASE_URL}/users/${userId}/follow`,
        {},
        { headers: this.getAuthHeaders() }
      );
      
      console.log(`✅ [FOLLOW SERVICE] Usuario seguido exitosamente:`, response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log(`ℹ️ [FOLLOW SERVICE] Ya sigues a este usuario (409)`);
        return {
          success: true,
          message: 'Ya sigues a este usuario',
          is_following: true,
          followers_count: error.response.data.followers_count || 0
        };
      }
      console.error(`❌ [FOLLOW SERVICE] Error siguiendo usuario:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Dejar de seguir a un usuario
   */
  async unfollowUser(userId: number): Promise<FollowActionResponse> {
    try {
      console.log(`👥 [FOLLOW SERVICE] Dejando de seguir usuario: ${userId}`);
      
      const response = await axios.delete(`${API_BASE_URL}/users/${userId}/follow`, {
        headers: this.getAuthHeaders()
      });
      
      console.log(`✅ [FOLLOW SERVICE] Usuario no seguido exitosamente:`, response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log(`ℹ️ [FOLLOW SERVICE] Ya no sigues a este usuario (409)`);
        return {
          success: true,
          message: 'Ya no sigues a este usuario',
          is_following: false,
          followers_count: error.response.data.followers_count || 0
        };
      }
      console.error(`❌ [FOLLOW SERVICE] Error dejando de seguir usuario:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener lista de seguidores de un usuario
   */
  async getFollowers(
    usernameOrId: string | number, 
    page: number = 1, 
    limit: number = 20
  ): Promise<FollowersResponse> {
    try {
      console.log(`👥 [FOLLOW SERVICE] Obteniendo seguidores: ${usernameOrId}, página ${page}`);
      
      const identifier = typeof usernameOrId === 'string' ? `username/${usernameOrId}` : usernameOrId;
      
      const response = await axios.get(`${API_BASE_URL}/users/profile/${identifier}/followers`, {
        params: { page, limit },
        headers: this.getAuthHeaders()
      });
      
      console.log(`✅ [FOLLOW SERVICE] Seguidores obtenidos:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ [FOLLOW SERVICE] Error obteniendo seguidores:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener lista de usuarios que sigue
   */
  async getFollowing(
    usernameOrId: string | number, 
    page: number = 1, 
    limit: number = 20
  ): Promise<FollowingResponse> {
    try {
      console.log(`👥 [FOLLOW SERVICE] Obteniendo seguidos: ${usernameOrId}, página ${page}`);
      
      const identifier = typeof usernameOrId === 'string' ? `username/${usernameOrId}` : usernameOrId;
      
      const response = await axios.get(`${API_BASE_URL}/users/profile/${identifier}/following`, {
        params: { page, limit },
        headers: this.getAuthHeaders()
      });
      
      console.log(`✅ [FOLLOW SERVICE] Seguidos obtenidos:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ [FOLLOW SERVICE] Error obteniendo seguidos:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Buscar usuarios por nombre o username
   */
  async searchUsers(query: UserSearchQuery): Promise<UserSearchResponse> {
    try {
      console.log(`🔍 [FOLLOW SERVICE] Buscando usuarios:`, query);
      
      const response = await axios.get(`${API_BASE_URL}/users/search`, {
        params: {
          query: query.query,
          page: query.page || 1,
          limit: query.limit || 20
        },
        headers: this.getAuthHeaders()
      });
      
      console.log(`✅ [FOLLOW SERVICE] Usuarios encontrados:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ [FOLLOW SERVICE] Error buscando usuarios:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener headers de autenticación
   */
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Manejar errores de la API
   */
  private handleError(error: any): Error {
    if (error.response) {
      // Error de respuesta del servidor
      const message = error.response.data?.error || 
                     error.response.data?.message || 
                     `Error del servidor: ${error.response.status}`;
      return new Error(message);
    } else if (error.request) {
      // Error de red
      return new Error('Error de conexión. Verifica tu conexión a internet.');
    } else {
      // Error de configuración
      return new Error(error.message || 'Error inesperado');
    }
  }

  /**
   * Construir URL completa para imágenes
   */
  getFullImageUrl(imageUrl?: string | null): string {
    if (!imageUrl) {
      return '/default-avatar.png';
    }
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    const serverBase = API_BASE_URL.replace('/api/v1', '');
    
    // Si empieza con /public, remover /public para evitar duplicación
    if (imageUrl.startsWith('/public/')) {
      const cleanUrl = imageUrl.replace('/public/', '/');
      return `${serverBase}${cleanUrl}`;
    }
    
    if (imageUrl.startsWith('/')) {
      return `${serverBase}${imageUrl}`;
    }
    
    return `${serverBase}/${imageUrl}`;
  }

  /**
   * Validar username (para cuando el usuario edite el suyo)
   */
  validateUsername(username: string): boolean {
    // Username debe tener al menos 3 caracteres, solo letras, números, guiones y puntos
    const usernameRegex = /^[a-zA-Z0-9._-]{3,30}$/;
    return usernameRegex.test(username);
  }

  /**
   * Generar sugerencia de username basada en el nombre
   */
  generateUsernameFromName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '.')  // Espacios por puntos
      .replace(/[^a-z0-9._-]/g, '')  // Solo caracteres válidos
      .substring(0, 30);  // Máximo 30 caracteres
  }
}

// Exportar instancia singleton
export const followService = new FollowService();
export default followService;
