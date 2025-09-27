<template>
  <div class="community-detail-container py-8 px-4">
    <div v-if="loading && !item" class="text-center py-10">
      <p class="text-lg text-gray-600 dark:text-gray-300">Cargando contenido...</p>
    </div>
    <div v-else-if="error && !item" class="text-center py-10 text-red-500 dark:text-red-400">
      <p>Error al cargar el contenido: {{ error }}</p>
      <button @click="loadItem" class="retry-btn mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Reintentar
      </button>
    </div>
    <article v-else-if="item" class="community-detail bg-white dark:bg-gray-800 shadow-xl dark:shadow-gray-700/50 rounded-lg overflow-hidden max-w-4xl mx-auto transition-colors duration-300">
      <!-- Header con metadatos -->
      <div class="p-6 md:p-8 border-b border-gray-200 dark:border-gray-700">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div class="flex items-center gap-3 mb-2 sm:mb-0">
            <span class="item-type" :class="typeClass">{{ typeLabel }}</span>
            <span v-if="item.user_name" class="font-medium text-gray-700 dark:text-gray-200">
              Por: {{ item.user_name }}
            </span>
            <span v-if="item.is_oficial" class="official-badge">
              🏛️ Oficial
            </span>
          </div>
          <span class="text-gray-500 dark:text-gray-400">{{ formatDate(item.published_at || item.created_at) }}</span>
        </div>
      </div>

      <!-- Imagen principal (si existe) -->
      <div v-if="imageUrl && !imageError">
        <img 
             :src="imageUrl" 
             :alt="`Imagen de ${item.titulo}`" 
             class="w-full h-auto object-cover max-h-[500px]"
             @error="handleImageError">
      </div>
      
      <div class="p-6 md:p-8">
        <!-- Título -->
        <h1 class="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">{{ item.titulo }}</h1>
        
        <!-- Resumen (si existe) -->
        <div v-if="item.resumen" class="prose prose-lg dark:prose-invert max-w-none mb-6 text-gray-600 dark:text-gray-400 italic border-l-4 border-blue-500 pl-4">
          {{ item.resumen }}
        </div>
        
        <!-- Contenido principal -->
        <div class="prose prose-lg dark:prose-invert max-w-none mb-8 text-gray-700 dark:text-gray-300" v-html="displayDescription(item.descripcion)"></div>
        
        <!-- Video indicator -->
        <div v-if="item.video_url" class="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <div class="flex items-center gap-2 text-red-700 dark:text-red-300">
            <span class="text-xl">🎬</span>
            <span class="font-medium">Este post incluye contenido de video</span>
          </div>
        </div>
        
        <!-- Botones de interacción -->
        <div class="flex items-center mb-8">
          <button @click="handleLike" 
                  :disabled="!isAuthenticated"
                  class="mr-4 flex items-center py-2 px-4 rounded-md transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="{
                    'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700': isLiked,
                    'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600': !isLiked
                  }">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
            <span class="font-medium">
              {{ likesCount }} {{ likesCount === 1 ? 'Me gusta' : 'Me gustas' }}
            </span>
          </button>
          
          <!-- Botón de comentarios -->
          <button class="flex items-center py-2 px-4 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-150 ease-in-out">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"/>
            </svg>
            <span class="font-medium">
              {{ item.comments_count || 0 }} {{ (item.comments_count || 0) === 1 ? 'Comentario' : 'Comentarios' }}
            </span>
          </button>
        </div>

        <!-- Sección de comentarios -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
          <FeedCommentSection 
            :feed-id="item.id" 
          />
        </div>

        <!-- Botón volver -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <button @click="goBack" class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Volver al feed
          </button>
        </div>
      </div>
    </article>
    <div v-else class="text-center py-10">
      <p class="text-lg text-gray-600 dark:text-gray-300">No se encontró el contenido.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFeedStore } from '@/store/feedStore';
import { useAuth } from '@/composables/useAuth';
import { useTokenValidation } from '@/composables/useTokenValidation';
import FeedCommentSection from '@/components/feed/FeedCommentSection.vue';
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
const { isAuthenticated } = useAuth();
const { ensureValidToken } = useTokenValidation();

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

const typeValue = computed(() => {
  return item.value?.type || parseInt(props.type || '1');
});

