<template>
  <article class="feed-item" :class="itemTypeClass" style="min-height: 180px; contain: layout;">
    <!-- Header del item -->
    <header class="feed-item-header">
      <div class="item-meta">
        <span class="item-type" :class="typeClass">{{ typeLabel }}</span>
        
        <!-- Avatar y nombre del autor -->
        <div v-if="item.user_name && item.user_id" class="author-info">
          <img 
            v-if="item.user_profile_picture"
            :src="getOptimizedImageUrl(getFullImageUrl(item.user_profile_picture), 'small')"
            :srcset="generateSrcSet(getFullImageUrl(item.user_profile_picture))"
            :sizes="generateSizes('avatar')"
            :alt="`Avatar de ${item.user_name}`"
            class="author-avatar"
            loading="lazy"
            decoding="async"
            @error="handleAvatarError"
          />
          <div 
            v-else
            class="author-avatar default-avatar"
            :title="`${item.user_name.charAt(0).toUpperCase()}`"
          >
            {{ item.user_name.charAt(0).toUpperCase() }}
          </div>
          <span 
            class="item-author clickable-author" 
            @click.stop="handleAuthorClick"
            :title="`Ver perfil de ${item.user_name}`"
          >
            {{ item.user_name }}
          </span>
        </div>
        <span v-else class="item-author">Sin autor</span>
        
        <time class="item-date" :datetime="item.published_at || item.created_at">
          {{ formatDate(item.published_at || item.created_at) }}
        </time>
      </div>
      
      <!-- Badge oficial para noticias -->
      <span v-if="item.is_oficial === true" class="official-badge">
        🏛️ Oficial
      </span>
    </header>

    <!-- Contenido principal -->
    <div class="feed-item-content">
      <h3 class="item-title clickable-title" @click="handleItemClick">{{ item.titulo }}</h3>
      
      <!-- Imagen después del título para noticias -->
      <div v-if="imageUrl && item.type === 1" class="image-container">
        <img 
          v-if="!imageError"
          :src="imageUrl" 
          :alt="item.titulo"
          class="item-image cursor-pointer hover:opacity-90 transition-opacity"
          loading="lazy"
          @error="handleImageError"
          @click="openImageModal"
        />
        <div v-else class="image-error-placeholder">
          <span class="image-error-icon">🖼️</span>
          <span class="image-error-text">Imagen no disponible</span>
        </div>
      </div>
      
      <!-- Resumen para noticias -->
      <p v-if="item.resumen && item.type === 1" class="item-summary">
        {{ item.resumen }}
      </p>
      
      <!-- Descripción con leer más para noticias -->
      <div v-if="item.type === 1" class="item-description-container">
        <p class="item-description" style="min-height: 3em; contain: layout;">
          {{ isExpanded ? item.descripcion : truncatedDescription }}
          <button 
            v-if="needsReadMore" 
            @click.stop="toggleExpanded"
            class="read-more-btn"
          >
            {{ isExpanded ? ' Leer menos' : ' Leer más' }}
          </button>
        </p>
      </div>
      
      <!-- Para posts de comunidad, mantener diseño original -->
      <template v-else>
        <p class="item-description" style="min-height: 3em; contain: layout;">
          {{ isExpanded ? props.item.descripcion : truncatedDescription }}
          <button 
            v-if="needsReadMore" 
            @click.stop="toggleExpanded"
            class="read-more-btn"
          >
            {{ isExpanded ? ' Ocultar' : ' Leer más' }}
          </button>
        </p>

        <!-- Imagen para comunidad (posición original) -->
        <div v-if="imageUrl" class="image-container">
          <img 
            v-if="!imageError"
            :src="imageUrl" 
            :alt="item.titulo"
            class="item-image cursor-pointer hover:opacity-90 transition-opacity"
            loading="lazy"
            @error="handleImageError"
            @click="openImageModal"
          />
          <div v-else class="image-error-placeholder">
            <span class="image-error-icon">🖼️</span>
            <span class="image-error-text">Imagen no disponible</span>
          </div>
        </div>
      </template>
      
      <!-- Indicador de video -->
      <div v-if="item.video_url" class="video-indicator">
        <span class="video-icon">🎬</span>
        <span>Incluye video</span>
      </div>
    </div>

    <!-- Footer con estadísticas y acciones -->
    <footer class="feed-item-footer" v-if="showActions">
      <!-- Eliminado item-stats -->
      
      <!-- Acciones -->
      <div class="item-actions">
        <button 
          @click="handleLike" 
          class="action-btn like-btn"
          :class="{ active: isLiked, loading: isLikeLoading }"
          :title="isLiked ? 'Quitar me gusta' : 'Me gusta'"
          :disabled="isLikeLoading"
        >
          <span v-if="isLikeLoading" class="loading-spinner">⏳</span>
          <span v-else class="like-btn-content">
            <span class="like-icon">{{ isLiked ? '💚' : '🤍' }}</span>
            <span class="like-count">{{ formatNumber(item.likes_count) }}</span>
          </span>
        </button>
        
        <button 
          @click="handleComments" 
          class="action-btn comment-btn"
          title="Ver comentarios"
        >
          <span class="comment-btn-content">
            <span class="comment-icon">💬</span>
            <span class="comment-count">{{ formatNumber(item.comments_count || 0) }}</span>
          </span>
        </button>
        
        <button 
          @click="handleShare" 
          class="action-btn share-btn"
          title="Compartir"
        >
          🔗
        </button>
        
        <button 
          @click="handleItemClick" 
          class="action-btn details-btn"
          title="Ver detalles"
        >
          👁️
        </button>
      </div>
    </footer>
  </article>
  
  <!-- Modal de imagen (teleport al body para máxima compatibilidad) -->
  <Teleport to="body">
    <ImageViewerModal
      v-if="showImageModal"
      :images="[imageUrl!]"
      :initial-index="0"
      @close="closeImageModal"
    />
  </Teleport>

  <!-- Modal de invitación a login -->
  <LoginPromptModal
    :is-open="showLoginPrompt"
    @close="closeLoginPrompt"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { FeedItemProps, FeedItemEmits } from '@/types/feed';
