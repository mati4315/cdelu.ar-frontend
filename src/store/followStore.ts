import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  PublicUser, 
  PublicProfileResponse, 
  FollowStats, 
  FollowUser,
  UserPostsResponse,
  UserPost
} from '@/types/api';
import { followService } from '@/services/followService';
import { useNotifications } from '@/composables/useNotifications';

interface FollowersState {
  data: FollowUser[];
  page: number;
  totalPages: number;
  total: number;
  loading: boolean;
}

interface FollowingState {
  data: FollowUser[];
  page: number;
  totalPages: number;
  total: number;
  loading: boolean;
}

interface PublicPostsState {
  data: UserPost[];
  page: number;
  totalPages: number;
  total: number;
  loading: boolean;
  infiniteLoading: boolean;
}

export const useFollowStore = defineStore('follow', () => {
  // Importar notifications de forma segura
  let globalNotifications: any = null;
  try {
    const notificationsComposable = useNotifications();
    globalNotifications = notificationsComposable.globalNotifications;
  } catch (error) {
    console.warn('⚠️ [FOLLOW STORE] useNotifications no disponible:', error);
  }

  // 👤 Estado del perfil público actual
  const currentPublicProfile = ref<PublicUser | null>(null);
  const currentProfileStats = ref<FollowStats | null>(null);
  const isFollowingCurrentUser = ref<boolean>(false);
  const isOwnProfile = ref<boolean>(false);
  const profileLoading = ref<boolean>(false);
  const profileError = ref<string | null>(null);

  // 📄 Posts públicos del usuario actual
  const publicPosts = ref<PublicPostsState>({
    data: [],
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false,
    infiniteLoading: false
  });

  // 👥 Seguidores del perfil actual
  const followers = ref<FollowersState>({
    data: [],
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false
  });

  // 👥 Seguidos del perfil actual
  const following = ref<FollowingState>({
    data: [],
    page: 1,
    totalPages: 1,
    total: 0,
    loading: false
  });

  // 🔍 Estado de búsqueda
  const searchResults = ref<PublicUser[]>([]);
  const searchLoading = ref<boolean>(false);
  const searchQuery = ref<string>('');

  // 🔄 Estado de acciones
  const followActionLoading = ref<boolean>(false);

  // 📊 Getters computados
  const hasPublicPosts = computed(() => publicPosts.value.data.length > 0);
  const canLoadMorePosts = computed(() => publicPosts.value.page < publicPosts.value.totalPages);
  const hasFollowers = computed(() => followers.value.data.length > 0);
  const hasFollowing = computed(() => following.value.data.length > 0);
  const isProfileLoaded = computed(() => currentPublicProfile.value !== null);

  // 📋 ACCIONES PRINCIPALES

  /**
   * Cargar perfil público de un usuario
   */
  const loadPublicProfile = async (usernameOrId: string | number) => {
    console.log(`👤 [FOLLOW STORE] Cargando perfil público: ${usernameOrId}`);
    
    profileLoading.value = true;
    profileError.value = null;
    
    try {
      const response: PublicProfileResponse = await followService.getPublicProfile(usernameOrId);
      
      currentPublicProfile.value = response.user;
      currentProfileStats.value = response.stats;
      isFollowingCurrentUser.value = response.is_following || false;
      isOwnProfile.value = response.is_own_profile || false;
      
      console.log(`✅ [FOLLOW STORE] Perfil público cargado:`, response);
      
      // Limpiar posts anteriores
      resetPublicPosts();
      
    } catch (error: any) {
      console.error(`❌ [FOLLOW STORE] Error cargando perfil público:`, error);
      profileError.value = error.message;
      if (globalNotifications?.apiError) {
        globalNotifications.apiError(error, 'cargar perfil');
      }
    } finally {
      profileLoading.value = false;
    }
  };

  /**
   * Cargar posts públicos del usuario
   */
  const loadPublicPosts = async (usernameOrId: string | number, refresh: boolean = false) => {
    if (!usernameOrId) return;
    
    console.log(`📄 [FOLLOW STORE] Cargando posts públicos: ${usernameOrId}, refresh: ${refresh}`);
    
    if (refresh) {
      publicPosts.value.page = 1;
      publicPosts.value.loading = true;
    } else {
      publicPosts.value.infiniteLoading = true;
    }
    
    try {
      const response: UserPostsResponse = await followService.getUserPublicPosts(
        usernameOrId, 
        publicPosts.value.page, 
        10
      );
      
      if (refresh) {
        publicPosts.value.data = response.data;
      } else {
        publicPosts.value.data.push(...response.data);
      }
      
      publicPosts.value.totalPages = response.pagination.totalPages;
      publicPosts.value.total = response.pagination.total;
      
      console.log(`✅ [FOLLOW STORE] Posts públicos cargados:`, response);
      
    } catch (error: any) {
      console.error(`❌ [FOLLOW STORE] Error cargando posts públicos:`, error);
      if (globalNotifications?.apiError) {
        globalNotifications.apiError(error, 'cargar posts');
      }
    } finally {
      publicPosts.value.loading = false;
      publicPosts.value.infiniteLoading = false;
    }
  };

  /**
   * Cargar más posts (infinite scroll)
   */
  const loadMorePublicPosts = async (usernameOrId: string | number) => {
    if (!canLoadMorePosts.value || publicPosts.value.infiniteLoading) return;
    
    publicPosts.value.page += 1;
    await loadPublicPosts(usernameOrId, false);
  };

  /**
   * Seguir o dejar de seguir usuario
   */
  const toggleFollow = async (userId: number) => {
    if (followActionLoading.value) return;
    
    console.log(`👥 [FOLLOW STORE] Toggle follow usuario: ${userId}, actualmente siguiendo: ${isFollowingCurrentUser.value}`);
    
    followActionLoading.value = true;
    
    try {
      const response = isFollowingCurrentUser.value 
        ? await followService.unfollowUser(userId)
        : await followService.followUser(userId);
      
      // Actualizar estado local
      isFollowingCurrentUser.value = response.is_following;
      
      // Actualizar contadores
      if (currentProfileStats.value) {
        currentProfileStats.value.followers_count = response.followers_count;
      }
      
      if (globalNotifications?.success) {
        globalNotifications.success(response.message);
      }
      
      console.log(`✅ [FOLLOW STORE] Toggle follow exitoso:`, response);
      
    } catch (error: any) {
      console.error(`❌ [FOLLOW STORE] Error en toggle follow:`, error);
      if (globalNotifications?.apiError) {
        globalNotifications.apiError(error, 'seguir usuario');
      }
    } finally {
      followActionLoading.value = false;
    }
  };

  /**
   * Cargar seguidores
   */
  const loadFollowers = async (usernameOrId: string | number, page: number = 1) => {
    console.log(`👥 [FOLLOW STORE] Cargando seguidores: ${usernameOrId}, página: ${page}`);
    
    followers.value.loading = true;
    
    try {
      const response = await followService.getFollowers(usernameOrId, page, 20);
      
      if (page === 1) {
        followers.value.data = response.data;
      } else {
        followers.value.data.push(...response.data);
      }
      
      followers.value.page = page;
      followers.value.totalPages = response.pagination.totalPages;
      followers.value.total = response.pagination.total;
      
      console.log(`✅ [FOLLOW STORE] Seguidores cargados:`, response);
      
    } catch (error: any) {
      console.error(`❌ [FOLLOW STORE] Error cargando seguidores:`, error);
      if (globalNotifications?.apiError) {
        globalNotifications.apiError(error, 'cargar seguidores');
      }
    } finally {
      followers.value.loading = false;
    }
  };

  /**
   * Cargar seguidos
   */
  const loadFollowing = async (usernameOrId: string | number, page: number = 1) => {
    console.log(`👥 [FOLLOW STORE] Cargando seguidos: ${usernameOrId}, página: ${page}`);
    
    following.value.loading = true;
    
    try {
      const response = await followService.getFollowing(usernameOrId, page, 20);
      
      if (page === 1) {
        following.value.data = response.data;
      } else {
        following.value.data.push(...response.data);
      }
      
      following.value.page = page;
      following.value.totalPages = response.pagination.totalPages;
      following.value.total = response.pagination.total;
      
      console.log(`✅ [FOLLOW STORE] Seguidos cargados:`, response);
      
    } catch (error: any) {
      console.error(`❌ [FOLLOW STORE] Error cargando seguidos:`, error);
      if (globalNotifications?.apiError) {
        globalNotifications.apiError(error, 'cargar seguidos');
      }
    } finally {
      following.value.loading = false;
    }
  };

  /**
   * Buscar usuarios
   */
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      searchResults.value = [];
      return;
    }
    
    console.log(`🔍 [FOLLOW STORE] Buscando usuarios: ${query}`);
    
    searchLoading.value = true;
    searchQuery.value = query;
    
    try {
      const response = await followService.searchUsers({ query, page: 1, limit: 20 });
      searchResults.value = response.data;
      
      console.log(`✅ [FOLLOW STORE] Usuarios encontrados:`, response);
      
    } catch (error: any) {
      console.error(`❌ [FOLLOW STORE] Error buscando usuarios:`, error);
      if (globalNotifications?.apiError) {
        globalNotifications.apiError(error, 'buscar usuarios');
      }
    } finally {
      searchLoading.value = false;
    }
  };

  // 🧹 FUNCIONES DE LIMPIEZA

  const resetPublicPosts = () => {
    publicPosts.value = {
      data: [],
      page: 1,
      totalPages: 1,
      total: 0,
      loading: false,
      infiniteLoading: false
    };
  };

  const resetFollowers = () => {
    followers.value = {
      data: [],
      page: 1,
      totalPages: 1,
      total: 0,
      loading: false
    };
  };

  const resetFollowing = () => {
    following.value = {
      data: [],
      page: 1,
      totalPages: 1,
      total: 0,
      loading: false
    };
  };

  const resetSearch = () => {
    searchResults.value = [];
    searchQuery.value = '';
    searchLoading.value = false;
  };

  const resetAllState = () => {
    currentPublicProfile.value = null;
    currentProfileStats.value = null;
    isFollowingCurrentUser.value = false;
    isOwnProfile.value = false;
    profileLoading.value = false;
    profileError.value = null;
    followActionLoading.value = false;
    
    resetPublicPosts();
    resetFollowers();
    resetFollowing();
    resetSearch();
  };

  return {
    // Estado
    currentPublicProfile,
    currentProfileStats,
    isFollowingCurrentUser,
    isOwnProfile,
    profileLoading,
    profileError,
    publicPosts,
    followers,
    following,
    searchResults,
    searchLoading,
    searchQuery,
    followActionLoading,
    
    // Getters
    hasPublicPosts,
    canLoadMorePosts,
    hasFollowers,
    hasFollowing,
    isProfileLoaded,
    
    // Acciones
    loadPublicProfile,
    loadPublicPosts,
    loadMorePublicPosts,
    toggleFollow,
    loadFollowers,
    loadFollowing,
    searchUsers,
    
    // Limpieza
    resetPublicPosts,
    resetFollowers,
    resetFollowing,
    resetSearch,
    resetAllState
  };
});
