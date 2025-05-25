<template>
  <div class="comments-section mt-6">
    <!-- Formulario para nuevo comentario -->
    <form v-if="authStore.isAuthenticated" @submit.prevent="handlePostComment" class="mb-6">
      <textarea 
        v-model="newCommentText"
        placeholder="Escribe tu comentario..."
        class="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors duration-300"
        rows="3"
        required
      ></textarea>
      <div class="flex justify-end mt-2">
        <button 
          type="submit"
          :disabled="isSubmittingComment || newCommentText.trim() === ''"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md disabled:bg-gray-400 dark:disabled:bg-gray-500 transition-colors"
        >
          {{ isSubmittingComment ? 'Enviando...' : 'Publicar Comentario' }}
        </button>
      </div>
      <p v-if="commentError" class="text-red-500 dark:text-red-400 text-sm mt-2">{{ commentError }}</p>
    </form>
    <div v-else class="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-md text-center">
      <p class="text-gray-700 dark:text-gray-300">Debes <router-link to="/login" class="text-blue-600 dark:text-blue-400 hover:underline">iniciar sesión</router-link> para comentar.</p>
    </div>

    <!-- Lista de comentarios -->
    <div v-if="isLoadingComments" class="text-center">
      <p class="text-gray-600 dark:text-gray-300">Cargando comentarios...</p>
    </div>
    <div v-else-if="commentsError && comments.length === 0" class="text-center text-red-500 dark:text-red-400">
      <p>{{ commentsError }}</p>
    </div>
    <div v-else-if="comments.length === 0 && !isLoadingComments" class="text-center text-gray-500 dark:text-gray-400">
      <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
    </div>
    <ul v-else class="space-y-4">
      <li v-for="comment in comments" :key="comment.id" class="comment-item bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md shadow dark:shadow-gray-900/50 transition-colors duration-300">
        <div class="flex justify-between items-start">
          <p class="font-semibold text-gray-800 dark:text-gray-100">{{ comment.autor }}</p>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(comment.created_at) }}</span>
        </div>
        <p class="text-gray-700 dark:text-gray-300 mt-1">{{ comment.content }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useNewsStore } from '@/store/news';
import { useAuthStore } from '@/store/auth';
import type { Comment } from '@/types/api';

const props = defineProps<{
  noticiaId: number | string;
}>();

const newsStore = useNewsStore();
const authStore = useAuthStore();

const newCommentText = ref('');
const isSubmittingComment = ref(false);
const commentError = ref<string | null>(null);

// Usamos el estado isLoading y error del store, pero podríamos tener unos locales para más granularidad
const isLoadingComments = computed(() => newsStore.isLoading); // Asume que isLoading en newsStore cubre comentarios
const commentsError = computed(() => newsStore.error); // Asume que error en newsStore cubre comentarios

// Filtra los comentarios del store para esta noticia específica
const comments = computed<Comment[]>(() => 
  newsStore.comments.filter(comment => comment.news_id === Number(props.noticiaId))
);

async function loadComments() {
  await newsStore.fetchComentarios(props.noticiaId);
}

async function handlePostComment() {
  if (newCommentText.value.trim() === '' || !authStore.isAuthenticated) return;

  isSubmittingComment.value = true;
  commentError.value = null;
  try {
    await newsStore.crearComentario(props.noticiaId, { content: newCommentText.value });
    newCommentText.value = ''; // Limpiar el campo
    // Los comentarios se recargan automáticamente en la acción del store `crearComentario`
  } catch (e: any) {
    commentError.value = e.message || 'Error al publicar el comentario.';
  } finally {
    isSubmittingComment.value = false;
  }
}

function formatDate(dateString: string): string {
  try {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  } catch (e) {
    return dateString; // Fallback
  }
}

// Cargar comentarios cuando el componente se monta o cambia el noticiaId
watch(() => props.noticiaId, loadComments, { immediate: true });

</script>

<style scoped>
.comment-item:not(:last-child) {
  margin-bottom: 1rem;
}
</style> 