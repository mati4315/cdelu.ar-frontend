<template>
  <div class="news-detail-container py-8 px-4">
    <div v-if="isLoading && !noticia" class="text-center py-10">
      <p class="text-lg text-gray-600 dark:text-gray-300">Cargando detalle de la noticia...</p>
      <!-- Aquí podrías poner un spinner más elaborado -->
    </div>
    <div v-else-if="error && !noticia" class="text-center py-10 text-red-500 dark:text-red-400">
      <p>Error al cargar la noticia: {{ error }}</p>
    </div>
    <article v-else-if="noticia" class="news-detail bg-white dark:bg-gray-800 shadow-xl dark:shadow-gray-700/50 rounded-lg overflow-hidden max-w-4xl mx-auto transition-colors duration-300">
      <img v-if="noticia.image_url" :src="noticia.image_url" :alt="`Imagen de ${noticia.titulo}`" class="w-full h-auto object-cover max-h-[500px]">
      <div class="p-6 md:p-8">
        <h1 class="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">{{ noticia.titulo }}</h1>
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
          <span class="mb-2 sm:mb-0">Por: <strong class="text-gray-700 dark:text-gray-200">{{ noticia.autor }}</strong></span>
          <span>{{ formatDate(noticia.created_at) }}</span>
        </div>
        <div class="prose prose-lg dark:prose-invert max-w-none mb-8 text-gray-700 dark:text-gray-300" v-html="displayDescription(noticia.descripcion)"></div>
        
        <div class="flex items-center mb-8">
          <button @click="handleLike" 
                  class="mr-4 flex items-center py-2 px-4 rounded-md transition-colors duration-150 ease-in-out"
                  :class="{
                    'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700': likedLocally,
                    'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600': !likedLocally
                  }">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
            <span class="font-medium">
              {{ localLikesCount }} {{ localLikesCount === 1 ? 'Me gusta' : 'Me gustas' }}
            </span>
          </button>
        </div>

        <!-- Botón volver -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
          <button @click="goBack" class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Volver al feed
          </button>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 class="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100" id="comments">Comentarios ({{ commentsForThisNews.length }})</h3>
          <CommentSection :noticia-id="noticia.id" />
        </div>
      </div>
    </article>
    <div v-else class="text-center py-10">
      <p class="text-lg text-gray-600 dark:text-gray-300">No se encontró la noticia.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNewsStore } from '@/store/news';
import { useFeedStore } from '@/store/feedStore';
import { useAuth } from '@/composables/useAuth';
import { useTokenValidation } from '@/composables/useTokenValidation';
import type { News, Comment } from '@/types/api';
import type { FeedType } from '@/types/feed';
import CommentSection from './CommentSection.vue';

const props = defineProps<{
  id: string | number; // Viene de la ruta como string
}>();

const route = useRoute();
const router = useRouter();
const newsStore = useNewsStore();
const feedStore = useFeedStore();
const auth = useAuth();
const { isAuthenticated } = useAuth();
const { ensureValidToken } = useTokenValidation();

const noticia = computed<News | null>(() => newsStore.currentNewsItem);
const isLoading = computed<boolean>(() => newsStore.isLoading);
const error = computed<string | null>(() => newsStore.error);
// Filtra los comentarios para solo mostrar los de esta noticia
const commentsForThisNews = computed<Comment[]>(() => newsStore.comments.filter(comment => comment.news_id === Number(props.id)));

// Estado del like - obtener del feed store
const feedItem = ref<any>(null);
const likedLocally = computed(() => {
  const liked = feedItem.value?.is_liked || false;
  console.log(`🎨 [NEWS DETAIL] likedLocally computed - feedItem exists: ${!!feedItem.value}, is_liked: ${feedItem.value?.is_liked}, result: ${liked}`);
  
  // Debug adicional para ver el objeto completo si hay problemas
  if (feedItem.value && typeof feedItem.value.is_liked !== 'boolean') {
    console.warn(`⚠️ [NEWS DETAIL] is_liked no es boolean:`, typeof feedItem.value.is_liked, feedItem.value.is_liked);
  }
  
  return liked;
});
const localLikesCount = computed(() => {
  const count = feedItem.value?.likes_count || 0;
  console.log(`🔢 [NEWS DETAIL] localLikesCount computed - count: ${count}`);
  return count;
});

function displayDescription(description: string): string {
  // Aquí podrías implementar una lógica más sofisticada si el contenido es HTML o Markdown
  // Por seguridad, si es HTML del usuario, necesitarías sanitizarlo.
  // Si es Markdown, puedes usar una librería como 'marked'.
  // Por ahora, reemplazamos saltos de línea por <br> para un formato simple.
  return description.replace(/\n/g, '<br />');
}

