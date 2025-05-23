import { defineStore } from 'pinia';
import { News, NewsWithPagination, Comment, NewsItemCreatePayload, CommentCreatePayload } from '@/types/api';
import { apiService } from '@/services/apiService';

interface NewsState {
  newsList: News[];
  currentNewsItem: News | null;
  comments: Comment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

export const useNewsStore = defineStore('news', {
  state: (): NewsState => ({
    newsList: [],
    currentNewsItem: null,
    comments: [],
    pagination: null,
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchNoticias(page = 1, limit = 10) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiService.getNoticias(page, limit);
        this.newsList = response.data;
        this.pagination = response.pagination;
      } catch (e: any) {
        this.error = e.message || 'Error al cargar noticias';
        this.newsList = [];
        this.pagination = null;
        // Considera si quieres relanzar el error o manejarlo aquí
      } finally {
        this.isLoading = false;
      }
    },
    async fetchNoticia(id: number | string) {
      this.isLoading = true;
      this.error = null;
      this.currentNewsItem = null; // Limpiar noticia anterior
      try {
        const response = await apiService.getNoticia(id);
        this.currentNewsItem = response;
      } catch (e: any) {
        this.error = e.message || 'Error al cargar la noticia';
        // Considera si quieres relanzar el error
      } finally {
        this.isLoading = false;
      }
    },
    async crearNoticia(payload: NewsItemCreatePayload) {
      this.isLoading = true;
      this.error = null;
      try {
        const nuevaNoticia = await apiService.crearNoticia(payload);
        // Opcional: añadir a newsList o recargar la lista
        // this.newsList.unshift(nuevaNoticia); // Añadir al principio
        return nuevaNoticia; // Devolver la noticia creada
      } catch (e: any) {
        this.error = e.message || 'Error al crear la noticia';
        throw e; // Relanzar para que el componente lo maneje
      } finally {
        this.isLoading = false;
      }
    },
    async fetchComentarios(noticiaId: number | string) {
      this.isLoading = true; // Podrías tener un isLoadingComments específico
      this.error = null;
      try {
        this.comments = await apiService.getComentarios(noticiaId);
      } catch (e: any) {
        this.error = e.message || 'Error al cargar comentarios';
        this.comments = [];
      } finally {
        this.isLoading = false;
      }
    },
    async crearComentario(noticiaId: number | string, payload: CommentCreatePayload) {
      // Idealmente, un estado de carga específico para esta acción
      this.error = null;
      try {
        const nuevoComentario = await apiService.crearComentario(noticiaId, payload);
        // Actualizar la lista de comentarios (la API devuelve solo id y mensaje)
        // Para una UI reactiva, sería mejor que la API devolviera el objeto comentario completo
        // o recargar los comentarios
        await this.fetchComentarios(noticiaId); // Recargar comentarios
        return nuevoComentario;
      } catch (e: any) {
        this.error = e.message || 'Error al crear comentario';
        throw e;
      }
    },
    async darLike(noticiaId: number | string) {
      try {
        await apiService.darLike(noticiaId);
        // Actualizar el contador de likes en la UI
        // Esto requiere encontrar la noticia en newsList o currentNewsItem y actualizarla
        // Podrías querer recargar la noticia o la lista, o manejarlo localmente
        if (this.currentNewsItem && this.currentNewsItem.id === noticiaId) {
          this.currentNewsItem.likes_count = (this.currentNewsItem.likes_count || 0) + 1;
        }
        const noticiaEnLista = this.newsList.find(n => n.id === noticiaId);
        if (noticiaEnLista) {
          noticiaEnLista.likes_count = (noticiaEnLista.likes_count || 0) + 1;
        }
      } catch (e:any) {
        // Manejar error de dar like
        console.error('Error al dar like:', e.message);
        // Podrías mostrar una notificación al usuario
      }
    },
    async quitarLike(noticiaId: number | string) {
      try {
        await apiService.quitarLike(noticiaId);
        // Actualizar el contador de likes en la UI
        if (this.currentNewsItem && this.currentNewsItem.id === noticiaId) {
          this.currentNewsItem.likes_count = Math.max(0, (this.currentNewsItem.likes_count || 0) - 1);
        }
        const noticiaEnLista = this.newsList.find(n => n.id === noticiaId);
        if (noticiaEnLista) {
          noticiaEnLista.likes_count = Math.max(0, (noticiaEnLista.likes_count || 0) - 1);
        }
      } catch (e:any) {
        // Manejar error de quitar like
        console.error('Error al quitar like:', e.message);
      }
    }
  },
}); 