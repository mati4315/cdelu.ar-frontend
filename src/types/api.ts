export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'administrador' | 'colaborador' | 'usuario';
  profile_picture_url?: string | null;
  created_at?: string; // Asumiendo que las fechas son strings ISO
  updated_at?: string;
  // Total de comentarios del usuario (si el backend lo provee)
  comments_count?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
  rol?: 'administrador' | 'colaborador' | 'usuario';
}

export interface News {
  id: number;
  titulo: string;
  descripcion: string;
  resumen: string;
  image_url: string;
  original_url: string;
  is_oficial: boolean;
  autor: string; // Nombre del autor
  likes_count?: number;
  comments_count?: number;
  created_at: string;
  updated_at: string;
}

export interface NewsWithPagination {
  data: News[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface NewsItemCreatePayload {
  titulo: string;
  descripcion: string;
  image_url: string;
  original_url: string;
  is_oficial: boolean;
}

export interface Comment {
  id: number;
  news_id: number;
  user_id: number;
  content: string;
  autor: string; // Nombre del usuario que comentó
  user?: User; // Usuario completo para mostrar avatar
  created_at: string;
}

export interface CommentCreatePayload {
  content: string;
}

export interface UserUpdatePayload {
  nombre?: string;
  email?: string;
  rol?: 'administrador' | 'colaborador' | 'usuario';
}

export interface Stats {
  totalNoticias: number;
  totalUsuarios: number;
  totalComentarios: number;
}

export interface ApiError {
  error?: string;
  message?: string; // A veces la API puede devolver 'message' en lugar de 'error'
  details?: string; // Detalles adicionales del error
  received?: string; // Para errores de tipo de archivo
  // Otros campos de error que tu API pueda devolver
}

// Tipos específicos para fotos de perfil
export interface ProfilePictureUploadResponse {
  message: string;
  profile_picture_url: string;
}

export interface ProfileStats {
  comments_count?: number;
  lottery_participations?: number;
  lottery_wins?: number;
  community_posts_count?: number;
}

export interface ProfileResponse {
  user: User;
  stats?: ProfileStats; // opcional si el backend lo provee
}

export interface FileValidation {
  valid: boolean;
  error?: string;
}

export interface UserWinItem {
  lottery_id: number;
  lottery_title: string;
  winning_number: number;
  won_at: string;
  prize_description?: string;
  lottery_image_url?: string;
}

export interface UserWinsResponse {
  data: UserWinItem[];
}

// 📝 Tipos para posts de usuario (nuevos endpoints de perfil)
export interface UserPost {
  id: number;
  titulo: string;
  descripcion: string;
  image_url: string | null;        // Primera imagen
  image_urls: string[];            // Todas las imágenes
  video_url: string | null;        // URL del video
  created_at: string;
  updated_at: string;
  // Campos adicionales que puede incluir el backend
  likes_count?: number;
  comments_count?: number;
  autor?: string;                  // Nombre del autor
  user_id?: number;               // ID del usuario autor
}

export interface UserPostsResponse {
  data: UserPost[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserPostUpdatePayload {
  titulo?: string;
  descripcion?: string;
}

export interface UserPostMediaUpdatePayload {
  image?: File[];                  // Nuevas imágenes a agregar
  video?: File;                   // Nuevo video
  remove_video?: boolean;         // Eliminar video actual
  remove_images?: string[];       // Nombres de imágenes a eliminar
}

export interface CommunityPostCreatePayload {
  titulo: string;
  descripcion: string;
  images?: File[];               // Imágenes opcionales
  video?: File;                  // Video opcional
}

// 👥 Tipos para sistema de seguimiento y perfiles públicos
export interface PublicUser {
  id: number;
  nombre: string;
  username?: string;             // Nombre de usuario único para URLs
  profile_picture_url?: string | null;
  created_at?: string;
  // Información pública del perfil
  bio?: string;                  // Biografía del usuario
  location?: string;             // Ubicación del usuario
  website?: string;              // Sitio web del usuario
}

export interface FollowStats {
  followers_count: number;       // Número de seguidores
  following_count: number;       // Número de usuarios que sigue
  posts_count: number;          // Número de posts públicos
}

export interface PublicProfileResponse {
  user: PublicUser;
  stats: FollowStats;
  is_following?: boolean;        // Si el usuario actual lo sigue (solo si está autenticado)
  is_own_profile?: boolean;      // Si es el perfil del usuario actual
}

export interface FollowUser {
  id: number;
  nombre: string;
  username?: string;
  profile_picture_url?: string | null;
  followed_at?: string;          // Cuándo empezó a seguir (para followers)
  bio?: string;
}

export interface FollowersResponse {
  data: FollowUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FollowingResponse {
  data: FollowUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FollowActionResponse {
  success: boolean;
  message: string;
  is_following: boolean;         // Estado actual después de la acción
  followers_count: number;      // Nuevo número de seguidores
}

// Payload para buscar usuarios
export interface UserSearchQuery {
  query?: string;               // Término de búsqueda
  page?: number;
  limit?: number;
}

export interface UserSearchResponse {
  data: PublicUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
} 