<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div class="bg-surface rounded-lg shadow-xl max-w-md w-full" style="background-color: var(--surface)">
      <!-- Header -->
      <div class="p-6 border-b" style="border-color: var(--border)">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-red-600">
              Eliminar Publicación
            </h3>
            <p class="text-sm" style="color: var(--muted)">
              Esta acción no se puede deshacer
            </p>
          </div>
        </div>
      </div>

      <!-- Contenido -->
      <div class="p-6">
        <p class="mb-4" style="color: var(--text)">
          ¿Estás seguro de que quieres eliminar esta publicación?
        </p>
        
        <!-- Preview del post a eliminar -->
        <div class="bg-surface-2 rounded-lg p-4 mb-4" style="background-color: var(--surface-2)">
          <h4 class="font-medium mb-2 truncate" style="color: var(--text)">
            {{ post.titulo }}
          </h4>
          <p class="text-sm opacity-75 line-clamp-3" style="color: var(--muted)">
            {{ post.descripcion }}
          </p>
          
          <!-- Indicadores de media -->
          <div v-if="hasMedia" class="flex items-center space-x-4 mt-3 text-xs" style="color: var(--muted)">
            <div v-if="post.image_urls?.length" class="flex items-center space-x-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span>{{ post.image_urls.length }} imagen(es)</span>
            </div>
            <div v-if="post.video_url" class="flex items-center space-x-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              <span>1 video</span>
            </div>
          </div>
        </div>

        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <div>
              <h4 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                ¿Qué se eliminará?
              </h4>
              <ul class="text-sm text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                <li>• El texto de la publicación</li>
                <li v-if="post.image_urls?.length">• Todas las imágenes ({{ post.image_urls.length }})</li>
                <li v-if="post.video_url">• El video adjunto</li>
                <li>• Todos los comentarios y likes asociados</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="flex justify-end space-x-3 p-6 border-t" style="border-color: var(--border)">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-surface-2 transition-colors"
          style="color: var(--text); border-color: var(--border)"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="$emit('confirmed')"
          class="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          <span>Eliminar Definitivamente</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserPost } from '@/types/api'

// Props
interface Props {
  post: UserPost
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  confirmed: []
}>()

// Computed
const hasMedia = computed(() => {
  return props.post.video_url || (props.post.image_urls && props.post.image_urls.length > 0)
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
