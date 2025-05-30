// 🔄 Store de Feed Unificado
// Archivo: src/store/feedStore.ts

import { defineStore } from 'pinia';
import { feedService } from '@/services/feedService';
import { globalNotifications } from '@/composables/useNotifications';
import type { 
  FeedState, 
  FeedItem, 
  FeedTab, 
  FeedParams, 
  FeedStats,
  TabPagination,
  FeedType
} from '@/types/feed';

export const useFeedStore = defineStore('feed', {
  state: (): FeedState => ({
    // Contenido por pestaña
    allContent: [],
    newsContent: [],
    communityContent: [],
    
    // Estado de UI
    currentTab: 'todo',
    isLoading: false,
    isInfiniteLoading: false,
    
    // Paginación por pestaña
    pagination: {
      todo: { page: 1, hasMore: true, total: 0 },
      noticias: { page: 1, hasMore: true, total: 0 },
      comunidad: { page: 1, hasMore: true, total: 0 }
    },
    
    // Estadísticas
    stats: null,
    
    // Manejo de errores
    error: null,
    
    // Estado de inicialización
    isInitialized: {
      todo: false,
      noticias: false,
      comunidad: false
    },
    
    // Tiempo de última actualización
    lastFetchTime: {
      todo: null,
      noticias: null,
      comunidad: null
    },
    
    // Sets para evitar duplicados
    itemIds: {
      todo: new Set<number>(),
      noticias: new Set<number>(),
      comunidad: new Set<number>()
    }
  }),

  getters: {
    // Obtener contenido de la pestaña activa
    currentContent: (state): FeedItem[] => {
      switch (state.currentTab) {
        case 'todo': return state.allContent;
        case 'noticias': return state.newsContent;
        case 'comunidad': return state.communityContent;
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
                     state.communityContent;
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
    }
  },

  actions: {
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
        if (refresh) {
          this.setContent(tab, response.data);
        } else {
          this.appendContent(tab, response.data);
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

    // Refrescar contenido actual
    async refresh() {
      console.log(`🔄 [FEED STORE] refresh called for tab: ${this.currentTab}`);
      await Promise.all([
        this.loadFeed(this.currentTab, true),
        this.loadStats()
      ]);
    },

    // Helpers para manejo de contenido
    getContentByTab(tab: FeedTab): FeedItem[] {
      switch (tab) {
        case 'todo': return this.allContent;
        case 'noticias': return this.newsContent;
        case 'comunidad': return this.communityContent;
        default: return this.allContent;
      }
    },

    setContent(tab: FeedTab, content: FeedItem[]) {
      // Limpiar IDs antes de establecer nuevo contenido
      this.itemIds[tab].clear();
      
      switch (tab) {
        case 'todo': 
          this.allContent = content;
          break;
        case 'noticias': 
          this.newsContent = content;
          break;
        case 'comunidad': 
          this.communityContent = content;
          break;
      }
      
      // Agregar IDs al set
      content.forEach(item => this.itemIds[tab].add(item.id));
    },

    appendContent(tab: FeedTab, content: FeedItem[]) {
      // Filtrar duplicados antes de agregar
      const newItems = content.filter(item => !this.itemIds[tab].has(item.id));
      
      switch (tab) {
        case 'todo': 
          this.allContent.push(...newItems);
          break;
        case 'noticias': 
          this.newsContent.push(...newItems);
          break;
        case 'comunidad': 
          this.communityContent.push(...newItems);
          break;
      }
      
      // Agregar nuevos IDs al set
      newItems.forEach(item => this.itemIds[tab].add(item.id));
      
      console.log(`📝 [FEED STORE] Se agregaron ${newItems.length} nuevos items a ${tab} (${content.length - newItems.length} duplicados omitidos)`);
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
      
      // Resetear paginación
      Object.keys(this.pagination).forEach(tab => {
        this.resetPagination(tab as FeedTab);
      });
      
      // Resetear inicialización
      this.isInitialized = {
        todo: false,
        noticias: false,
        comunidad: false
      };
      
      // Resetear tiempos
      this.lastFetchTime = {
        todo: null,
        noticias: null,
        comunidad: null
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
    updateItemLike(itemId: number, newLikesCount: number) {
      console.log(`❤️ [FEED STORE] updateItemLike - id: ${itemId}, likes: ${newLikesCount}`);
      
      // Actualizar en todas las pestañas donde aparezca el item
      [this.allContent, this.newsContent, this.communityContent].forEach(content => {
        const item = content.find(item => item.id === itemId);
        if (item) {
          item.likes_count = newLikesCount;
        }
      });
    },

    // Actualizar comentarios de un item específico
    updateItemComments(itemId: number, newCommentsCount: number) {
      console.log(`💬 [FEED STORE] updateItemComments - id: ${itemId}, comments: ${newCommentsCount}`);
      
      // Actualizar en todas las pestañas donde aparezca el item
      [this.allContent, this.newsContent, this.communityContent].forEach(content => {
        const item = content.find(item => item.id === itemId);
        if (item) {
          item.comments_count = newCommentsCount;
        }
      });
    },

    // ❤️ MÉTODOS PARA LIKES UNIFICADOS - API NUEVA
    async toggleLike(item: FeedItem) {
      console.log(`❤️ [FEED STORE] toggleLike called - feedId: ${item.id}`);
      
      try {
        const response = await feedService.toggleLike(item.id);
        
        // Actualizar contadores en todas las pestañas
        this.updateItemLike(item.id, response.likes_count);
        
        // Mostrar notificación
        const action = response.liked ? 'agregado' : 'eliminado';
        globalNotifications.success('Like actualizado', `Me gusta ${action} correctamente`);
        
        return response;
      } catch (error: any) {
        console.error('❌ [FEED STORE] Error al dar/quitar like:', error);
        globalNotifications.apiError(error, 'al actualizar el like');
        throw error;
      }
    },

    async addLike(item: FeedItem) {
      console.log(`❤️ [FEED STORE] addLike called - feedId: ${item.id}`);
      
      try {
        const response = await feedService.addLike(item.id);
        this.updateItemLike(item.id, response.likes_count);
        globalNotifications.success('¡Me gusta!', 'Tu like ha sido registrado');
        return response;
      } catch (error: any) {
        console.error('❌ [FEED STORE] Error al dar like:', error);
        globalNotifications.apiError(error, 'al dar like');
        throw error;
      }
    },

    async removeLike(item: FeedItem) {
      console.log(`💔 [FEED STORE] removeLike called - feedId: ${item.id}`);
      
      try {
        const response = await feedService.removeLike(item.id);
        this.updateItemLike(item.id, response.likes_count);
        globalNotifications.info('Like eliminado', 'Tu like ha sido retirado');
        return response;
      } catch (error: any) {
        console.error('❌ [FEED STORE] Error al quitar like:', error);
        globalNotifications.apiError(error, 'al quitar like');
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

    // 📄 MÉTODO PARA OBTENER UN ITEM ESPECÍFICO
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