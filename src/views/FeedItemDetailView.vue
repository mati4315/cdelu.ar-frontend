<template>
  <div class="feed-item-detail-view">
    <div class="container mx-auto px-4 py-8">
      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">⏳</div>
        <p>Cargando...</p>
      </div>
      
      <!-- Error -->
      <div v-else-if="error" class="error-container">
        <div class="error-icon">❌</div>
        <h2>Error al cargar el contenido</h2>
        <p>{{ error }}</p>
        <button @click="loadItem" class="retry-btn">Reintentar</button>
      </div>
      
      <!-- Contenido del post -->
      <article v-else-if="item" class="feed-item-detail">
        <!-- Header -->
        <header class="item-header">
          <div class="item-meta">
            <span class="item-type" :class="typeClass">{{ typeLabel }}</span>
            <span class="item-author">{{ item.user_name || 'Sin autor' }}</span>
            <time class="item-date" :datetime="item.published_at || item.created_at">
              {{ formatDate(item.published_at || item.created_at) }}
            </time>
          </div>
          
          <!-- Badge oficial -->
          <span v-if="item.is_oficial === true" class="official-badge">
            🏛️ Oficial
          </span>
        </header>
        
        <!-- Título -->
        <h1 class="item-title">{{ item.titulo }}</h1>
        
        <!-- Imagen -->
        <div v-if="imageUrl" class="image-container">
          <img 
            v-if="!imageError"
            :src="imageUrl" 
            :alt="item.titulo"
            class="item-image"
            @error="handleImageError"
          />
          <div v-else class="image-error-placeholder">
            <span class="image-error-icon">🖼️</span>
            <span class="image-error-text">Imagen no disponible</span>
          </div>
        </div>
        
        <!-- Resumen -->
        <div v-if="item.resumen" class="item-summary">
          {{ item.resumen }}
        </div>
        
        <!-- Contenido completo -->
        <div class="item-content">
          <p class="item-description">{{ item.descripcion }}</p>
        </div>
        
        <!-- Video -->
        <div v-if="item.video_url" class="video-container">
          <span class="video-icon">🎬</span>
          <span>Video disponible</span>
        </div>
        
        <!-- Footer con estadísticas -->
        <footer class="item-footer">
          <div class="item-stats">
            <span class="stat likes">
              <span class="stat-icon">❤️</span>
              <span class="stat-count">{{ formatNumber(item.likes_count || 0) }}</span>
            </span>
            <span class="stat comments">
              <span class="stat-icon">💬</span>
              <span class="stat-count">{{ formatNumber(item.comments_count || 0) }}</span>
            </span>
          </div>
          
          <!-- Botón volver -->
          <div class="actions">
            <button @click="goBack" class="back-btn">
              ← Volver al feed
            </button>
          </div>
        </footer>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFeedStore } from '@/store/feedStore';
import type { FeedItem } from '@/types/feed';

// Props
interface Props {
  type?: string;
  id?: string;
}

const props = defineProps<Props>();
const route = useRoute();
const router = useRouter();
const feedStore = useFeedStore();

// Estado
const item = ref<FeedItem | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const imageError = ref(false);

// Computed
const typeLabel = computed(() => {
  const itemType = item.value?.type || parseInt(props.type || '1');
  return itemType === 1 ? 'Noticia' : 'Comunidad';
});

const typeClass = computed(() => {
  const itemType = item.value?.type || parseInt(props.type || '1');
  return itemType === 1 ? 'type-news' : 'type-community';
});

// Procesar imagen (misma lógica que FeedItem)
const imageUrl = computed(() => {
  if (!item.value?.image_url) return null;
  
  let url = item.value.image_url;
  
  // Si viene como string que parece un array, parsearlo
  if (typeof url === 'string' && url.startsWith('[') && url.endsWith(']')) {
    try {
      const parsed = JSON.parse(url);
      url = Array.isArray(parsed) ? parsed[0] : url;
    } catch (e) {
      console.warn('Error parsing image URL:', url);
      return null;
    }
  }
  
  // Si es un array, tomar el primer elemento
  if (Array.isArray(url)) {
    url = url[0];
  }
  
  if (!url || typeof url !== 'string') return null;
  
  // Construir URL completa
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  const serverBaseUrl = baseUrl.replace('/api/v1', '');
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  if (url.startsWith('/public')) {
    return `${serverBaseUrl}${url}`;
  }
  
  if (url.startsWith('/')) {
    return `${serverBaseUrl}${url}`;
  }
  
  return `${serverBaseUrl}/${url}`;
});

// Funciones
const loadItem = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const itemType = props.type || route.params.type as string;
    const itemId = props.id || route.params.id as string;
    
    console.log('🔍 [DETAIL] Loading item by original_id:', { type: itemType, original_id: itemId });
    
    // Usar el nuevo servicio que obtiene por original_id (ID del post real)
    // en lugar del feedId (ID del feed unificado)
    const response = await feedStore.getPostByOriginalId(parseInt(itemType), parseInt(itemId));
    item.value = response;
    
    console.log('✅ [DETAIL] Item loaded:', item.value);
  } catch (err) {
    console.error('❌ [DETAIL] Error loading item:', err);
    error.value = err instanceof Error ? err.message : 'Error desconocido';
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'Sin fecha';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

const handleImageError = () => {
  imageError.value = true;
};

const goBack = () => {
  router.push('/');
};

// Lifecycle
onMounted(() => {
  loadItem();
});
</script>

<style scoped>
.feed-item-detail-view {
  min-height: calc(100vh - 80px);
  background: #f8f9fa;
  padding-top: 80px; /* Para el header fijo */
}

.container {
  max-width: 800px;
}

/* Loading */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.loading-spinner {
  font-size: 48px;
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #0056b3;
}

/* Artículo */
.feed-item-detail {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
}

/* Header */
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e9ecef;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #6c757d;
}

.item-type {
  padding: 6px 16px;
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
}

.official-badge {
  background: linear-gradient(135deg, #ffc107, #e0a800);
  color: #212529;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.3);
}

/* Título */
.item-title {
  font-size: 32px;
  font-weight: 800;
  color: #212529;
  line-height: 1.2;
  margin-bottom: 24px;
}

/* Imagen */
.image-container {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 100%;
  height: auto;
  display: block;
}

.image-error-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
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

/* Contenido */
.item-summary {
  background: #e3f2fd;
  border-left: 4px solid #007bff;
  padding: 16px 20px;
  margin-bottom: 24px;
  font-style: italic;
  font-size: 18px;
  line-height: 1.5;
  border-radius: 0 8px 8px 0;
}

.item-content {
  margin-bottom: 24px;
}

.item-description {
  font-size: 18px;
  line-height: 1.7;
  color: #495057;
  margin: 0;
}

/* Video */
.video-container {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  padding: 12px 20px;
  border-radius: 20px;
  font-weight: 600;
  margin-bottom: 24px;
}

/* Footer */
.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 2px solid #e9ecef;
}

.item-stats {
  display: flex;
  gap: 24px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #6c757d;
}

.stat-icon {
  font-size: 18px;
}

.stat-count {
  font-weight: 600;
}

.back-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .feed-item-detail {
    padding: 24px 20px;
  }
  
  .item-title {
    font-size: 24px;
  }
  
  .item-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .actions {
    text-align: center;
  }
}

/* Animaciones */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.feed-item-detail {
  animation: fadeIn 0.5s ease-out;
}

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
</style> 