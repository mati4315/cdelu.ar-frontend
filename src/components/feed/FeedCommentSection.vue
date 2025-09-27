<template>
  <div id="comments-section" class="comments-section mt-6">
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
        <div class="flex items-start space-x-3">
          <!-- Avatar del usuario -->
          <UserAvatar 
            :user="comment.user || { id: comment.user_id, nombre: comment.autor, email: '', rol: 'usuario' }"
            :size="32"
            :clickable="false"
          />
          
          <!-- Contenido del comentario -->
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start">
              <p class="font-semibold text-gray-800 dark:text-gray-100 truncate">
                {{ comment.autor }}
              </p>
              <span class="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                {{ formatDate(comment.created_at) }}
              </span>
            </div>
            <p class="text-gray-700 dark:text-gray-300 mt-1 break-words">
              {{ comment.content }}
            </p>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useFeedStore } from '@/store/feedStore';
import { useAuthStore } from '@/store/auth';
import type { Comment, User } from '@/types/api';
import UserAvatar from '@/components/ui/UserAvatar.vue';

interface Props {
  feedId: number | string;
}

const props = defineProps<Props>();

const feedStore = useFeedStore();
const authStore = useAuthStore();

const newCommentText = ref('');
const isSubmittingComment = ref(false);
const commentError = ref<string | null>(null);
const isLoadingComments = ref(false);
const commentsError = ref<string | null>(null);
const comments = ref<Comment[]>([]);

async function loadComments() {
  console.log(`💬 [FEED COMMENTS] Cargando comentarios para feedId: ${props.feedId}`);
  
  try {
    isLoadingComments.value = true;
    commentsError.value = null;
    
    // Usar el método del feedStore para obtener comentarios
    const feedItem = feedStore.allContent.find(item => item.id === Number(props.feedId));
    if (!feedItem) {
      console.warn(`⚠️ [FEED COMMENTS] No se encontró item con feedId: ${props.feedId}`);
      comments.value = [];
      return;
    }
    
    const result = await feedStore.getComments(feedItem);
    comments.value = result || [];
    
    console.log(`✅ [FEED COMMENTS] Comentarios cargados: ${comments.value.length}`);
    
  } catch (error: any) {
    console.error('❌ [FEED COMMENTS] Error cargando comentarios:', error);
    commentsError.value = error.message || 'Error al cargar comentarios';
  } finally {
    isLoadingComments.value = false;
  }
}

async function handlePostComment() {
  if (newCommentText.value.trim() === '' || !authStore.isAuthenticated) return;
  
  console.log(`💬 [FEED COMMENTS] Creando comentario para feedId: ${props.feedId}`);
  
  try {
    isSubmittingComment.value = true;
    commentError.value = null;
    
    const feedItem = feedStore.allContent.find(item => item.id === Number(props.feedId));
    if (!feedItem) {
      throw new Error('No se encontró el post');
    }
    
    await feedStore.createComment(feedItem, newCommentText.value);
    
    // Limpiar el formulario
    newCommentText.value = '';
    
    // Recargar comentarios
    await loadComments();
    
    console.log(`✅ [FEED COMMENTS] Comentario creado exitosamente`);
    
  } catch (error: any) {
    console.error('❌ [FEED COMMENTS] Error creando comentario:', error);
    commentError.value = error.message || 'Error al enviar el comentario';
  } finally {
    isSubmittingComment.value = false;
  }
}

function formatDate(dateString: string): string {
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
}

// Cargar comentarios al montar el componente
onMounted(() => {
  loadComments();
});

// Recargar comentarios si cambia el feedId
watch(() => props.feedId, () => {
  loadComments();
});
</script>

<style scoped>
.comments-section {
  /* Estilos heredados del CommentSection original */
}

.comment-item {
  /* Estilos específicos para items de comentario */
}
</style>
