<template>
  <div class="user-post-item p-4 bg-surface transition-colors">
    <!-- Header del post -->
    <div class="flex justify-between items-start mb-3">
      <div class="flex-1">
        <h3 class="text-lg font-semibold mb-1" style="color: var(--text)">
          {{ post.titulo }}
        </h3>
        <div class="flex items-center space-x-4 text-sm" style="color: var(--muted)">
          <span>{{ formatDate(post.created_at) }}</span>
          <span v-if="post.updated_at !== post.created_at" class="flex items-center space-x-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            <span>Editado</span>
          </span>
        </div>
      </div>
      
      <!-- Menú de acciones -->
      <div v-if="canEdit" class="relative" ref="menuRef">
        <button 
          @click="toggleMenu"
          class="p-2 rounded-lg hover:bg-surface-2 transition-colors"
          style="color: var(--muted)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
          </svg>
        </button>

        <!-- Dropdown menu -->
        <transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div v-if="showMenu" class="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-xl border z-10" style="background-color: var(--surface); border-color: var(--border)">
            <div class="py-2">
              <button 
                @click="handleEdit"
                class="flex items-center w-full px-4 py-2 text-sm hover:bg-surface-2 transition-colors"
                style="color: var(--text)"
              >
                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Editar
              </button>
              <button 
                @click="handleDelete"
                class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Contenido del post -->
    <div class="mb-4">
      <p class="text-sm leading-relaxed whitespace-pre-wrap" style="color: var(--text)">
        {{ isExpanded ? post.descripcion : truncatedDescription }}
        <button 
          v-if="needsReadMore" 
          @click.stop="toggleExpanded"
          class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium ml-1 transition-colors cursor-pointer"
        >
          {{ isExpanded ? 'Ocultar' : 'Leer más' }}
        </button>
      </p>
    </div>

    <!-- Media del post -->
    <div v-if="hasMedia" class="mb-4">
      <!-- Video -->
      <div v-if="post.video_url" class="mb-3">
        <video 
          :src="post.video_url ? getFullImageUrl(post.video_url) : ''" 
          controls 
          class="w-full max-h-96 rounded-lg bg-black"
          @error="(event: Event) => handleMediaError(new Error('Video load failed'))"
        >
          Tu navegador no soporta el elemento video.
        </video>
      </div>

      <!-- Imágenes -->
      <div v-if="post.image_urls && post.image_urls.length > 0" class="grid gap-2" :class="getImageGridClass">
        <div 
          v-for="(imageUrl, index) in post.image_urls" 
          :key="index"
          class="relative overflow-hidden rounded-lg cursor-pointer"
          @click="openImageModal(index)"
        >
          <LazyImage
            :src="getFullImageUrl(imageUrl)"
            :alt="`Imagen ${index + 1} de ${post.titulo}`"
            class="object-cover hover:scale-105 transition-transform duration-300"
            :class="getImageClass(index)"
            @error="handleMediaError"
          />
          
          <!-- Overlay para imágenes adicionales -->
          <div 
            v-if="index === 3 && post.image_urls.length > 4"
            class="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white font-semibold text-lg"
          >
            +{{ post.image_urls.length - 4 }} más
          </div>
        </div>
      </div>
    </div>

    <!-- Estadísticas del post -->
    <div v-if="showStats" class="flex items-center space-x-6 text-sm pt-3 border-t" style="color: var(--muted); border-color: var(--border)">
      <div v-if="post.likes_count" class="flex items-center space-x-1">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span>{{ post.likes_count }}</span>
      </div>
      <div v-if="post.comments_count" class="flex items-center space-x-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
        <span>{{ post.comments_count }}</span>
      </div>
    </div>

    <!-- Modal de imagen -->
    <ImageViewerModal
      v-if="showImageModal"
      :images="fullImageUrls"
      :initial-index="selectedImageIndex"
      @close="closeImageModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onClickOutside } from '@vueuse/core'
