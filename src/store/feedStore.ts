// 🔄 Store de Feed Unificado
// Archivo: src/store/feedStore.ts

import { defineStore } from 'pinia';
import { feedService } from '@/services/feedService';
import { followService } from '@/services/followService';
import { globalNotifications } from '@/composables/useNotifications';
import type { 
  FeedState, 
  FeedItem, 
  FeedTab, 
  FeedParams, 
  FeedStats,
  TabPagination,
  FeedType,
  UserStats
} from '@/types/feed';

export const useFeedStore = defineStore('feed', {
  state: (): FeedState => ({
    // Contenido por pestaña
    allContent: [],
    newsContent: [],
    communityContent: [],
    followingContent: [],
    
    // Estado de UI
    currentTab: 'todo',
    isLoading: false,
    isInfiniteLoading: false,
    
    // Paginación por pestaña
    pagination: {
      todo: { page: 1, hasMore: true, total: 0 },
      noticias: { page: 1, hasMore: true, total: 0 },
      comunidad: { page: 1, hasMore: true, total: 0 },
      seguidores: { page: 1, hasMore: true, total: 0 }
    },
    
    // Estadísticas
    stats: null,
    
    // Estadísticas del usuario actual
    userStats: {
      following_count: 0,
      followers_count: 0,
      posts_count: 0,
      loading: false
    },
    
    // Manejo de errores
    error: null,
    
    // Estado de inicialización
    isInitialized: {
      todo: false,
      noticias: false,
      comunidad: false,
      seguidores: false
    },
    
    // Tiempo de última actualización
    lastFetchTime: {
      todo: null,
      noticias: null,
      comunidad: null,
      seguidores: null
    },
    
    // Sets para evitar duplicados
    itemIds: {
      todo: new Set<number>(),
      noticias: new Set<number>(),
      comunidad: new Set<number>(),
      seguidores: new Set<number>()
    }
  }),

  getters: {
    // Obtener contenido de la pestaña activa
    currentContent: (state): FeedItem[] => {
      switch (state.currentTab) {
        case 'todo': return state.allContent;
        case 'noticias': return state.newsContent;
        case 'comunidad': return state.communityContent;
        case 'seguidores': return state.followingContent;
        default: return state.allContent;
      }
    },
    
    // Obtener paginación de la pestaña activa
    currentPagination: (state): TabPagination => {
      return state.pagination[state.currentTab];
    },
    
    // Verificar si hay contenido
    hasContent: (state): boolean => {
      const content = state.currentTab === 'todo' ? state.allContent :
                     state.currentTab === 'noticias' ? state.newsContent :
                     state.currentTab === 'comunidad' ? state.communityContent :
                     state.followingContent;
      return content.length > 0;
    },
    
    // Verificar si está inicializada la pestaña actual
    isCurrentTabInitialized: (state): boolean => {
      return state.isInitialized[state.currentTab];
    },
    
    // Verificar si está listo para infinite scroll
    isReadyForInfiniteScroll: (state): boolean => {
      const pagination = state.pagination[state.currentTab];
      return state.isInitialized[state.currentTab] && 
             !state.isLoading && 
             !state.isInfiniteLoading &&
             pagination.hasMore;
    },
    
    // Obtener estadísticas por pestaña
    tabStats: (state) => {
      if (!state.stats) return null;
      
      return {
        todo: state.stats.total,
        noticias: state.stats.by_type.news.count,
        comunidad: state.stats.by_type.community.count
      };
    },
    
    // Verificar si debe mostrar la pestaña de seguidores
    shouldShowFollowingTab: (state) => {
      console.log(`🔍 [FEED STORE] shouldShowFollowingTab - following_count: ${state.userStats.following_count}`);
      return state.userStats.following_count > 0;
    },
    
    // Obtener pestañas visibles dinámicamente
    visibleTabs: (state) => {
      const allTabs = [
        { key: 'todo', label: 'Todo', icon: '🗞️', description: 'Noticias y comunidad' },
        { key: 'noticias', label: 'Noticias', icon: '📰', description: 'Solo noticias' },
        { key: 'comunidad', label: 'Comunidad', icon: '👥', description: 'Solo comunidad' }
      ];
      
      console.log(`🔍 [FEED STORE] visibleTabs - userStats:`, state.userStats);
      
      // Solo agregar pestaña de seguidores si el usuario sigue a alguien
      if (state.userStats.following_count > 0) {
        console.log(`✅ [FEED STORE] Agregando pestaña Siguiendo - following_count: ${state.userStats.following_count}`);
        allTabs.push({
          key: 'seguidores',
          label: 'Siguiendo',
          icon: '💙',
          description: 'Contenido de usuarios seguidos'
        });
      } else {
        console.log(`❌ [FEED STORE] NO agregando pestaña Siguiendo - following_count: ${state.userStats.following_count}`);
      }
      
      return allTabs;
    }
  },

  actions: {
    // Utilidades locales para cachear likes por usuario en localStorage
    getCurrentUserId(): number | null {
      try {
        const raw = localStorage.getItem('user');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return typeof parsed?.id === 'number' ? parsed.id : null;
      } catch {
        return null;
      }
    },

    getLikesCacheKey(userId: number): string {
      return `liked_feed_ids:${userId}`;
    },

    readLikedSet(): Set<number> {
      const userId = this.getCurrentUserId();
      if (!userId) return new Set<number>();
      try {
        const key = this.getLikesCacheKey(userId);
        const raw = localStorage.getItem(key);
        if (!raw) return new Set<number>();
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          return new Set<number>(arr.filter((x) => typeof x === 'number'));
        }
        return new Set<number>();
      } catch {
        return new Set<number>();
      }
    },

    writeLikedSet(set: Set<number>): void {
      const userId = this.getCurrentUserId();
      if (!userId) return;
      try {
        const key = this.getLikesCacheKey(userId);
        localStorage.setItem(key, JSON.stringify([...set]));
      } catch {
        // ignore
      }
    },

    persistLiked(feedId: number, liked: boolean): void {
      const likedSet = this.readLikedSet();
      if (liked) {
        likedSet.add(feedId);
      } else {
        likedSet.delete(feedId);
      }
      this.writeLikedSet(likedSet);
    },

    mergeLocalLikedInto(items: FeedItem[]): FeedItem[] {
      const likedSet = this.readLikedSet();
      if (likedSet.size === 0) return items;
      return items.map((it) => {
        if (it && (it.is_liked === undefined || it.is_liked === false)) {
          if (likedSet.has(it.id)) {
            it.is_liked = true;
          }
        }
        return it;
      });
    },

    // Cargar contenido inicial o refresh
    async loadFeed(tab: FeedTab = 'todo', refresh = false) {
      console.log(`🔄 [FEED STORE] loadFeed called - tab: ${tab}, refresh: ${refresh}`);
      
      if (refresh) {
        this.resetPagination(tab);
        this.clearContent(tab);
      }

      // Evitar cargas múltiples
      if (this.isLoading) {
        console.log('⏳ [FEED STORE] Ya se está cargando, omitiendo llamada');
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const params: FeedParams = {
          page: this.pagination[tab].page,
          limit: 10,
          sort: 'published_at',
          order: 'desc'
        };

        console.log(`📄 [FEED STORE] Cargando ${tab} - página ${params.page}`);

        const response = await feedService.getContentByTab(tab, params);

        console.log(`✅ [FEED STORE] Respuesta recibida para ${tab}:`, response);

        // Actualizar contenido
        // Antes de setear, sincronizar 'is_liked' desde backend si está disponible
        const items = response.data;
        const feedIds = items.map(i => i.id);
        let serverStatuses: Record<number, boolean> = {};
        try {
          serverStatuses = await feedService.getLikedStatuses(feedIds);
        } catch { /* ignorar si no existe */ }

        const enriched = items.map(item => ({
          ...item,
          is_liked: typeof serverStatuses[item.id] === 'boolean' ? serverStatuses[item.id] : item.is_liked
        }));

        if (refresh) {
          this.setContent(tab, enriched);
        } else {
          this.appendContent(tab, enriched);
        }

        // Actualizar paginación
        this.updatePagination(tab, response.pagination);

        // Actualizar estado de inicialización
        this.isInitialized[tab] = true;
        this.lastFetchTime[tab] = new Date();

        console.log(`📊 [FEED STORE] ${tab} actualizado - items: ${response.data.length}, hasMore: ${this.pagination[tab].hasMore}`);

        // Notificación de éxito solo en casos específicos
        if (refresh && response.data.length === 0) {
          globalNotifications.info('Sin contenido', `No hay contenido disponible en ${tab}`);
        }

      } catch (error: any) {
        console.error(`❌ [FEED STORE] Error al cargar ${tab}:`, error);
        this.error = error.message || `Error al cargar ${tab}`;
        
        // Notificación de error
        globalNotifications.apiError(error, `carga de ${tab}`);
      } finally {
        this.isLoading = false;
        console.log(`✅ [FEED STORE] loadFeed completado para ${tab}`);
      }
    },

    // Infinite scroll - cargar más contenido
    async loadMore() {
      const currentPag = this.currentPagination;
      
      console.log(`♾️ [FEED STORE] loadMore called - tab: ${this.currentTab}, hasMore: ${currentPag.hasMore}, isLoading: ${this.isInfiniteLoading}`);
      
      if (!currentPag.hasMore || this.isInfiniteLoading) {
        console.log('🚫 [FEED STORE] No se puede cargar más contenido');
        return;
      }

      this.isInfiniteLoading = true;
      
      // Incrementar página antes de la carga
      this.pagination[this.currentTab].page++;
      
      try {
        await this.loadFeed(this.currentTab, false);
      } catch (error) {
        // Rollback de página en caso de error
        this.pagination[this.currentTab].page--;
        throw error;
      } finally {
        this.isInfiniteLoading = false;
      }
    },

    // Cambiar pestaña activa
    async switchTab(tab: FeedTab) {
      console.log(`🔄 [FEED STORE] switchTab called - from: ${this.currentTab}, to: ${tab}`);
      
      this.currentTab = tab;
      
      // Si no hay contenido o no está inicializada, cargar
      const hasContent = this.getContentByTab(tab).length > 0;
      if (!hasContent || !this.isInitialized[tab]) {
        console.log(`📥 [FEED STORE] Cargando contenido inicial para ${tab}`);
        await this.loadFeed(tab, true);
      }
    },

    // Cargar estadísticas
    async loadStats() {
      console.log('📊 [FEED STORE] loadStats called');
      
      try {
        this.stats = await feedService.getFeedStats();
        console.log('✅ [FEED STORE] Estadísticas cargadas:', this.stats);
      } catch (error: any) {
        console.error('❌ [FEED STORE] Error al cargar estadísticas:', error);
        // No mostrar notificación para estadísticas, es información secundaria
      }
    },

    // Cargar estadísticas del usuario
    async loadUserStats() {
      console.log('📊 [FEED STORE] loadUserStats called');
      
      this.userStats.loading = true;
      
      try {
        const stats = await followService.getMyStats();
        this.userStats.following_count = stats.following_count;
        this.userStats.followers_count = stats.followers_count;
        this.userStats.posts_count = stats.posts_count;
        
        console.log('✅ [FEED STORE] Estadísticas de usuario cargadas:', this.userStats);
        
        // Si el usuario estaba en la pestaña de seguidores pero ya no sigue a nadie,
        // redirigir a la pestaña de "Todo"
        if (this.currentTab === 'seguidores' && stats.following_count === 0) {
          console.log('🔄 [FEED STORE] Usuario no sigue a nadie, cambiando a pestaña Todo');
          await this.switchTab('todo');
        }
        
      } catch (error: any) {
        console.error('❌ [FEED STORE] Error al cargar estadísticas de usuario:', error);
        // En caso de error, mantener valores por defecto (0)
        this.userStats.following_count = 0;
        this.userStats.followers_count = 0;
        this.userStats.posts_count = 0;
      } finally {
        this.userStats.loading = false;
      }
    },

    // Refrescar contenido actual
    async refresh() {
      console.log(`🔄 [FEED STORE] refresh called for tab: ${this.currentTab}`);
      await Promise.all([
        this.loadFeed(this.currentTab, true),
        this.loadStats(),
        this.loadUserStats()
      ]);
    },

    // Helpers para manejo de contenido
    getContentByTab(tab: FeedTab): FeedItem[] {
      switch (tab) {
        case 'todo': return this.allContent;
        case 'noticias': return this.newsContent;
        case 'comunidad': return this.communityContent;
        case 'seguidores': return this.followingContent;
        default: return this.allContent;
      }
    },

    setContent(tab: FeedTab, content: FeedItem[]) {
      // Limpiar IDs antes de establecer nuevo contenido
      this.itemIds[tab].clear();
      // Fusionar estado local de likes (en caso de que el backend no lo devuelva)
      const merged = this.mergeLocalLikedInto(content);
      
      switch (tab) {
        case 'todo': 
          this.allContent = merged;
          break;
        case 'noticias': 
          this.newsContent = merged;
          break;
        case 'comunidad': 
          this.communityContent = merged;
          break;
        case 'seguidores': 
          this.followingContent = merged;
          break;
      }
      
      // Agregar IDs al set
      merged.forEach(item => this.itemIds[tab].add(item.id));
    },

    appendContent(tab: FeedTab, content: FeedItem[]) {
      // Filtrar duplicados antes de agregar
      const newItems = content.filter(item => !this.itemIds[tab].has(item.id));
      // Fusionar likes locales
      const mergedNewItems = this.mergeLocalLikedInto(newItems);
      
      switch (tab) {
        case 'todo': 
          this.allContent.push(...mergedNewItems);
          break;
        case 'noticias': 
          this.newsContent.push(...mergedNewItems);
          break;
        case 'comunidad': 
          this.communityContent.push(...mergedNewItems);
          break;
        case 'seguidores': 
          this.followingContent.push(...mergedNewItems);
          break;
      }
      
      // Agregar nuevos IDs al set
      mergedNewItems.forEach(item => this.itemIds[tab].add(item.id));
      
      console.log(`📝 [FEED STORE] Se agregaron ${mergedNewItems.length} nuevos items a ${tab} (${content.length - mergedNewItems.length} duplicados omitidos)`);
    },

    updatePagination(tab: FeedTab, pagination: any) {
      this.pagination[tab] = {
        page: pagination.page,
        hasMore: pagination.page < pagination.totalPages,
        total: pagination.total
      };
    },

    resetPagination(tab: FeedTab) {
      this.pagination[tab] = { page: 1, hasMore: true, total: 0 };
    },

    clearContent(tab: FeedTab) {
      this.setContent(tab, []);
      this.isInitialized[tab] = false;
      this.lastFetchTime[tab] = null;
    },

    // Limpiar todo el estado
    resetAllState() {
      console.log('🧹 [FEED STORE] resetAllState called');
      
      // Limpiar contenido
      this.allContent = [];
      this.newsContent = [];
      this.communityContent = [];
      this.followingContent = [];
      
      // Resetear paginación
      Object.keys(this.pagination).forEach(tab => {
        this.resetPagination(tab as FeedTab);
      });
      
      // Resetear inicialización
      this.isInitialized = {
        todo: false,
        noticias: false,
        comunidad: false,
        seguidores: false
      };
      
      // Resetear tiempos
      this.lastFetchTime = {
        todo: null,
        noticias: null,
        comunidad: null,
        seguidores: null
      };
      
      // Limpiar IDs
      Object.values(this.itemIds).forEach(set => set.clear());
      
      // Resetear estado UI
      this.currentTab = 'todo';
      this.isLoading = false;
      this.isInfiniteLoading = false;
      this.error = null;
      this.stats = null;
    },

    // Actualizar like de un item específico
    updateItemLike(itemId: number, newLikesCount: number, isLiked?: boolean) {
      console.log(`❤️ [FEED STORE] updateItemLike - id: ${itemId}, likes: ${newLikesCount}, isLiked: ${isLiked}`);
      
      // Validar que newLikesCount sea un número válido
      if (typeof newLikesCount !== 'number' || isNaN(newLikesCount)) {
        console.warn(`⚠️ [FEED STORE] Invalid likes_count received: ${newLikesCount}, manteniendo valor actual`);
        return;
      }
      
      // Actualizar en todas las pestañas donde aparezca el item
      [this.allContent, this.newsContent, this.communityContent, this.followingContent].forEach(content => {
        const item = content.find(item => item.id === itemId);
        if (item) {
          item.likes_count = newLikesCount;
          
          // Actualizar estado de like del usuario si se proporciona
          if (typeof isLiked === 'boolean') {
            item.is_liked = isLiked;
            this.persistLiked(itemId, isLiked);
          }
          
          console.log(`✅ [FEED STORE] Updated likes for item ${itemId}: ${newLikesCount} (isLiked: ${item.is_liked})`);
        }
      });
    },

    // Actualizar comentarios de un item específico
    updateItemComments(itemId: number, newCommentsCount: number) {
      console.log(`💬 [FEED STORE] updateItemComments - id: ${itemId}, comments: ${newCommentsCount}`);
      
      // Actualizar en todas las pestañas donde aparezca el item
      [this.allContent, this.newsContent, this.communityContent, this.followingContent].forEach(content => {
        const item = content.find(item => item.id === itemId);
        if (item) {
          item.comments_count = newCommentsCount;
        }
      });
    },

    // ❤️ MÉTODOS PARA LIKES UNIFICADOS - API NUEVA
    async toggleLike(feedId: number): Promise<{ liked: boolean; likes_count: number; message: string }> {
      console.log(`❤️ [FEED STORE] toggleLike called - feedId: ${feedId}`);
      
      try {
        const response = await feedService.toggleLike(feedId);
        console.log(`📝 [FEED STORE] Raw backend response:`, response);
        
        // Validar que tenemos una respuesta válida
        if (!response) {
          console.warn(`⚠️ [FEED STORE] Empty response from backend`);
          globalNotifications.apiError('Respuesta vacía del servidor');
          return { liked: false, likes_count: 0, message: 'Error: respuesta vacía' };
        }
        
        // Validar likes_count
        if (response.likes_count === undefined || response.likes_count === null) {
          console.warn(`⚠️ [FEED STORE] Backend response missing likes_count:`, response);
        }
        
        // Actualizar el item en el store con el estado completo
        this.updateItemLike(feedId, response.likes_count || 0, response.liked);
        // Persistir en cache local por usuario
        this.persistLiked(feedId, !!response.liked);
        
        // Mostrar notificación de éxito
        const message = response.message || (response.liked ? 'Like agregado' : 'Like removido');
        globalNotifications.success(message);
        
        return response;
        
      } catch (error: any) {
        console.log(`❌ [FEED STORE] Error al dar/quitar like:`, error);
        
        // Manejo específico de errores 400 de likes duplicados
        if (error.message?.includes('ya has dado like') || 
            error.message?.includes('already liked') ||
            error.message?.includes('Like removido (ya existía)')) {
          
          console.log(`🔄 [FEED STORE] Manejo especial de like duplicado`);
          
          // Si el error indica que el like ya existía, actualizar UI como si se hubiera quitado
          this.updateItemLike(feedId, 0, false); // Asumir que se quitó el like
          this.persistLiked(feedId, false);
          globalNotifications.info('Like actualizado');
          return { liked: false, likes_count: 0, message: 'Like actualizado' };
        }
        
        // Para otros errores, mostrar mensaje genérico
        const errorMessage = error.message || 'Error al procesar like';
        globalNotifications.apiError(errorMessage);
        
        // Revertir cambios optimistas si los hubiera
        throw error;
      }
    },

    // 💬 MÉTODOS PARA COMENTARIOS UNIFICADOS - API NUEVA
    async getComments(item: FeedItem) {
      console.log(`💬 [FEED STORE] getComments called - feedId: ${item.id}`);
      
      try {
        const comments = await feedService.getComments(item.id);
        return comments;
      } catch (error: any) {
        console.error('❌ [FEED STORE] Error al cargar comentarios:', error);
        globalNotifications.apiError(error, 'al cargar comentarios');
        throw error;
      }
    },

    async createComment(item: FeedItem, content: string) {
      console.log(`💬 [FEED STORE] createComment called - feedId: ${item.id}, content:`, content);
      
      try {
        const response = await feedService.createComment(item.id, content);
        
        // Actualizar contadores
        this.updateItemComments(item.id, response.comments_count);
        
        globalNotifications.success('Comentario creado', 'Tu comentario ha sido publicado');
        return response;
      } catch (error: any) {
        console.error('❌ [FEED STORE] Error al crear comentario:', error);
        globalNotifications.apiError(error, 'al crear comentario');
        throw error;
      }
    },

    // 📄 MÉTODO PARA OBTENER UN ITEM ESPECÍFICO POR ORIGINAL_ID
    async getPostByOriginalId(type: FeedType, originalId: number): Promise<FeedItem> {
      console.log(`🔍 [FEED STORE] getPostByOriginalId called - type: ${type}, originalId: ${originalId}`);
      
      try {
        const response = await feedService.getPostByOriginalId(type, originalId);
        console.log(`🔍 [FEED STORE] getPostByOriginalId response:`, response);
        // Enriquecer con estado de like del backend (nuevo endpoint)
        try {
          const statuses = await feedService.getLikedStatuses([response.id]);
          if (typeof statuses[response.id] === 'boolean') {
            response.is_liked = statuses[response.id];
          }
        } catch {
          // ignorar si no existe el endpoint
        }
        return response;
      } catch (error) {
        console.error('❌ [FEED STORE] Error in getPostByOriginalId:', error);
        throw error;
      }
    },

    // 📄 MÉTODO PARA OBTENER UN ITEM ESPECÍFICO POR FEED_ID (backward compatibility)
    async getFeedItem(type: number, id: number) {
      console.log(`🔍 [FEED STORE] getFeedItem called - type: ${type}, id: ${id}`);
      
      try {
        const item = await feedService.getFeedItem(type as FeedType, id);
        return item;
      } catch (error: any) {
        console.error('❌ [FEED STORE] Error al cargar item:', error);
        globalNotifications.apiError(error, 'al cargar el contenido');
        throw error;
      }
    },
  }
}); 