<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div class="bg-surface rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden" style="background-color: var(--surface)">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b" style="border-color: var(--border)">
        <h2 class="text-xl font-semibold" style="color: var(--text)">
          Editar Publicación
        </h2>
        <button 
          @click="$emit('close')"
          class="p-2 rounded-lg hover:bg-surface-2 transition-colors"
          style="color: var(--muted)"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Contenido -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Título -->
          <div>
            <label for="titulo" class="block text-sm font-medium mb-2" style="color: var(--text)">
              Título *
            </label>
            <input
              id="titulo"
              v-model="form.titulo"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-surface"
              style="background-color: var(--surface); color: var(--text); border-color: var(--border)"
              placeholder="Escribe un título llamativo..."
            />
            <p v-if="errors.titulo" class="text-red-500 text-sm mt-1">{{ errors.titulo }}</p>
          </div>

          <!-- Descripción -->
          <div>
            <label for="descripcion" class="block text-sm font-medium mb-2" style="color: var(--text)">
              Descripción *
            </label>
            <textarea
              id="descripcion"
              v-model="form.descripcion"
              required
              rows="4"
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-surface resize-none"
              style="background-color: var(--surface); color: var(--text); border-color: var(--border)"
              placeholder="Comparte tu historia, experiencia o conocimiento..."
            ></textarea>
            <p v-if="errors.descripcion" class="text-red-500 text-sm mt-1">{{ errors.descripcion }}</p>
            <p class="text-xs mt-1" style="color: var(--muted)">
              {{ form.descripcion.length }}/2000 caracteres
            </p>
          </div>

          <!-- Pestañas para editar texto o media -->
          <div class="border-b" style="border-color: var(--border)">
            <nav class="flex space-x-8">
              <button
                type="button"
                @click="activeTab = 'text'"
                :class="[
                  'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === 'text' 
                    ? 'border-accent text-accent' 
                    : 'border-transparent text-muted hover:text-text'
                ]"
                style="color: var(--muted)"
              >
                Editar Texto
              </button>
              <button
                type="button"
                @click="activeTab = 'media'"
                :class="[
                  'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === 'media' 
                    ? 'border-accent text-accent' 
                    : 'border-transparent text-muted hover:text-text'
                ]"
                style="color: var(--muted)"
              >
                Editar Media
              </button>
            </nav>
          </div>

          <!-- Tab Content: Media -->
          <div v-if="activeTab === 'media'" class="space-y-6">
            <!-- Media Actual -->
            <div v-if="hasCurrentMedia" class="space-y-4">
              <h3 class="text-sm font-medium" style="color: var(--text)">
                Media Actual
              </h3>
              
              <!-- Video actual -->
              <div v-if="post.video_url" class="relative">
                <video 
                  :src="post.video_url" 
                  controls 
                  class="w-full max-h-48 rounded-lg bg-black"
                >
                  Tu navegador no soporta el elemento video.
                </video>
                <button
                  type="button"
                  @click="mediaForm.removeVideo = true"
                  class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  :class="{ 'opacity-50': mediaForm.removeVideo }"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
                <p v-if="mediaForm.removeVideo" class="text-red-500 text-sm mt-1">
                  Este video se eliminará al guardar
                </p>
              </div>

              <!-- Imágenes actuales -->
              <div v-if="post.image_urls?.length" class="space-y-2">
                <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div 
                    v-for="(imageUrl, index) in post.image_urls" 
                    :key="index"
                    class="relative group"
                  >
                    <img 
                      :src="imageUrl" 
                      :alt="`Imagen ${index + 1}`"
                      class="w-full h-24 object-cover rounded-lg"
                      :class="{ 'opacity-50': isImageMarkedForRemoval(imageUrl) }"
                    />
                    <button
                      type="button"
                      @click="toggleImageRemoval(imageUrl)"
                      class="absolute top-1 right-1 p-1 rounded-full transition-colors"
                      :class="isImageMarkedForRemoval(imageUrl) 
                        ? 'bg-red-500 text-white' 
                        : 'bg-black bg-opacity-50 text-white hover:bg-red-500'"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <p v-if="mediaForm.removeImages.length > 0" class="text-red-500 text-sm">
                  {{ mediaForm.removeImages.length }} imagen(es) se eliminarán al guardar
                </p>
              </div>
            </div>

            <!-- Agregar nuevo video -->
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--text)">
                Nuevo Video (opcional)
              </label>
              <input
                type="file"
                accept="video/mp4"
                @change="handleVideoChange"
                class="w-full px-3 py-2 border rounded-lg bg-surface"
                style="background-color: var(--surface); color: var(--text); border-color: var(--border)"
              />
              <p class="text-xs mt-1" style="color: var(--muted)">
                Solo MP4, máximo 200MB
              </p>
              <p v-if="errors.video" class="text-red-500 text-sm mt-1">{{ errors.video }}</p>
            </div>

            <!-- Agregar nuevas imágenes -->
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--text)">
                Nuevas Imágenes (opcional)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                @change="handleImagesChange"
                class="w-full px-3 py-2 border rounded-lg bg-surface"
                style="background-color: var(--surface); color: var(--text); border-color: var(--border)"
              />
              <p class="text-xs mt-1" style="color: var(--muted)">
                JPEG, PNG, WebP - Máximo 6 imágenes total, 10MB cada una
              </p>
              <p v-if="errors.images" class="text-red-500 text-sm mt-1">{{ errors.images }}</p>
              
              <!-- Preview de nuevas imágenes -->
              <div v-if="mediaForm.newImages.length > 0" class="mt-3">
                <p class="text-sm font-medium mb-2" style="color: var(--text)">
                  Nuevas imágenes a agregar:
                </p>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div v-for="(file, index) in mediaForm.newImages" :key="index" class="relative">
                    <img 
                      :src="getFilePreview(file)" 
                      :alt="`Nueva imagen ${index + 1}`"
                      class="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      @click="removeNewImage(index)"
                      class="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex justify-end space-x-3 pt-4 border-t" style="border-color: var(--border)">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-surface-2 transition-colors"
              style="color: var(--text); border-color: var(--border)"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isSubmitting || !hasChanges"
              class="px-4 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <span v-if="!isSubmitting">Guardar Cambios</span>
              <span v-else class="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>{{ activeTab === 'text' ? 'Guardando texto...' : 'Actualizando media...' }}</span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useProfileStore } from '@/store/profileStore'
