import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosProgressEvent as AxiosUploadProgressEvent } from 'axios';
import type { LoginPayload, RegisterPayload, NewsItemCreatePayload, User, News, NewsWithPagination, Comment, Stats, ApiError, CommentCreatePayload, UserUpdatePayload } from '@/types/api';
import type { OnUploadProgressCallback } from '@/types/index'; // Importar el tipo

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

let token: string | null = localStorage.getItem('token');

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function setToken(newToken: string): void {
  token = newToken;
  localStorage.setItem('token', newToken);
}

function clearToken(): void {
  token = null;
  localStorage.removeItem('token');
}

function isAuthenticated(): boolean {
  return !!token;
}

async function handleApiError(error: any): Promise<never> {
  if (axios.isAxiosError(error) && error.response) {
    const apiError = error.response.data as ApiError;
    throw new Error(apiError.error || apiError.message || 'Error en la API');
  }
  throw new Error(error.message || 'Error desconocido en la API');
}

// Autenticación
async function login(payload: LoginPayload): Promise<{ token: string; user: User }> {
  try {
    const response = await apiClient.post<{ token: string; user: User }>('/auth/login', payload);
    setToken(response.data.token);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

async function register(payload: RegisterPayload): Promise<User> {
  try {
    const response = await apiClient.post<User>('/auth/register', payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// Noticias
async function getNoticias(page = 1, limit = 10): Promise<NewsWithPagination> {
  try {
    const response = await apiClient.get<NewsWithPagination>('/news', { params: { page, limit } });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

async function getNoticia(id: number | string): Promise<News> {
  try {
    const response = await apiClient.get<News>(`/news/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

async function crearNoticia(payload: NewsItemCreatePayload): Promise<News> {
  try {
    const response = await apiClient.post<News>('/news', payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

async function actualizarNoticia(id: number | string, payload: Partial<NewsItemCreatePayload>): Promise<News> {
  try {
    const response = await apiClient.put<News>(`/news/${id}`, payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

async function eliminarNoticia(id: number | string): Promise<void> {
  try {
    await apiClient.delete(`/news/${id}`);
  } catch (error) {
    return handleApiError(error);
  }
}

// Comentarios
async function getComentarios(noticiaId: number | string): Promise<Comment[]> {
  try {
    const response = await apiClient.get<Comment[]>(`/news/${noticiaId}/comments`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

async function crearComentario(noticiaId: number | string, payload: CommentCreatePayload): Promise<{ id: number; message: string }> {
  try {
    const response = await apiClient.post<{ id: number; message: string }>(`/news/${noticiaId}/comments`, payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// Usuarios (Admin)
async function getUsuarios(): Promise<{ data: User[] }> {
  try {
    const response = await apiClient.get<{ data: User[] }>('/users');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

async function actualizarUsuario(id: number | string, payload: UserUpdatePayload): Promise<User> {
  try {
    const response = await apiClient.put<User>(`/users/${id}`, payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

async function eliminarUsuario(id: number | string): Promise<void> {
  try {
    await apiClient.delete(`/users/${id}`);
  } catch (error) {
    return handleApiError(error);
  }
}

// Estadísticas
async function getEstadisticas(): Promise<Stats> {
  try {
    const response = await apiClient.get<Stats>('/stats');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// Nueva función para crear comunicación con FormData
async function crearComunicacion(formData: FormData, onUploadProgress?: OnUploadProgressCallback): Promise<any> { // Puedes definir un tipo más específico para la respuesta si lo conoces
  try {
    const response = await apiClient.post('/com', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onUploadProgress ? (progressEvent: AxiosUploadProgressEvent) => {
        // AxiosProgressEvent tiene 'total' como opcional, pero nuestro UploadProgressEvent también.
        // Aquí adaptamos el evento de Axios a nuestro tipo si es necesario, o simplemente lo pasamos.
        // Por simplicidad, asumimos que son compatibles o casteamos.
        onUploadProgress(progressEvent as any); // Usamos 'as any' por simplicidad, se puede mejorar el mapeo.
      } : undefined,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export const apiService = {
  setToken,
  clearToken,
  isAuthenticated,
  login,
  register,
  getNoticias,
  getNoticia,
  crearNoticia,
  actualizarNoticia,
  eliminarNoticia,
  getComentarios,
  crearComentario,
  getUsuarios,
  actualizarUsuario,
  eliminarUsuario,
  getEstadisticas,
  crearComunicacion, // Asegúrate de exportar la nueva función
}; 