import { useFeedStore } from '@/store/feedStore';
import { useAuth } from '@/composables/useAuth';
import { profileService } from '@/services/profileService';
import { getOptimizedImageUrl, generateSrcSet, generateSizes } from '@/utils/imageOptimization';
import ImageViewerModal from '@/components/ui/ImageViewerModal.vue';
import LoginPromptModal from '@/components/ui/LoginPromptModal.vue';

interface Props extends FeedItemProps {}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  truncateDescription: true,
  maxDescriptionLength: 200
});

const emit = defineEmits<FeedItemEmits>();

// Store y Router
const feedStore = useFeedStore();
const router = useRouter();
const { debugAuth, isAuthenticated } = useAuth();

// Estado local
const imageError = ref(false);
const isLikeLoading = ref(false);
const isExpanded = ref(false);
const showImageModal = ref(false);
const showLoginPrompt = ref(false);

// Computed properties - usar el estado del servidor
const isLiked = computed(() => props.item.is_liked || false);

const typeLabel = computed(() => {
  return props.item.type === 1 ? 'Noticia' : 'Comunidad';
});

const typeClass = computed(() => {
  return props.item.type === 1 ? 'type-news' : 'type-community';
});

const itemTypeClass = computed(() => {
  return props.item.type === 1 ? 'feed-item--news' : 'feed-item--community';
});

// Procesar la URL de imagen que puede venir como array
const imageUrl = computed(() => {
  if (!props.item.image_url) return null;
  
  let url = props.item.image_url;
  
  // Si viene como string que parece un array, parsearlo
  if (typeof url === 'string' && url.startsWith('[') && url.endsWith(']')) {
    try {
      const parsed = JSON.parse(url);
      url = Array.isArray(parsed) ? parsed[0] : url;
    } catch (e) {
      console.warn('🖼️ [IMAGE] Error parsing URL:', props.item.image_url);
      // Si no se puede parsear, intentar extraer manualmente
      const match = url.match(/\["([^"]+)"\]/);
      if (match) {
        url = match[1];
      } else {
        return null;
      }
    }
  }
  
  // Si es un array, tomar el primer elemento
  if (Array.isArray(url)) {
    url = url[0];
  }
  
  // Si no hay URL válida, retornar null
  if (!url || typeof url !== 'string') {
    console.warn('🖼️ [IMAGE] Invalid URL for item:', props.item.id);
    return null;
  }
  
  // Si ya es una URL completa, devolverla tal como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Construir URL completa (tanto en desarrollo como producción)
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  const serverBaseUrl = baseUrl.replace('/api/v1', '');
  
  // Si comienza con /public, remover el /public para evitar duplicación
  if (url.startsWith('/public/')) {
    const cleanUrl = url.replace('/public/', '/');
    return `${serverBaseUrl}${cleanUrl}`;
  }
  
  // En desarrollo, si es una ruta relativa simple, usar proxy de Vite
  if (import.meta.env.DEV && !url.startsWith('/')) {
    return url; // El proxy de Vite manejará la redirección automáticamente
  }
  
  // Si empieza con /, construir la URL completa
  if (url.startsWith('/')) {
    return `${serverBaseUrl}${url}`;
  }
  
  // En caso contrario, construir la URL completa
  return `${serverBaseUrl}/${url}`;
});

