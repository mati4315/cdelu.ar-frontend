export interface User {
  id: number;
  nombre: string;
  email: string;
  role: 'administrador' | 'colaborador' | 'usuario';
  created_at?: string; // Asumiendo que las fechas son strings ISO
  updated_at?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
  role?: 'administrador' | 'colaborador' | 'usuario';
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
  created_at: string;
}

export interface CommentCreatePayload {
  content: string;
}

export interface UserUpdatePayload {
  nombre?: string;
  email?: string;
  role?: 'administrador' | 'colaborador' | 'usuario';
}

export interface Stats {
  totalNoticias: number;
  totalUsuarios: number;
  totalComentarios: number;
}

export interface ApiError {
  error?: string;
  message?: string; // A veces la API puede devolver 'message' en lugar de 'error'
  // Otros campos de error que tu API pueda devolver
} 