<template>
  <div class="user-posts-tab bg-surface rounded-lg">
    <!-- Header con botón crear post -->
    <div v-if="profileStore.canEditPosts" class="flex justify-between items-center p-4 border-b" style="border-color: var(--border)">
      <h3 class="text-lg font-semibold" style="color: var(--text)">
        Mis Publicaciones
      </h3>
      <button 
        @click="showCreateModal = true"
        class="bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        <span>Crear Post</span>
      </button>
    </div>

    <!-- Estado de carga inicial -->
    <div v-if="profileStore.isLoading && !profileStore.hasContent" class="p-8">
      <div class="space-y-4">
        <div v-for="i in 3" :key="i" class="animate-pulse">
          <div class="bg-surface-2 rounded-lg p-4 space-y-3" style="background-color: var(--surface-2)">
            <div class="h-4 bg-muted rounded w-3/4" style="background-color: var(--muted)"></div>
            <div class="h-4 bg-muted rounded w-1/2" style="background-color: var(--muted)"></div>
            <div class="h-32 bg-muted rounded" style="background-color: var(--muted)"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else-if="!profileStore.hasContent && !profileStore.isLoading" class="p-8 text-center">
      <div class="max-w-sm mx-auto">
        <div class="mb-4">
          <svg class="w-16 h-16 mx-auto opacity-50" style="color: var(--muted)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium mb-2" style="color: var(--text)">
          {{ profileStore.canEditPosts ? 'Aún no tienes publicaciones' : 'Sin publicaciones' }}
        </h3>
        <p class="text-sm mb-4" style="color: var(--muted)">
          {{ profileStore.canEditPosts 
            ? 'Crea tu primera publicación para compartir con la comunidad.' 
            : 'Este usuario no ha publicado contenido aún.' 
          }}
        </p>
        <button 
          v-if="profileStore.canEditPosts"
          @click="showCreateModal = true"
          class="bg-accent text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Crear Mi Primera Publicación
        </button>
      </div>
    </div>

    <!-- Lista de posts -->
    <div v-else class="divide-y" style="border-color: var(--border)">
      <UserPostItem
        v-for="post in profileStore.currentPosts"
        :key="post.id"
        :post="post"
        :can-edit="profileStore.canEditPosts"
        @edit="handleEditPost"
        @delete="handleDeletePost"
        class="post-item"
      />

      <!-- Botón cargar más -->
      <div v-if="profileStore.isReadyForInfiniteScroll" class="p-4 text-center">
        <button 
          @click="loadMore"
          :disabled="profileStore.isLoadingMore"
          class="bg-surface-2 text-primary px-6 py-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
          style="background-color: var(--surface-2); color: var(--text)"
        >
          <span v-if="!profileStore.isLoadingMore">Cargar Más</span>
          <span v-else class="flex items-center space-x-2">
            <LoadingSpinner size="sm" />
            <span>Cargando...</span>
          </span>
        </button>
      </div>

      <!-- Indicador de fin de contenido -->
      <div v-else-if="profileStore.hasContent && !profileStore.currentPagination.hasMore" class="p-4 text-center">
        <p class="text-sm" style="color: var(--muted)">
          Has visto todas las publicaciones
        </p>
      </div>
    </div>

    <!-- Modal crear post -->
    <CreatePostModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handlePostCreated"
    />

    <!-- Modal editar post -->
    <EditPostModal
      v-if="editingPost"
      :post="editingPost"
      @close="editingPost = null"
      @updated="handlePostUpdated"
    />

    <!-- Modal confirmar eliminar -->
    <ConfirmDeleteModal
      v-if="deletingPost"
      :post="deletingPost"
      @close="deletingPost = null"
      @confirmed="handleDeleteConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useProfileStore } from '@/store/profileStore'
import { useAuthStore } from '@/store/auth'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import type { UserPost } from '@/types/api'

// Componentes
import UserPostItem from './UserPostItem.vue'
import CreatePostModal from './CreatePostModal.vue'
import EditPostModal from './EditPostModal.vue'
import ConfirmDeleteModal from './ConfirmDeleteModal.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

// Props
interface Props {
  userId?: number // Si se proporciona, muestra posts de ese usuario
}

const props = defineProps<Props>()

// Stores
const profileStore = useProfileStore()
const authStore = useAuthStore()

// Estado local
const showCreateModal = ref(false)
const editingPost = ref<UserPost | null>(null)
const deletingPost = ref<UserPost | null>(null)

// Infinite scroll
const { target } = useInfiniteScroll(() => {
  if (profileStore.isReadyForInfiniteScroll) {
    loadMore()
  }
})

// Métodos
const loadMore = async () => {
  try {
    await profileStore.loadMorePosts()
  } catch (error) {
    console.error('Error al cargar más posts:', error)
  }
}

const handleEditPost = (post: UserPost) => {
  editingPost.value = post
}

const handleDeletePost = (post: UserPost) => {
  deletingPost.value = post
}

const handlePostCreated = (newPost: UserPost) => {
  showCreateModal.value = false
  // El post ya se agregó al store en createPost
}

const handlePostUpdated = (updatedPost: UserPost) => {
  editingPost.value = null
  // El post ya se actualizó en el store
}

const handleDeleteConfirmed = async () => {
  if (deletingPost.value) {
    try {
      await profileStore.deletePost(deletingPost.value.id)
      deletingPost.value = null
    } catch (error) {
      console.error('Error al eliminar post:', error)
    }
  }
}

// Cargar posts al montar
onMounted(async () => {
  try {
    await profileStore.loadPosts(props.userId, true)
  } catch (error) {
    console.error('Error al cargar posts:', error)
  }
})

// Limpiar estado al desmontar
onUnmounted(() => {
  if (!props.userId) {
    // Solo limpiar si estamos saliendo de nuestro propio perfil
    profileStore.resetState()
  }
})
</script>

<style scoped>
.user-posts-tab {
  background-color: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
}

.post-item {
  transition: background-color 0.2s ease;
}

.post-item:hover {
  background-color: var(--surface-2);
}

/* Animaciones para skeleton loading */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Responsivo */
@media (max-width: 640px) {
  .user-posts-tab {
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
}
</style>