const truncatedDescription = computed(() => {
  if (!props.truncateDescription) {
    return props.item.descripcion;
  }
  
  const maxLength = props.maxDescriptionLength;
  if (props.item.descripcion.length <= maxLength) {
    return props.item.descripcion;
  }
  
  return props.item.descripcion.substring(0, maxLength) + '...';
});

const needsReadMore = computed(() => {
  if (!props.truncateDescription) {
    return false;
  }
  
  const maxLength = props.maxDescriptionLength;
  return props.item.descripcion.length > maxLength;
});

// Funciones de formateo
const formatDate = (dateString: string): string => {
  if (!dateString) return 'Sin fecha';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return 'Hoy';
  } else if (diffDays === 2) {
    return 'Ayer';
  } else if (diffDays <= 7) {
    return `Hace ${diffDays - 1} días`;
  } else {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

const formatNumber = (num: number): string => {
  // Validar entrada y convertir a número seguro
  const safeNum = typeof num === 'number' && !isNaN(num) ? num : 0;
  
  if (safeNum >= 1000000) {
    return `${(safeNum / 1000000).toFixed(1)}M`;
  } else if (safeNum >= 1000) {
    return `${(safeNum / 1000).toFixed(1)}k`;
  }
  return safeNum.toString();
};

// Event handlers
const handleItemClick = () => {
  // Navegar a la página de detalle según el tipo
  // IMPORTANTE: Usar original_id en lugar de id para la navegación
  // item.id es del feed unificado, item.original_id es del post real
  
  // Obtener la pestaña actual de la URL para preservarla
  const currentRoute = router.currentRoute.value;
  const currentTab = currentRoute.query.tab;
  
  if (props.item.type === 1) {
    // Para noticias, usar la ruta existente
    router.push({
      path: `/noticia/${props.item.original_id}`,
      query: currentTab ? { from_tab: currentTab } : {}
    });
  } else {
    // Para comunidad, usar la nueva ruta  
    router.push({
      path: `/comunidad/${props.item.original_id}`,
      query: currentTab ? { from_tab: currentTab } : {}
    });
  }
  
  console.log(`🔗 [NAVIGATION] Navegando a post - tipo: ${props.item.type}, original_id: ${props.item.original_id}, feed_id: ${props.item.id}, from_tab: ${currentTab}`);
  
  // Emitir evento para compatibilidad
  emit('item-click', props.item);
};

// Función para navegar al perfil del autor
const handleAuthorClick = () => {
  if (props.item.user_id && props.item.user_name) {
    console.log(`👤 [NAVIGATION] Navegando a perfil del autor - user_id: ${props.item.user_id}, user_name: ${props.item.user_name}`);
    
    // Generar username basado en el nombre del usuario
    const username = generateUsername(props.item.user_name);
    
    // Navegar al perfil público usando el username generado
    router.push(`/user/${username}`);
  }
};

// Función para generar username desde el nombre
const generateUsername = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '.') // Espacios por puntos
    .replace(/[^a-z0-9._-]/g, '') // Solo caracteres válidos
    .replace(/\.+/g, '.') // Múltiples puntos por uno solo
    .replace(/^\.+|\.+$/g, '') // Quitar puntos al inicio y final
    .substring(0, 30) || 'usuario'; // Máximo 30 caracteres con fallback
};

// Modal de imagen
const openImageModal = () => {
  if (imageUrl.value) {
    showImageModal.value = true;
  }
};

const closeImageModal = () => {
  showImageModal.value = false;
};

const closeLoginPrompt = () => {
  showLoginPrompt.value = false;
};

