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