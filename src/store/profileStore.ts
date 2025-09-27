// 👤 Store de Perfil - Gestión de posts de usuario
// Archivo: src/store/profileStore.ts

import { defineStore } from 'pinia';
import { profileService } from '@/services/profileService';
import { globalNotifications } from '@/composables/useNotifications';
import type { 
  UserPost, 
  UserPostsResponse, 
  UserPostUpdatePayload,
  ProfileResponse
} from '@/types/api';

interface ProfileState {
  // Posts del usuario
  myPosts: UserPost[];
  userPosts: Record<number, UserPost[]>; // posts por userId
  
  // Paginación
  myPostsPagination: {
    page: number;
    hasMore: boolean;
    total: number;
    totalPages: number;
  };
  
  userPostsPagination: Record<number, {
    page: number;
    hasMore: boolean;
    total: number;
    totalPages: number;
  }>;
  
  // Estados de carga
  isLoading: boolean;
  isLoadingMore: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Perfil del usuario
  currentProfile: ProfileResponse | null;
  viewingUserId: number | null; // ID del usuario cuyo perfil estamos viendo
  
  // Manejo de errores
  error: string | null;
  
  // Estado de inicialización
  isInitialized: boolean;
}

export const useProfileStore = defineStore('profile', {
  state: (): ProfileState => ({
    // Posts
    myPosts: [],
    userPosts: {},
    
    // Paginación
    myPostsPagination: {
      page: 1,
      hasMore: true,
      total: 0,
      totalPages: 0
    },
    userPostsPagination: {},
    
    // Estados
    isLoading: false,
    isLoadingMore: false,
    isUpdating: false,
    isDeleting: false,
    
    // Perfil
    currentProfile: null,
    viewingUserId: null,
    
    // Error
    error: null,
    
    // Inicialización
    isInitialized: false
  }),

  getters: {
    // Obtener posts según el contexto (mis posts o posts de otro usuario)
    currentPosts: (state): UserPost[] => {
      if (state.viewingUserId && state.viewingUserId !== state.currentProfile?.user?.id) {
        return state.userPosts[state.viewingUserId] || [];
      }
      return state.myPosts;
    },
    
    // Paginación actual
    currentPagination: (state) => {
      if (state.viewingUserId && state.viewingUserId !== state.currentProfile?.user?.id) {
        return state.userPostsPagination[state.viewingUserId] || {
          page: 1,
          hasMore: true,
          total: 0,
          totalPages: 0
        };
      }
      return state.myPostsPagination;
    },
    
    // Verificar si hay contenido
    hasContent: (state): boolean => {
      const posts = state.viewingUserId && state.viewingUserId !== state.currentProfile?.user?.id
        ? state.userPosts[state.viewingUserId] || []
        : state.myPosts;
      return posts.length > 0;
    },
    
    // Verificar si puede editar (solo mis posts)
    canEditPosts: (state): boolean => {
      return !state.viewingUserId || state.viewingUserId === state.currentProfile?.user?.id;
    },
    
    // Verificar si está listo para infinite scroll
    isReadyForInfiniteScroll: (state): boolean => {
      const pagination = state.viewingUserId && state.viewingUserId !== state.currentProfile?.user?.id
        ? state.userPostsPagination[state.viewingUserId]
        : state.myPostsPagination;
        
      return state.isInitialized && 
             !state.isLoading && 
             !state.isLoadingMore &&
             (pagination?.hasMore || false);
    }
  },

  actions: {
    // 👤 Cargar perfil (mi perfil o perfil público)
    async loadProfile(userId?: number) {
      console.log(`👤 [PROFILE STORE] loadProfile called - userId: ${userId}`);
      
      this.isLoading = true;
      this.error = null;
      this.viewingUserId = userId || null;

      try {
        if (userId) {
          // Cargar perfil público
          this.currentProfile = await profileService.getUserProfile(userId);
        } else {
          // Cargar mi perfil
          this.currentProfile = await profileService.getMyProfile();
        }
        
        console.log('✅ [PROFILE STORE] Perfil cargado:', this.currentProfile);
      } catch (error: any) {
        console.error('❌ [PROFILE STORE] Error al cargar perfil:', error);
        this.error = error.message || 'Error al cargar perfil';
        globalNotifications.apiError(error, 'al cargar perfil');
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // 📝 Cargar posts (mis posts o posts de usuario)
    async loadPosts(userId?: number, refresh = false) {
      console.log(`📝 [PROFILE STORE] loadPosts called - userId: ${userId}, refresh: ${refresh}`);
      
      if (refresh) {
        this.resetPagination(userId);
      }

      // Evitar cargas múltiples
      if (this.isLoading) {
        console.log('⏳ [PROFILE STORE] Ya se está cargando, omitiendo llamada');
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const pagination = userId ? this.userPostsPagination[userId] : this.myPostsPagination;
        const page = pagination?.page || 1;

        let response: UserPostsResponse;
        
        if (userId) {
          // Cargar posts de otro usuario
          response = await profileService.getUserPosts(userId, {
            page,
            limit: 10,
            order: 'desc'
          });
        } else {
          // Cargar mis posts
          response = await profileService.getMyPosts({
            page,
            limit: 10,
            order: 'desc'
          });
        }

        console.log(`✅ [PROFILE STORE] Posts cargados:`, response);

        // Actualizar posts
        if (refresh) {
          this.setPosts(userId, response.data);
        } else {
          this.appendPosts(userId, response.data);
        }

        // Actualizar paginación
        this.updatePagination(userId, response.pagination);

        // Marcar como inicializado
        this.isInitialized = true;

        console.log(`📊 [PROFILE STORE] Posts actualizados - total: ${response.data.length}`);

      } catch (error: any) {
        console.error(`❌ [PROFILE STORE] Error al cargar posts:`, error);
        this.error = error.message || 'Error al cargar posts';
        globalNotifications.apiError(error, 'al cargar posts');
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // ♾️ Cargar más posts (infinite scroll)
    async loadMorePosts() {
      const userId = this.viewingUserId;
      const pagination = userId ? this.userPostsPagination[userId] : this.myPostsPagination;
      
      console.log(`♾️ [PROFILE STORE] loadMorePosts called - userId: ${userId}, hasMore: ${pagination?.hasMore}`);
      
      if (!pagination?.hasMore || this.isLoadingMore) {
        console.log('🚫 [PROFILE STORE] No se puede cargar más contenido');
        return;
      }

      this.isLoadingMore = true;
      
      // Incrementar página
      if (userId) {
        if (!this.userPostsPagination[userId]) {
          this.userPostsPagination[userId] = { page: 1, hasMore: true, total: 0, totalPages: 0 };
        }
        this.userPostsPagination[userId].page++;
      } else {
        this.myPostsPagination.page++;
      }
      
      try {
        await this.loadPosts(userId || undefined, false);
      } catch (error) {
        // Rollback de página en caso de error
        if (userId) {
          this.userPostsPagination[userId].page--;
        } else {
          this.myPostsPagination.page--;
        }
        throw error;
      } finally {
        this.isLoadingMore = false;
      }
    },

    // ✏️ Actualizar post
    async updatePost(postId: number, payload: UserPostUpdatePayload) {
      console.log(`✏️ [PROFILE STORE] updatePost called - postId: ${postId}`, payload);
      
      this.isUpdating = true;
      this.error = null;

      try {
        const updatedPost = await profileService.updateMyPostText(postId, payload);
        
        // Actualizar en el estado local
        this.updatePostInState(postId, updatedPost);
        
        globalNotifications.success('Post actualizado', 'Tu publicación ha sido actualizada correctamente');
        return updatedPost;
      } catch (error: any) {
        console.error('❌ [PROFILE STORE] Error al actualizar post:', error);
        this.error = error.message || 'Error al actualizar post';
        globalNotifications.apiError(error, 'al actualizar post');
        throw error;
      } finally {
        this.isUpdating = false;
      }
    },

    // 🖼️ Actualizar media del post
    async updatePostMedia(postId: number, formData: FormData) {
      console.log(`🖼️ [PROFILE STORE] updatePostMedia called - postId: ${postId}`);
      
      this.isUpdating = true;
      this.error = null;

      try {
        const updatedPost = await profileService.updateMyPostMedia(postId, formData);
        
        // Actualizar en el estado local
        this.updatePostInState(postId, updatedPost);
        
        globalNotifications.success('Media actualizada', 'Las imágenes/video han sido actualizadas correctamente');
        return updatedPost;
      } catch (error: any) {
        console.error('❌ [PROFILE STORE] Error al actualizar media:', error);
        this.error = error.message || 'Error al actualizar media';
        globalNotifications.apiError(error, 'al actualizar media');
        throw error;
      } finally {
        this.isUpdating = false;
      }
    },

    // 🗑️ Eliminar post
    async deletePost(postId: number) {
      console.log(`🗑️ [PROFILE STORE] deletePost called - postId: ${postId}`);
      
      this.isDeleting = true;
      this.error = null;

      try {
        await profileService.deleteMyPost(postId);
        
        // Remover del estado local
        this.removePostFromState(postId);
        
        globalNotifications.success('Post eliminado', 'Tu publicación ha sido eliminada correctamente');
      } catch (error: any) {
        console.error('❌ [PROFILE STORE] Error al eliminar post:', error);
        this.error = error.message || 'Error al eliminar post';
        globalNotifications.apiError(error, 'al eliminar post');
        throw error;
      } finally {
        this.isDeleting = false;
      }
    },

    // 📤 Crear nuevo post
    async createPost(formData: FormData) {
      console.log(`📤 [PROFILE STORE] createPost called`);
      
      this.isUpdating = true;
      this.error = null;

      try {
        const newPost = await profileService.createCommunityPost(formData);
        
        // Agregar al inicio de mis posts
        this.myPosts.unshift(newPost);
        this.myPostsPagination.total++;
        
        globalNotifications.success('Post creado', 'Tu publicación ha sido creada correctamente');
        return newPost;
      } catch (error: any) {
        console.error('❌ [PROFILE STORE] Error al crear post:', error);
        this.error = error.message || 'Error al crear post';
        globalNotifications.apiError(error, 'al crear post');
        throw error;
      } finally {
        this.isUpdating = false;
      }
    },

    // 🔄 Refrescar posts
    async refresh() {
      console.log(`🔄 [PROFILE STORE] refresh called`);
      await this.loadPosts(this.viewingUserId || undefined, true);
    },

    // 🧹 Helpers para manejo de estado
    setPosts(userId: number | undefined, posts: UserPost[]) {
      if (userId) {
        this.userPosts[userId] = posts;
      } else {
        this.myPosts = posts;
      }
    },

    appendPosts(userId: number | undefined, posts: UserPost[]) {
      if (userId) {
        if (!this.userPosts[userId]) {
          this.userPosts[userId] = [];
        }
        this.userPosts[userId].push(...posts);
      } else {
        this.myPosts.push(...posts);
      }
    },

    updatePagination(userId: number | undefined, pagination: any) {
      const paginationData = {
        page: pagination.page,
        hasMore: pagination.page < pagination.totalPages,
        total: pagination.total,
        totalPages: pagination.totalPages
      };

      if (userId) {
        this.userPostsPagination[userId] = paginationData;
      } else {
        this.myPostsPagination = paginationData;
      }
    },

    resetPagination(userId: number | undefined) {
      const defaultPagination = { page: 1, hasMore: true, total: 0, totalPages: 0 };
      
      if (userId) {
        this.userPostsPagination[userId] = defaultPagination;
      } else {
        this.myPostsPagination = defaultPagination;
      }
    },

    updatePostInState(postId: number, updatedPost: UserPost) {
      // Actualizar en mis posts
      const myIndex = this.myPosts.findIndex(post => post.id === postId);
      if (myIndex !== -1) {
        this.myPosts[myIndex] = updatedPost;
      }

      // Actualizar en posts de usuario
      Object.keys(this.userPosts).forEach(userId => {
        const userIndex = this.userPosts[parseInt(userId)].findIndex(post => post.id === postId);
        if (userIndex !== -1) {
          this.userPosts[parseInt(userId)][userIndex] = updatedPost;
        }
      });
    },

    removePostFromState(postId: number) {
      // Remover de mis posts
      this.myPosts = this.myPosts.filter(post => post.id !== postId);
      this.myPostsPagination.total = Math.max(0, this.myPostsPagination.total - 1);

      // Remover de posts de usuario
      Object.keys(this.userPosts).forEach(userId => {
        this.userPosts[parseInt(userId)] = this.userPosts[parseInt(userId)].filter(post => post.id !== postId);
      });
    },

    // 🧹 Limpiar estado
    resetState() {
      console.log('🧹 [PROFILE STORE] resetState called');
      
      this.myPosts = [];
      this.userPosts = {};
      this.myPostsPagination = { page: 1, hasMore: true, total: 0, totalPages: 0 };
      this.userPostsPagination = {};
      this.currentProfile = null;
      this.viewingUserId = null;
      this.isInitialized = false;
      this.error = null;
    }
  }
});