const handleLike = async () => {
  if (isLikeLoading.value) return; // Prevenir clicks múltiples
  
  // Debug de autenticación
  console.log(`❤️ [FEEDITEM] Intentando dar like - feedId: ${props.item.id}`);
  debugAuth();
  
  if (!isAuthenticated.value) {
    console.log('⚠️ [FEEDITEM] Usuario no autenticado - mostrando modal de login');
    showLoginPrompt.value = true;
    return;
  }
  
  isLikeLoading.value = true;
  
  try {
    // Llamar al store que maneja la nueva API - SOLO PASAR EL ID
    const response = await feedStore.toggleLike(props.item.id);
    
    // El estado se actualiza automáticamente a través del store
    // No necesitamos hacer actualizaciones optimistas
    console.log(`✅ [FEEDITEM] Like procesado exitosamente:`, response);
    
    emit('like', props.item);
  } catch (error) {
    console.error('❌ [FEEDITEM] Error al dar like:', error);
    
    // No mostrar doble notificación ya que el store ya la muestra
  } finally {
    isLikeLoading.value = false;
  }
};

const handleComments = () => {
  console.log(`💬 [FEED ITEM] Navegando a comentarios - tipo: ${props.item.type}, original_id: ${props.item.original_id}`);
  
  // Determinar la ruta según el tipo de post
  let routePath: string;
  
  if (props.item.type === 1) {
    // Para noticias, usar la ruta existente
    routePath = `/noticia/${props.item.original_id}`;
  } else {
    // Para comunidad, usar la nueva ruta
    routePath = `/comunidad/${props.item.original_id}`;
  }
  
  // Navegar y hacer scroll automático a la sección de comentarios
  router.push(routePath).then(() => {
    // Esperar un poco para que la página cargue y luego hacer scroll
    setTimeout(() => {
      const commentsSection = document.getElementById('comments-section');
      if (commentsSection) {
        commentsSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
        console.log('✅ [FEED ITEM] Scroll automático a comentarios realizado');
      } else {
        console.warn('⚠️ [FEED ITEM] Sección de comentarios no encontrada, reintentando...');
        // Reintentar después de más tiempo si no se encuentra
        setTimeout(() => {
          const retrySection = document.getElementById('comments-section');
          if (retrySection) {
            retrySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            console.log('✅ [FEED ITEM] Scroll a comentarios realizado (segundo intento)');
          }
        }, 1000);
      }
    }, 800);
  });
  
  // Mantener compatibilidad con el evento
  emit('comments', props.item);
};

const handleShare = async () => {
  try {
    emit('share', props.item);
    
    // Implementar funcionalidad de compartir nativa
    if (navigator.share) {
      await navigator.share({
        title: props.item.titulo,
        text: props.item.descripcion,
        url: window.location.href
      });
    } else {
      // Fallback: copiar al clipboard
      await navigator.clipboard.writeText(window.location.href);
      console.log('Link copiado al portapapeles');
    }
  } catch (error) {
    console.error('Error al compartir:', error);
  }
};

const handleImageError = () => {
  imageError.value = true;
};

const handleAvatarError = (event: Event) => {
  // Si falla cargar el avatar, no hacer nada (se muestra el fallback automáticamente)
  console.warn('🖼️ [FEED ITEM] Error cargando avatar:', event);
};

const getFullImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  return profileService.getFullImageUrl(url);
};

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<style scoped>
.feed-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.feed-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  border-color: var(--accent);
}

.feed-item--news {
  border-left: 5px solid var(--accent);
}

/* Solo en tema claro, dar fondo azulado suave y texto oscuro */
/* Aplicar estilo claro a TODOS los tipos de feed-item en tema claro */
html:not(.dark) .feed-item {
  background: var(--surface);
  color: var(--text);
  border-color: var(--border);
}

/* Noticias con superficie azulada suave en tema claro */
html:not(.dark) .feed-item.feed-item--news {
  background: var(--news-surface);
  color: var(--text);
  border-color: var(--news-border);
}

.feed-item--news:hover {
  border-left-color: #0056b3;
}

.feed-item--community {
  border-left: 5px solid var(--accent);
}

.feed-item--community:hover {
  border-left-color: #0056b3;
}

/* Header */
.feed-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #6c757d;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
}