async function fetchData() {
  const numericId = Number(props.id);
  if (isNaN(numericId)) {
    newsStore.$patch({ error: 'ID de noticia inválido', currentNewsItem: null });
    return;
  }
  
  // Cargar la noticia básica
  await newsStore.fetchNoticia(numericId);
  
  if (newsStore.currentNewsItem) {
    console.log(`📊 [NEWS DETAIL] Noticia cargada - ID: ${numericId}`);
    
    // Buscar el item en el feed para obtener el estado real del like
    try {
      const foundFeedItem = await feedStore.getPostByOriginalId(1, numericId);
      if (foundFeedItem) {
        feedItem.value = foundFeedItem;
        console.log(`✅ [NEWS DETAIL] Estado del like cargado - feedId: ${foundFeedItem.id}, isLiked: ${foundFeedItem.is_liked}, likes: ${foundFeedItem.likes_count}`);
      } else {
        console.log(`⚠️ [NEWS DETAIL] Noticia no encontrada en feed, creando estado por defecto`);
        feedItem.value = {
          id: null,
          is_liked: false,
          likes_count: newsStore.currentNewsItem.likes_count || 0
        };
      }
    } catch (error) {
      console.log(`❌ [NEWS DETAIL] Error al buscar en feed:`, error);
      // Usar estado por defecto si hay error
      feedItem.value = {
        id: null,
        is_liked: false,
        likes_count: newsStore.currentNewsItem.likes_count || 0
      };
    }
  } else if (!newsStore.isLoading) {
    // Si no está cargando y no hay noticia, es probable que no exista
    newsStore.$patch({ error: 'Noticia no encontrada.' });
  }
}

const handleLike = async () => {
  console.log(`❤️ [NEWS DETAIL] Intentando like en noticia ID: ${noticia.value?.id}`);
  
  // Verificar autenticación y token válido
  if (!isAuthenticated.value) {
    console.log('❌ [NEWS DETAIL] Usuario no autenticado');
    return;
  }

  if (!ensureValidToken()) {
    console.log('❌ [NEWS DETAIL] Token inválido o expirado');
    return;
  }

  if (!feedItem.value?.id) {
    console.log(`❌ [NEWS DETAIL] No se encontró el item en el feed`);
    return;
  }

  try {
    console.log(`🔄 [NEWS DETAIL] Dando like - Feed ID: ${feedItem.value.id}, Original ID: ${noticia.value!.id}`);
    
    // Usar toggleLike del feedStore
    const response = await feedStore.toggleLike(feedItem.value.id);
    
    // Actualizar el feedItem con la respuesta del servidor
    feedItem.value = {
      ...feedItem.value,
      is_liked: response.liked,
      likes_count: response.likes_count
    };
    
    console.log(`✅ [NEWS DETAIL] Like procesado exitosamente: liked=${response.liked}, count=${response.likes_count}`);
    
  } catch (error: any) {
    console.log(`❌ [NEWS DETAIL] Error al dar/quitar like:`, error);
    
    // Si el error es por token expirado, ya se manejó en el service
    if (error.message?.includes('sesión ha expirado')) {
      return; // Ya se manejó en el service
    }
  }
};

function formatDate(dateString: string): string {
  try {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  } catch (e) {
    return dateString; // Fallback
  }
}

// Observa cambios en el ID de la ruta y recarga los datos
watch(() => props.id, fetchData, { immediate: true });

onMounted(() => {
  // El watcher con immediate:true ya llama a fetchData.
  // Scroll a la sección de comentarios si está en el hash.
  if (route.hash === '#comments') {
    // Usar nextTick o setTimeout para asegurar que el elemento existe
    setTimeout(() => {
      const commentsElement = document.getElementById('comments');
      commentsElement?.scrollIntoView({ behavior: 'smooth' });
    }, 300); // Un pequeño delay
  }
});

const goBack = () => {
  // Verificar si hay información de la pestaña en los query parameters
  const fromTab = route.query.from_tab as string;
  
  if (fromTab && ['todo', 'noticias', 'comunidad'].includes(fromTab)) {
    // Regresar con la pestaña preservada
    console.log(`🔙 [NEWS DETAIL] Regresando al feed con pestaña: ${fromTab}`);
    router.push({
      path: '/',
      query: { tab: fromTab }
    });
  } else {
    // Regresar al feed sin pestaña específica (por defecto 'noticias' para noticias)
    console.log(`🔙 [NEWS DETAIL] Regresando al feed con pestaña por defecto: noticias`);
    router.push({
      path: '/',
      query: { tab: 'noticias' }
    });
  }
};

</script>

<style scoped>
.news-detail-container {
  padding-top: 80px; /* Ajuste por header fijo. Debería ser una variable o prop si el header cambia de altura */
}
/* Estilos para .prose si Tailwind Typography no se aplica como se espera o necesitas overrides */
.prose :where(p):where(:not([class~="not-prose"])):where(:not([class~="not-prose"] *)) {
    margin-top: 1em;
    margin-bottom: 1em;
}
</style>