<template>
  <article class="feed-item" :class="itemTypeClass">
    <!-- Header del item -->
    <header class="feed-item-header">
      <div class="item-meta">
        <span class="item-type" :class="typeClass">{{ typeLabel }}</span>
        <span class="item-author">{{ item.user_name || 'Sin autor' }}</span>
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
          class="item-image"
          loading="lazy"
          @error="handleImageError"
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
        <p class="item-description">
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
        <p class="item-description">{{ displayDescription }}</p>
        
        <!-- Imagen para comunidad (posición original) -->
        <div v-if="imageUrl" class="image-container">
          <img 
            v-if="!imageError"
            :src="imageUrl" 
            :alt="item.titulo"
            class="item-image"
            loading="lazy"
            @error="handleImageError"
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
      <div class="item-stats">
        <span class="stat likes" :class="{ active: isLiked }">
          <span class="stat-icon">❤️</span>
          <span class="stat-count">{{ formatNumber(item.likes_count) }}</span>
        </span>
        <span class="stat comments">
          <span class="stat-icon">💬</span>
          <span class="stat-count">{{ formatNumber(item.comments_count) }}</span>
        </span>
      </div>
      
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
          <span v-else>{{ isLiked ? '❤️' : '🤍' }}</span>
        </button>
        
        <button 
          @click="handleComments" 
          class="action-btn comment-btn"
          title="Ver comentarios"
        >
          💬
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
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { FeedItemProps, FeedItemEmits } from '@/types/feed';
import { useFeedStore } from '@/store/feedStore';

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

// Estado local
const isLiked = ref(false); // Estado local simple, se actualiza con las respuestas del servidor
const imageError = ref(false);
const isLikeLoading = ref(false);
const isExpanded = ref(false);

// Computed properties
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
      return null;
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
  
  // Construir URL completa del servidor
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  // Para imágenes, necesitamos solo la URL base del servidor, no la API
  const serverBaseUrl = baseUrl.replace('/api/v1', '');
  
  // Si ya es una URL completa, devolverla tal como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Si empieza con /public, construir la URL completa
  if (url.startsWith('/public')) {
    return `${serverBaseUrl}${url}`;
  }
  
  // Si empieza con /, construir la URL completa
  if (url.startsWith('/')) {
    return `${serverBaseUrl}${url}`;
  }
  
  // En caso contrario, construir la URL completa
  return `${serverBaseUrl}/${url}`;
});

const displayDescription = computed(() => {
  if (!props.truncateDescription) {
    return props.item.descripcion;
  }
  
  const maxLength = props.maxDescriptionLength;
  if (props.item.descripcion.length <= maxLength) {
    return props.item.descripcion;
  }
  
  return props.item.descripcion.substring(0, maxLength) + '...';
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
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

// Event handlers
const handleItemClick = () => {
  // Navegar a la página de detalle según el tipo
  if (props.item.type === 1) {
    // Para noticias, usar la ruta existente
    router.push(`/noticia/${props.item.id}`);
  } else {
    // Para comunidad, usar la nueva ruta
    router.push(`/comunidad/${props.item.id}`);
  }
  
  // Emitir evento para compatibilidad
  emit('item-click', props.item);
};

const handleLike = async () => {
  if (isLikeLoading.value) return; // Prevenir clicks múltiples
  
  isLikeLoading.value = true;
  const originalLiked = isLiked.value;
  
  try {
    // Optimistic update
    isLiked.value = !isLiked.value;
    
    // Llamar al store que maneja la nueva API
    const response = await feedStore.toggleLike(props.item);
    
    // Actualizar estado real basado en respuesta del servidor
    isLiked.value = response.liked;
    
    emit('like', props.item);
  } catch (error) {
    // Rollback en caso de error
    isLiked.value = originalLiked;
    console.error('Error al dar like:', error);
  } finally {
    isLikeLoading.value = false;
  }
};

const handleComments = () => {
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
  console.warn('Error loading image:', {
    originalUrl: props.item.image_url,
    processedUrl: imageUrl.value,
    itemId: props.item.id,
    itemType: props.item.type
  });
  imageError.value = true;
};

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<style scoped>
.feed-item {
  background: white;
  border: 1px solid #e0e0e0;
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
  border-color: #007bff;
}

.feed-item--news {
  border-left: 5px solid #007bff;
}

.feed-item--news:hover {
  border-left-color: #0056b3;
}

.feed-item--community {
  border-left: 5px solid #28a745;
}

.feed-item--community:hover {
  border-left-color: #1e7e34;
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
  color: #212529;
  line-height: 1.3;
  transition: color 0.3s ease;
}

.clickable-title {
  cursor: pointer;
}

.clickable-title:hover {
  color: #007bff;
  text-decoration: underline;
}

.feed-item:hover .item-title {
  color: #007bff;
}

.item-summary {
  margin: 0 0 12px 0;
  color: #495057;
  font-style: italic;
  font-size: 16px;
  line-height: 1.4;
  border-left: 3px solid #007bff;
  padding-left: 12px;
}

.item-description-container {
  margin-bottom: 16px;
}

.item-description {
  margin: 0 0 16px 0;
  color: #495057;
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

.item-stats {
  display: flex;
  gap: 20px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6c757d;
  transition: all 0.3s ease;
}

.stat.likes.active {
  color: #dc3545;
}

.stat:hover {
  color: #495057;
  transform: translateY(-1px);
}

.stat-icon {
  font-size: 16px;
}

.stat-count {
  font-weight: 600;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 12px;
  border: 2px solid #dee2e6;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.like-btn:hover, .like-btn.active {
  background: #dc3545;
  border-color: #dc3545;
  color: white;
}

.like-btn.loading {
  background: #f8f9fa;
  border-color: #dee2e6;
  color: #6c757d;
  cursor: not-allowed;
}

.like-btn.loading:hover {
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  animation: spin 0.8s linear infinite;
}

.comment-btn:hover {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.share-btn:hover {
  background: #28a745;
  border-color: #28a745;
  color: white;
}

.details-btn:hover {
  background: #6f42c1;
  border-color: #6f42c1;
  color: white;
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

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .feed-item {
    background: #1a1a1a;
    border-color: #404040;
    color: #e0e0e0;
  }
  
  .feed-item:hover {
    border-color: #3182ce;
  }
  
  .item-title {
    color: #f0f0f0;
  }
  
  .feed-item:hover .item-title {
    color: #3182ce;
  }
  
  .item-description, .item-summary {
    color: #b0b0b0;
  }
  
  .item-meta, .item-date {
    color: #888;
  }
  
  .item-author {
    color: #c0c0c0;
  }
  
  .feed-item-footer {
    border-top-color: #404040;
  }
  
  .action-btn {
    background: #2a2a2a;
    border-color: #404040;
    color: #e0e0e0;
  }
  
  .action-btn:hover {
    background: #3a3a3a;
  }
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