.author-avatar.default-avatar {
  background: linear-gradient(135deg, var(--accent), #0056b3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.item-type {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.item-type.type-news {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
}

.item-type.type-community {
  background: linear-gradient(135deg, #28a745, #1e7e34);
  color: white;
}

.item-author {
  font-weight: 600;
  color: #495057;
}

.clickable-author {
  cursor: pointer;
  transition: color 0.2s ease;
  border-radius: 4px;
  padding: 2px 4px;
  margin: -2px -4px;
}

.clickable-author:hover {
  color: #007bff;
  background-color: rgba(0, 123, 255, 0.1);
  text-decoration: underline;
}

.item-date {
  color: #6c757d;
  font-size: 13px;
}

.official-badge {
  background: linear-gradient(135deg, #ffc107, #e0a800);
  color: #212529;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.3);
}

/* Contenido */
.feed-item-content {
  margin-bottom: 20px;
}

.item-title {
  margin: 0 0 12px 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.3;
  transition: color 0.3s ease;
}

.clickable-title {
  cursor: pointer;
}

.clickable-title:hover {
  color: #2ecc71;
  text-decoration: underline;
}

.feed-item:hover .item-title {
  color: #2ecc71;
}

.item-summary {
  margin: 0 0 12px 0;
  color: #495057;
  font-style: italic;
  font-size: 16px;
  line-height: 1.4;
  border-left: 3px solid var(--accent);
  padding-left: 12px;
}

.item-description-container {
  margin-bottom: 16px;
}

.item-description {
  margin: 0 0 16px 0;
  color: var(--text);
  line-height: 1.6;
  font-size: 16px;
}

.image-container {
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.feed-item:hover .item-image {
  transform: scale(1.02);
}

.video-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.video-icon {
  font-size: 16px;
}

/* Footer */
.feed-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

/* item-stats eliminado */

.item-actions {
  display: flex;
  gap: 10px;
  padding: 6px;
  border-radius: 16px;
  margin-left: auto; /* Mantener a la derecha */
}

.action-btn {
  padding: 8px 12px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  border-radius: 22px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
}

.like-btn .like-btn-content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.like-btn .like-count {
  font-weight: 700;
  font-size: 14px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  background: var(--surface);
  border-color: var(--border);
}

.like-btn:hover, .like-btn.active {
  background: var(--success);
  border-color: var(--success);
  color: #ffffff;
}

.like-btn.loading {
  background: var(--surface-2);
  border-color: var(--border);
  color: var(--muted);
  cursor: not-allowed;
}

.like-btn.loading:hover {
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  animation: spin 0.8s linear infinite;
}

.comment-btn .comment-btn-content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.comment-btn .comment-count {
  font-weight: 700;
  font-size: 14px;
}

.comment-btn:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #ffffff;
}

.share-btn:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #ffffff;
}

.details-btn:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #ffffff;
}

/* Responsive */
@media (max-width: 768px) {
  .feed-item {
    padding: 20px;
    margin-bottom: 16px;
  }

  .item-title {
    font-size: 20px;
  }

  .item-description {
    font-size: 15px;
  }

  .item-meta {
    gap: 8px;
    flex-wrap: wrap;
  }

  .author-avatar {
    width: 28px;
    height: 28px;
  }

  .author-avatar.default-avatar {
    font-size: 12px;
  }

  .item-actions {
    gap: 6px;
  }

  .action-btn {
    min-width: 40px;
    height: 40px;
    padding: 6px 10px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .feed-item {
    padding: 16px;
  }
  
  .item-title {
    font-size: 18px;
  }
  
  .feed-item-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .item-actions {
    justify-content: center;
  }
}

/* Dark mode controlado por clase .dark usando variables */
html.dark .feed-item {
  background: var(--surface);
  border-color: var(--border);
  color: var(--text);
}

html.dark .feed-item:hover {
  border-color: var(--accent);
}

html.dark .item-title {
  color: var(--text);
}

html.dark .feed-item:hover .item-title {
  color: #34d399;
}

html.dark .item-description, html.dark .item-summary {
  color: var(--text);
}

html.dark .item-meta, html.dark .item-date {
  color: var(--muted);
}

html.dark .item-author {
  color: var(--text);
}

html.dark .clickable-author:hover {
  color: #4da6ff;
  background-color: rgba(77, 166, 255, 0.15);
}

html.dark .feed-item-footer {
  border-top-color: var(--border);
}

html.dark .action-btn {
  background: var(--surface-2);
  border-color: var(--border);
  color: var(--text);
}

html.dark .action-btn:hover {
  background: var(--surface);
}

/* Animaciones adicionales */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feed-item {
  animation: fadeIn 0.5s ease-out;
}

/* Accesibilidad mejorada */
.action-btn:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.feed-item:focus-within {
  border-color: #007bff;
}

.image-error-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  color: #6c757d;
}

.image-error-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.image-error-text {
  font-size: 14px;
  font-weight: 500;
}

.read-more-btn {
  background: none;
  border: none;
  color: #007bff;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  text-decoration: underline;
  font-size: inherit;
  transition: color 0.3s ease;
}

.read-more-btn:hover {
  color: #0056b3;
  text-decoration: none;
}

.read-more-btn:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
  border-radius: 2px;
}
</style> 