const isLiked = computed(() => item.value?.is_liked || false);
const likesCount = computed(() => item.value?.likes_count || 0);

// Procesar imagen (misma lógica que otros componentes)
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
    
    console.log(`🔍 [COMMUNITY DETAIL] Loading item by original_id: type=${itemType}, original_id=${itemId}`);
    
    // Usar el servicio que obtiene por original_id
    const response = await feedStore.getPostByOriginalId(parseInt(itemType) as 1 | 2, parseInt(itemId));
    item.value = response;
    
    console.log(`✅ [COMMUNITY DETAIL] Item loaded:`, item.value);
  } catch (err) {
    console.error('❌ [COMMUNITY DETAIL] Error loading item:', err);
    error.value = err instanceof Error ? err.message : 'Error desconocido';
  } finally {
    loading.value = false;
  }
};

const handleLike = async () => {
  console.log(`❤️ [COMMUNITY DETAIL] Intentando like en item ID: ${item.value?.original_id}`);
  
  // Verificar autenticación y token válido
  if (!isAuthenticated.value) {
    console.log('❌ [COMMUNITY DETAIL] Usuario no autenticado');
    return;
  }

  if (!ensureValidToken()) {
    console.log('❌ [COMMUNITY DETAIL] Token inválido o expirado');
    return;
  }

  if (!item.value?.id) {
    console.log(`❌ [COMMUNITY DETAIL] No se encontró el item en el feed`);
    return;
  }

  try {
    console.log(`🔄 [COMMUNITY DETAIL] Dando like - Feed ID: ${item.value.id}, Original ID: ${item.value.original_id}`);
    
    // Usar toggleLike del feedStore
    const response = await feedStore.toggleLike(item.value.id);
    
    // Actualizar el item local con la respuesta del servidor
    item.value = {
      ...item.value,
      is_liked: response.liked,
      likes_count: response.likes_count
    };
    
    console.log(`✅ [COMMUNITY DETAIL] Like procesado exitosamente: liked=${response.liked}, count=${response.likes_count}`);
    
  } catch (error: any) {
    console.log(`❌ [COMMUNITY DETAIL] Error al dar/quitar like:`, error);
    
    // Si el error es por token expirado, ya se manejó en el service
    if (error.message?.includes('sesión ha expirado')) {
      return; // Ya se manejó en el service
    }
  }
};

const handleImageError = () => {
  console.warn('Error loading image:', {
    originalUrl: item.value?.image_url,
    processedUrl: imageUrl.value,
    itemId: item.value?.id,
    itemType: item.value?.type
  });
  imageError.value = true;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'Sin fecha';
  
  try {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  } catch (e) {
    return dateString; // Fallback
  }
};

function displayDescription(description: string): string {
  // Convertir saltos de línea a <br> para formato HTML
  return description.replace(/\n/g, '<br />');
}

const goBack = () => {
  // Verificar si hay información de la pestaña en los query parameters
  const fromTab = route.query.from_tab as string;
  
  if (fromTab && ['todo', 'noticias', 'comunidad'].includes(fromTab)) {
    // Regresar con la pestaña preservada
    console.log(`🔙 [COMMUNITY DETAIL] Regresando al feed con pestaña: ${fromTab}`);
    router.push({
      path: '/',
      query: { tab: fromTab }
    });
  } else {
    // Regresar al feed sin pestaña específica
    console.log(`🔙 [COMMUNITY DETAIL] Regresando al feed sin pestaña específica`);
    router.push('/');
  }
};

// Lifecycle
onMounted(() => {
  loadItem();
});
</script>

<style scoped>
.community-detail-container {
  padding-top: 80px; /* Ajuste por header fijo */
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

.official-badge {
  background: linear-gradient(135deg, #ffc107, #e0a800);
  color: #212529;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.3);
}

/* Estilos para .prose si Tailwind Typography no se aplica como se espera */
.prose :where(p):where(:not([class~="not-prose"])):where(:not([class~="not-prose"] *)) {
    margin-top: 1em;
    margin-bottom: 1em;
}

/* Dark mode adicional */
@media (prefers-color-scheme: dark) {
  .community-detail {
    background: #1a1a1a;
    color: #e0e0e0;
  }
}
</style> 