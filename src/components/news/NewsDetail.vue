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
                  :class="likedLocally ? 
                    'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700' : 
                    'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
            {{ localLikesCount }} {{ localLikesCount === 1 ? 'Me gusta' : 'Me gustas' }}
          </button>
          <!-- Enlace a comentarios ya está abajo con el id="comments" -->
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
import { useRoute } from 'vue-router';
import { useNewsStore } from '@/store/news';
import type { News, Comment } from '@/types/api';
import CommentSection from './CommentSection.vue';
// import { useAuthStore } from '@/store/auth';

// Para convertir Markdown a HTML (si la descripción es Markdown)
// import { marked } from 'marked'; // Necesitarías instalar marked: npm install marked @types/marked

const props = defineProps<{
  id: string | number; // Viene de la ruta como string
}>();

const route = useRoute();
const newsStore = useNewsStore();
// const authStore = useAuthStore();

const noticia = computed<News | null>(() => newsStore.currentNewsItem);
const isLoading = computed<boolean>(() => newsStore.isLoading);
const error = computed<string | null>(() => newsStore.error);
// Filtra los comentarios para solo mostrar los de esta noticia
const commentsForThisNews = computed<Comment[]>(() => newsStore.comments.filter(comment => comment.news_id === Number(props.id)));

const likedLocally = ref(false); // Placeholder
const localLikesCount = ref(0);

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
  await newsStore.fetchNoticia(numericId);
  if (newsStore.currentNewsItem) {
    localLikesCount.value = newsStore.currentNewsItem.likes_count || 0;
    // TODO: Verificar si el usuario actual (si está logueado) ya le dio like a esta noticia.
    // Ejemplo: likedLocally.value = authStore.userHasLiked(numericId);
  } else if (!newsStore.isLoading) {
    // Si no está cargando y no hay noticia, es probable que no exista
    newsStore.$patch({ error: 'Noticia no encontrada.' });
  }
}

async function handleLike() {
  if (!noticia.value) return;
  // if (!authStore.isAuthenticated) {
  //   alert('Debes iniciar sesión para dar Me Gusta.');
  //   return;
  // }
  const newsId = noticia.value.id;

  if (likedLocally.value) {
    localLikesCount.value--;
    likedLocally.value = false;
    try {
      await newsStore.quitarLike(newsId);
    } catch (err) {
      localLikesCount.value++; // Revertir en caso de error
      likedLocally.value = true;
      console.error('Error al quitar like:', err);
      // Podrías mostrar una notificación al usuario
    }
  } else {
    localLikesCount.value++;
    likedLocally.value = true;
    try {
      await newsStore.darLike(newsId);
    } catch (err) {
      localLikesCount.value--; // Revertir en caso de error
      likedLocally.value = false;
      console.error('Error al dar like:', err);
      // Podrías mostrar una notificación al usuario
    }
  }
}

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