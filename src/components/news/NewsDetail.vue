<template>
  <div class="news-detail-container py-8 px-4">
    <div v-if="isLoading && !noticia" class="text-center py-10">
      <p class="text-lg text-gray-600 dark:text-gray-300">Cargando detalle de la noticia...</p>
      <!-- Aquí podrías poner un spinner más elaborado -->
    </div>
    <div v-else-if="error && !noticia" class="text-center py-10 text-red-500 dark:text-red-400">
      <p>Error al cargar la noticia: {{ error }}</p>
    </div>
    <article v-else-if="noticia" class="news-detail-card overflow-hidden max-w-4xl mx-auto transition-colors duration-300">
      <img v-if="noticia.image_url" :src="noticia.image_url" :alt="`Imagen de ${noticia.titulo}`" class="w-full h-auto object-cover max-h-[500px]">
      <div class="p-6 md:p-8">
        <h1 class="news-title mb-4">{{ noticia.titulo }}</h1>
        <div class="news-meta mb-6">
          <span>Por: <strong class="author">{{ noticia.autor }}</strong></span>
          <span class="separator" aria-hidden="true">•</span>
          <span>{{ formatDate(noticia.created_at) }}</span>
        </div>
        <div class="news-content prose prose-lg dark:prose-invert max-w-none mb-8" v-html="displayDescription(noticia.descripcion)"></div>
        
        <div class="flex items-center mb-8">
          <button @click="handleLike" 
                  class="btn-like mr-4 flex items-center py-2 px-4 rounded-md transition-colors duration-150 ease-in-out"
                  :class="{
                    'liked': likedLocally,
                    'unliked': !likedLocally
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
        <div class="border-t border-muted pt-6 mb-6">
          <button @click="goBack" class="btn-ghost inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Volver al feed
          </button>
        </div>

        <div class="border-t border-muted pt-6">
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
  return liked;
});
const localLikesCount = computed(() => feedItem.value?.likes_count || 0);

function displayDescription(description: string): string {
  return description.replace(/\n/g, '<br />');
}

async function fetchData() {
  const numericId = Number(props.id);
  if (isNaN(numericId)) {
    newsStore.$patch({ error: 'ID de noticia inválido', currentNewsItem: null });
    return;
  }
  await newsStore.fetchNoticia(numericId);
  if (newsStore.currentNewsItem) {
    try {
      const foundFeedItem = await feedStore.getPostByOriginalId(1, numericId);
      feedItem.value = foundFeedItem || { id: null, is_liked: false, likes_count: newsStore.currentNewsItem.likes_count || 0 };
    } catch (error) {
      feedItem.value = { id: null, is_liked: false, likes_count: newsStore.currentNewsItem.likes_count || 0 };
    }
  } else if (!newsStore.isLoading) {
    newsStore.$patch({ error: 'Noticia no encontrada.' });
  }
}

const handleLike = async () => {
  if (!isAuthenticated.value || !ensureValidToken()) return;
  if (!feedItem.value?.id) return;
  try {
    const response = await feedStore.toggleLike(feedItem.value.id);
    feedItem.value = { ...feedItem.value, is_liked: response.liked, likes_count: response.likes_count };
  } catch {}
};

function formatDate(dateString: string): string {
  try {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  } catch (e) {
    return dateString; // Fallback
  }
}

watch(() => props.id, fetchData, { immediate: true });

onMounted(() => {
  if (route.hash === '#comments') {
    setTimeout(() => {
      const commentsElement = document.getElementById('comments');
      commentsElement?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }
});

const goBack = () => {
  const fromTab = route.query.from_tab as string;
  if (fromTab && ['todo', 'noticias', 'comunidad'].includes(fromTab)) {
    router.push({ path: '/', query: { tab: fromTab } });
  } else {
    router.push({ path: '/', query: { tab: 'noticias' } });
  }
};
</script>

<style scoped>
.news-detail-container {
  padding-top: 80px; /* Ajuste por header fijo. */
}

/* Tarjeta principal con variables de tema */
.news-detail-card {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
}
html.dark .news-detail-card {
  box-shadow: 0 16px 40px rgba(0,0,0,0.35);
}

.news-title {
  font-size: clamp(1.75rem, 2vw + 1rem, 2.5rem);
  font-weight: 800;
  line-height: 1.2;
  color: var(--text);
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  color: var(--muted);
}
.news-meta .author { color: var(--text); }
.news-meta .separator { opacity: 0.4; }

.news-content {
  color: var(--text);
}
.news-content :where(p) {
  line-height: 1.8;
  margin: 1em 0;
}
.news-content :where(a) { color: var(--accent); text-decoration: underline; }

/* Botones */
.btn-like.unliked { background: var(--surface-2); color: var(--text); border: 1px solid var(--border); }
.btn-like.liked { background: #ef4444; color: #fff; }

.btn-ghost {
  color: var(--accent);
  background: transparent;
  border: 1px solid transparent;
  padding: 8px 12px;
  border-radius: 10px;
}
.btn-ghost:hover { background: var(--surface-2); border-color: var(--border); }

/* Borde utilitario alineado con variables */
.border-muted { border-color: var(--border); }

/* Ajustes de tipografía si no aplica Typography plugin */
.prose :where(p):where(:not([class~="not-prose"])):where(:not([class~="not-prose"] *)) {
  margin-top: 1em;
  margin-bottom: 1em;
}
</style>