import type { UserPost } from '@/types/api'

// Componentes
import LazyImage from '@/components/LazyImage.vue'
import ImageViewerModal from '@/components/ui/ImageViewerModal.vue'

// Servicios
import { profileService } from '@/services/profileService'

// Props
interface Props {
  post: UserPost
  canEdit?: boolean
  showStats?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: false,
  showStats: true
})

// Emits
const emit = defineEmits<{
  edit: [post: UserPost]
  delete: [post: UserPost]
}>()

// Estado local
const showMenu = ref(false)
const showImageModal = ref(false)
const selectedImageIndex = ref(0)
const menuRef = ref<HTMLElement | null>(null)
const isExpanded = ref(false) // Estado de expansión del texto

// Computed
const hasMedia = computed(() => {
  return props.post.video_url || (props.post.image_urls && props.post.image_urls.length > 0)
})

const getImageGridClass = computed(() => {
  const imageCount = props.post.image_urls?.length || 0
  
  if (imageCount === 1) return 'grid-cols-1'
  if (imageCount === 2) return 'grid-cols-2'
  if (imageCount === 3) return 'grid-cols-2 grid-rows-2'
  if (imageCount === 4) return 'grid-cols-2 grid-rows-2'
  return 'grid-cols-2'
})

const getImageClass = (index: number) => {
  const imageCount = props.post.image_urls?.length || 0
  
  if (imageCount === 1) {
    return 'aspect-video max-h-96 h-64 w-full'
  }
  
  if (imageCount === 2) {
    return 'aspect-square h-48 w-full'
  }
  
  if (imageCount === 3) {
    if (index === 0) {
      return 'row-span-2 aspect-square h-96 w-full'
    }
    return 'aspect-square h-[11.5rem] w-full'
  }
  
  if (imageCount >= 4) {
    return 'aspect-square h-32 w-full'
  }
  
  return 'aspect-square h-32 w-full'
}

const fullImageUrls = computed(() => {
  return props.post.image_urls?.map(url => getFullImageUrl(url)) || []
})

// Funciones para truncar texto
const maxDescriptionLength = 200

const needsReadMore = computed(() => {
  return props.post.descripcion && props.post.descripcion.length > maxDescriptionLength
})

const truncatedDescription = computed(() => {
  if (!props.post.descripcion || props.post.descripcion.length <= maxDescriptionLength) {
    return props.post.descripcion
  }
  return props.post.descripcion.substring(0, maxDescriptionLength) + '...'
})

// Métodos
const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const closeMenu = () => {
  showMenu.value = false
}

const handleEdit = () => {
  emit('edit', props.post)
  closeMenu()
}

const handleDelete = () => {
  emit('delete', props.post)
  closeMenu()
}

const openImageModal = (index: number) => {
  selectedImageIndex.value = index
  showImageModal.value = true
}

const closeImageModal = () => {
  showImageModal.value = false
}

const handleMediaError = (error: Error) => {
  console.warn('Error cargando media:', error)
  // Podrías mostrar una imagen placeholder aquí
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) {
    return 'Ayer'
  } else if (diffDays < 7) {
    return `Hace ${diffDays} días`
  } else {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}

const getFullImageUrl = (imageUrl: string): string => {
  return profileService.getFullImageUrl(imageUrl)
}

// Cerrar menú al hacer click fuera
onClickOutside(menuRef, closeMenu)

// Limpiar estado al desmontar
onUnmounted(() => {
  closeMenu()
  closeImageModal()
})
</script>

<style scoped>
.user-post-item {
  transition: background-color 0.2s ease;
}

.user-post-item:hover {
  background-color: var(--surface-2);
}

/* Grid específico para 3 imágenes */
.grid-cols-3 .aspect-square:first-child {
  grid-row: span 2;
}

/* Responsive */
@media (max-width: 640px) {
  .grid-cols-3 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .grid-cols-3 .aspect-square:first-child {
    grid-row: span 1;
  }
}
</style>
