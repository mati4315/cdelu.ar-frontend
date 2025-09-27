<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div class="bg-surface rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden" style="background-color: var(--surface)">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b" style="border-color: var(--border)">
        <h2 class="text-xl font-semibold" style="color: var(--text)">
          Crear Nueva Publicación
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
              placeholder="Comparte tu historia, experiencia o conocimiento con la comunidad..."
            ></textarea>
            <p v-if="errors.descripcion" class="text-red-500 text-sm mt-1">{{ errors.descripcion }}</p>
            <p class="text-xs mt-1" style="color: var(--muted)">
              {{ form.descripcion.length }}/2000 caracteres
            </p>
          </div>

          <!-- Imágenes -->
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--text)">
              Imágenes (opcional)
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
              JPEG, PNG, WebP - Máximo 6 imágenes, 10MB cada una
            </p>
            <p v-if="errors.images" class="text-red-500 text-sm mt-1">{{ errors.images }}</p>
            
            <!-- Preview de imágenes -->
            <div v-if="form.images.length > 0" class="mt-3">
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div v-for="(file, index) in form.images" :key="index" class="relative">
                  <img 
                    :src="getFilePreview(file)" 
                    :alt="`Imagen ${index + 1}`"
                    class="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    @click="removeImage(index)"
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

          <!-- Video -->
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--text)">
              Video (opcional)
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
            
            <!-- Preview del video -->
            <div v-if="form.video" class="mt-3">
              <video 
                :src="getFilePreview(form.video)" 
                controls 
                class="w-full max-h-48 rounded-lg bg-black"
              >
                Tu navegador no soporta el elemento video.
              </video>
              <button
                type="button"
                @click="removeVideo"
                class="mt-2 text-red-500 hover:text-red-600 text-sm flex items-center space-x-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                <span>Eliminar video</span>
              </button>
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
              :disabled="isSubmitting || !isFormValid"
              class="px-4 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <span v-if="!isSubmitting">Crear Publicación</span>
              <span v-else class="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Creando...</span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onUnmounted } from 'vue'
import { useProfileStore } from '@/store/profileStore'
import { profileService } from '@/services/profileService'
import type { UserPost } from '@/types/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

// Emits
const emit = defineEmits<{
  close: []
  created: [post: UserPost]
}>()

// Store
const profileStore = useProfileStore()

// Estado local
const isSubmitting = ref(false)

// Formulario
const form = reactive({
  titulo: '',
  descripcion: '',
  images: [] as File[],
  video: null as File | null
})

// Errores
const errors = reactive({
  titulo: '',
  descripcion: '',
  images: '',
  video: ''
})

// Computed
const isFormValid = computed(() => {
  return form.titulo.trim().length > 0 && form.descripcion.trim().length > 0
})

// Métodos
const validateForm = (): boolean => {
  errors.titulo = ''
  errors.descripcion = ''
  errors.images = ''
  errors.video = ''

  let isValid = true

  // Validar título
  if (!form.titulo.trim()) {
    errors.titulo = 'El título es requerido'
    isValid = false
  } else if (form.titulo.length > 200) {
    errors.titulo = 'El título no puede exceder los 200 caracteres'
    isValid = false
  }

  // Validar descripción
  if (!form.descripcion.trim()) {
    errors.descripcion = 'La descripción es requerida'
    isValid = false
  } else if (form.descripcion.length > 2000) {
    errors.descripcion = 'La descripción no puede exceder los 2000 caracteres'
    isValid = false
  }

  // Validar imágenes
  if (form.images.length > 0) {
    const validation = profileService.validateImages(form.images)
    if (!validation.valid) {
      errors.images = validation.errors.join(', ')
      isValid = false
    }
  }

  // Validar video
  if (form.video) {
    const validation = profileService.validateVideo(form.video)
    if (!validation.valid) {
      errors.video = validation.error || 'Video inválido'
      isValid = false
    }
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm() || isSubmitting.value) return

  try {
    isSubmitting.value = true

    const formData = profileService.createCommunityPostFormData({
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      images: form.images,
      video: form.video || undefined
    })

    const newPost = await profileStore.createPost(formData)
    emit('created', newPost)

  } catch (error) {
    console.error('Error al crear post:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleImagesChange = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    form.images = Array.from(files)
  }
}

const handleVideoChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  form.video = file || null
}

const removeImage = (index: number) => {
  form.images.splice(index, 1)
}

const removeVideo = () => {
  form.video = null
}

const getFilePreview = (file: File): string => {
  return URL.createObjectURL(file)
}

// Limpiar URLs de preview al desmontar
onUnmounted(() => {
  form.images.forEach(file => {
    URL.revokeObjectURL(URL.createObjectURL(file))
  })
  
  if (form.video) {
    URL.revokeObjectURL(URL.createObjectURL(form.video))
  }
})
</script>

<style scoped>
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
