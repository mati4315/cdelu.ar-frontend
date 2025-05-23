<template>
  <article class="news-item bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-700/50 rounded-lg overflow-hidden transition-colors duration-300">
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
        <router-link :to="{ name: 'NewsDetail', params: { id: noticia.id } }">
          {{ noticia.titulo }}
        </router-link>
      </h2>
      <img v-if="noticia.image_url" :src="noticia.image_url" :alt="`Imagen de ${noticia.titulo}`" class="w-full h-auto object-cover mb-4 rounded max-h-96">
      <div class="prose dark:prose-invert max-w-none mb-4 text-gray-700 dark:text-gray-300">
        <p v-if="mostrarCompleta || noticia.descripcion.length <= MAX_CHARS_SUMMARY">
          {{ noticia.descripcion }}
        </p>
        <p v-else>
          {{ truncarDescripcion(noticia.descripcion) }}
        </p>
      </div>
      
      <button 
        v-if="noticia.descripcion.length > MAX_CHARS_SUMMARY && !mostrarCompleta"
        @click="toggleMostrarCompleta"
        class="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold mb-4 transition-colors">
        Leer más
      </button>
      <button 
        v-if="noticia.descripcion.length > MAX_CHARS_SUMMARY && mostrarCompleta"
        @click="toggleMostrarCompleta"
        class="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold mb-4 transition-colors">
        Mostrar menos
      </button>

      <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div class="flex items-center">
          <button @click="handleLike" class="mr-3 flex items-center hover:text-red-500 dark:hover:text-red-400 transition-colors" :class="{ 'text-red-500 dark:text-red-400': likedLocally }">
            <span class="mr-1 text-xl">{{ likedLocally ? '♥' : '♡' }}</span> 
            {{ localLikesCount }}
          </button>
          <router-link :to="{ name: 'NewsDetail', params: { id: noticia.id }, hash: '#comments' }" class="flex items-center hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd" />
            </svg>
            {{ noticia.comments_count || 0 }}
          </router-link>
        </div>
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(noticia.created_at) }}</span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { News } from '@/types/api';
import { useNewsStore } from '@/store/news';
// import { useAuthStore } from '@/store/auth';

const props = defineProps<{
  noticia: News;
}>();

const newsStore = useNewsStore();
// const authStore = useAuthStore();

const MAX_CHARS_SUMMARY = 150;
const mostrarCompleta = ref(false);

const likedLocally = ref(false); // Placeholder: Debería obtenerse del estado de usuario/noticia
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
  // if (!authStore.isAuthenticated) {
  //   alert('Debes iniciar sesión para dar Me Gusta.');
  //   return;
  // }

  if (likedLocally.value) {
    localLikesCount.value--;
    likedLocally.value = false;
    try {
      await newsStore.quitarLike(props.noticia.id);
    } catch (error) {
      localLikesCount.value++; // Revertir
      likedLocally.value = true;
      console.error('Error al quitar like:', error);
    }
  } else {
    localLikesCount.value++;
    likedLocally.value = true;
    try {
      await newsStore.darLike(props.noticia.id);
    } catch (error) {
      localLikesCount.value--; // Revertir
      likedLocally.value = false;
      console.error('Error al dar like:', error);
    }
  }
}

function formatDate(dateString: string): string {
  try {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  } catch (e) {
    return dateString; // Fallback por si la fecha no es válida
  }
}
</script>

<style scoped>
/* La clase prose-invert de Tailwind Typography maneja bien los estilos de texto en modo oscuro */
.prose p {
  margin-bottom: 1em;
}
</style> 