import { profileService } from '@/services/profileService'
import type { UserPost } from '@/types/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

// Props
interface Props {
  post: UserPost
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  updated: [post: UserPost]
}>()

// Store
const profileStore = useProfileStore()

// Estado local
const activeTab = ref<'text' | 'media'>('text')
const isSubmitting = ref(false)

// Formulario de texto
const form = reactive({
  titulo: props.post.titulo,
  descripcion: props.post.descripcion
})

// Formulario de media
const mediaForm = reactive({
  newImages: [] as File[],
  newVideo: null as File | null,
  removeVideo: false,
  removeImages: [] as string[]
})

// Errores
const errors = reactive({
  titulo: '',
  descripcion: '',
  images: '',
  video: ''
})

// Computed
const hasChanges = computed(() => {
  const textChanged = form.titulo !== props.post.titulo || form.descripcion !== props.post.descripcion
  const mediaChanged = mediaForm.newImages.length > 0 || 
                      mediaForm.newVideo !== null || 
                      mediaForm.removeVideo || 
                      mediaForm.removeImages.length > 0
  
  return activeTab.value === 'text' ? textChanged : mediaChanged
})

const hasCurrentMedia = computed(() => {
  return props.post.video_url || (props.post.image_urls && props.post.image_urls.length > 0)
})

// Métodos
const validateTextForm = (): boolean => {
  errors.titulo = ''
  errors.descripcion = ''

  if (!form.titulo.trim()) {
    errors.titulo = 'El título es requerido'
    return false
  }

  if (form.titulo.length > 200) {
    errors.titulo = 'El título no puede exceder los 200 caracteres'
    return false
  }

  if (!form.descripcion.trim()) {
    errors.descripcion = 'La descripción es requerida'
    return false
  }

  if (form.descripcion.length > 2000) {
    errors.descripcion = 'La descripción no puede exceder los 2000 caracteres'
    return false
  }

  return true
}

const validateMediaForm = (): boolean => {
  errors.images = ''
  errors.video = ''

  // Validar nuevas imágenes
  if (mediaForm.newImages.length > 0) {
    const validation = profileService.validateImages(mediaForm.newImages)
    if (!validation.valid) {
      errors.images = validation.errors.join(', ')
      return false
    }

    // Verificar total de imágenes (actuales - a eliminar + nuevas)
    const currentImages = props.post.image_urls?.length || 0
    const totalImages = currentImages - mediaForm.removeImages.length + mediaForm.newImages.length
    
    if (totalImages > 6) {
      errors.images = 'No puedes tener más de 6 imágenes en total'
      return false
    }
  }

  // Validar nuevo video
  if (mediaForm.newVideo) {
    const validation = profileService.validateVideo(mediaForm.newVideo)
    if (!validation.valid) {
      errors.video = validation.error || 'Video inválido'
      return false
    }
  }

  return true
}

const handleSubmit = async () => {
  if (isSubmitting.value) return

  try {
    isSubmitting.value = true

    if (activeTab.value === 'text') {
      // Actualizar texto
      if (!validateTextForm()) return

      const updatedPost = await profileStore.updatePost(props.post.id, {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim()
      })

      emit('updated', updatedPost)
    } else {
      // Actualizar media
      if (!validateMediaForm()) return

      const formData = profileService.createMediaFormData({
        images: mediaForm.newImages,
        video: mediaForm.newVideo || undefined,
        removeVideo: mediaForm.removeVideo,
        removeImages: mediaForm.removeImages
      })

      const updatedPost = await profileStore.updatePostMedia(props.post.id, formData)
      emit('updated', updatedPost)
    }

  } catch (error) {
    console.error('Error al actualizar post:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleImagesChange = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    mediaForm.newImages = Array.from(files)
  }
}

const handleVideoChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  mediaForm.newVideo = file || null
}

const removeNewImage = (index: number) => {
  mediaForm.newImages.splice(index, 1)
}

const toggleImageRemoval = (imageUrl: string) => {
  const index = mediaForm.removeImages.indexOf(imageUrl)
  if (index === -1) {
    mediaForm.removeImages.push(imageUrl)
  } else {
    mediaForm.removeImages.splice(index, 1)
  }
}

const isImageMarkedForRemoval = (imageUrl: string): boolean => {
  return mediaForm.removeImages.includes(imageUrl)
}

const getFilePreview = (file: File): string => {
  return URL.createObjectURL(file)
}

// Limpiar URLs de preview al desmontar
onMounted(() => {
  return () => {
    mediaForm.newImages.forEach(file => {
      URL.revokeObjectURL(URL.createObjectURL(file))
    })
  }
})
</script>

<style scoped>
/* Transiciones para las pestañas */
.border-accent {
  border-color: var(--accent);
}

.text-accent {
  color: var(--accent);
}

/* Scroll personalizado */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: var(--surface-2);
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: var(--muted);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: var(--text);
}
</style>
