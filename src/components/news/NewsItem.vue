<template>
  <article class="news-item bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-700/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <div class="p-4 sm:p-6">
      <!-- Título de la noticia -->
      <h2 class="text-xl sm:text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
        <router-link :to="{ name: 'NewsDetail', params: { id: noticia.id } }">
          {{ noticia.titulo }}
        </router-link>
      </h2>
      
      <!-- Imagen de la noticia -->
      <div v-if="noticia.image_url" class="mb-4 overflow-hidden rounded-lg">
        <img 
          :src="noticia.image_url" 
          :alt="`Imagen de ${noticia.titulo}`" 
          class="w-full h-48 sm:h-64 object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        >
      </div>
      
      <!-- Contenido de la noticia -->
      <div class="prose dark:prose-invert max-w-none mb-4 text-gray-700 dark:text-gray-300">
        <p v-if="mostrarCompleta || noticia.descripcion.length <= MAX_CHARS_SUMMARY" 
           class="text-sm sm:text-base leading-relaxed">
          {{ noticia.descripcion }}
        </p>
        <p v-else class="text-sm sm:text-base leading-relaxed">
          {{ truncarDescripcion(noticia.descripcion) }}
        </p>
      </div>
      
      <!-- Botón leer más/menos -->
      <div v-if="noticia.descripcion.length > MAX_CHARS_SUMMARY" class="mb-4">
        <button 
          @click="toggleMostrarCompleta"
          class="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 py-1"
        >
          {{ mostrarCompleta ? 'Mostrar menos' : 'Leer más' }}
        </button>
      </div>

      <!-- Metadatos y acciones -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <!-- Acciones de interacción -->
        <div class="flex items-center gap-4">
          <!-- Botón de like -->
          <button 
            @click="handleLike" 
            class="flex items-center gap-1 hover:text-red-500 dark:hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded p-1"
            :class="{ 'text-red-500 dark:text-red-400': likedLocally, 'text-gray-600 dark:text-gray-400': !likedLocally }"
            :title="likedLocally ? 'Quitar me gusta' : 'Me gusta'"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path v-if="likedLocally" fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
              <path v-else fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" stroke="currentColor" fill="none" stroke-width="2" />
            </svg>
            <span class="text-sm font-medium">{{ localLikesCount }}</span>
          </button>
          
          <!-- Enlace a comentarios -->
          <router-link 
            :to="{ name: 'NewsDetail', params: { id: noticia.id }, hash: '#comments' }" 
            class="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded p-1"
            :title="'Ver comentarios'"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span class="text-sm font-medium">{{ noticia.comments_count || 0 }}</span>
          </router-link>
          
          <!-- Indicador oficial -->
          <span v-if="noticia.is_oficial" 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            Oficial
          </span>
        </div>
        
        <!-- Fecha y autor -->
        <div class="flex flex-col sm:items-end text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <span class="font-medium">{{ noticia.autor }}</span>
          <span>{{ formatDate(noticia.created_at) }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { News } from '@/types/api';
import { useNewsStore } from '@/store/news';
// import { useAuthStore } from '@/store/auth';

const props = defineProps<{
  noticia: News;
}>();

const newsStore = useNewsStore();
// const authStore = useAuthStore();

const MAX_CHARS_SUMMARY = 200; // Aumentado para mejor UX móvil
const mostrarCompleta = ref(false);

const likedLocally = ref(false);
const localLikesCount = ref(props.noticia.likes_count || 0);

function truncarDescripcion(texto: string): string {
  if (texto.length <= MAX_CHARS_SUMMARY) {
    return texto;
  }
  return texto.substring(0, MAX_CHARS_SUMMARY) + '...';
}

function toggleMostrarCompleta(): void {
  mostrarCompleta.value = !mostrarCompleta.value;
}

async function handleLike() {
  // TODO: Verificar autenticación cuando esté implementada
  // if (!authStore.isAuthenticated) {
  //   alert('Debes iniciar sesión para dar Me Gusta.');
  //   return;
  // }

  const wasLiked = likedLocally.value;
  const originalCount = localLikesCount.value;

  try {
    if (likedLocally.value) {
      // Optimistic update
      localLikesCount.value--;
      likedLocally.value = false;
      await newsStore.quitarLike(props.noticia.id);
    } else {
      // Optimistic update
      localLikesCount.value++;
      likedLocally.value = true;
      await newsStore.darLike(props.noticia.id);
    }
  } catch (error) {
    // Revertir cambios en caso de error
    localLikesCount.value = originalCount;
    likedLocally.value = wasLiked;
    console.error('Error al manejar like:', error);
    // TODO: Mostrar notificación de error al usuario
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      };
      return date.toLocaleDateString('es-ES', options);
    }
  } catch (e) {
    return dateString;
  }
}

onMounted(() => {
  // TODO: Verificar si el usuario ya dio like a esta noticia
  // Esta información debería venir del backend o del store de autenticación
  likedLocally.value = false;
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prose p {
  margin-bottom: 1em;
}

/* Animación suave para el hover effect */
.news-item {
  will-change: transform, box-shadow;
}
</style> 