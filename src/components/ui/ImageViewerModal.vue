<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90" @click="handleBackdropClick">
    <!-- Botón cerrar -->
    <button 
      @click="$emit('close')"
      class="absolute top-4 right-4 z-[110] p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>

    <!-- Navegación izquierda -->
    <button 
      v-if="images.length > 1"
      @click="previousImage"
      class="absolute left-4 z-[110] p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
      :disabled="currentIndex === 0"
      :class="{ 'opacity-50 cursor-not-allowed': currentIndex === 0 }"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
    </button>

    <!-- Navegación derecha -->
    <button 
      v-if="images.length > 1"
      @click="nextImage"
      class="absolute right-4 z-[110] p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
      :disabled="currentIndex === images.length - 1"
      :class="{ 'opacity-50 cursor-not-allowed': currentIndex === images.length - 1 }"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
    </button>

    <!-- Imagen principal -->
    <div class="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
      <img 
        :src="currentImage" 
        :alt="`Imagen ${currentIndex + 1} de ${images.length}`"
        class="max-w-full max-h-full object-contain"
        @load="handleImageLoad"
        @error="handleImageError"
      />
      
      <!-- Loading -->
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
        <div class="bg-black bg-opacity-50 rounded-lg p-4">
          <LoadingSpinner size="lg" class="text-white" />
        </div>
      </div>
    </div>

    <!-- Contador e información -->
    <div v-if="images.length > 1" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[110]">
      <div class="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
        {{ currentIndex + 1 }} de {{ images.length }}
      </div>
    </div>

    <!-- Thumbnails (para múltiples imágenes) -->
    <div v-if="images.length > 1 && images.length <= 6" class="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-[110]">
      <div class="flex space-x-2 bg-black bg-opacity-50 p-2 rounded-lg">
        <button
          v-for="(image, index) in images"
          :key="index"
          @click="goToImage(index)"
          class="relative"
        >
          <img 
            :src="image" 
            :alt="`Thumbnail ${index + 1}`"
            class="w-12 h-12 object-cover rounded border-2 transition-opacity"
            :class="index === currentIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-80'"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

// Props
interface Props {
  images: string[]
  initialIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0
})

// Emits
const emit = defineEmits<{
  close: []
}>()

// Estado local
const currentIndex = ref(props.initialIndex)
const isLoading = ref(true)

// Computed
const currentImage = computed(() => props.images[currentIndex.value])

// Métodos
const previousImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    isLoading.value = true
  }
}

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
    isLoading.value = true
  }
}

const goToImage = (index: number) => {
  currentIndex.value = index
  isLoading.value = true
}

const handleBackdropClick = (event: MouseEvent) => {
  // Solo cerrar si se hizo click en el backdrop, no en la imagen
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

const handleImageLoad = () => {
  isLoading.value = false
}

const handleImageError = () => {
  isLoading.value = false
  console.warn('Error cargando imagen:', currentImage.value)
}

const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Escape':
      emit('close')
      break
    case 'ArrowLeft':
      previousImage()
      break
    case 'ArrowRight':
      nextImage()
      break
  }
}

// Eventos de teclado
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  // Prevenir scroll del body
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  // Restaurar scroll del body
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Transiciones suaves */
img {
  transition: opacity 0.3s ease;
}

/* Estilos para los botones de navegación */
button:disabled {
  cursor: not-allowed;
}

/* Asegurar que el modal esté por encima de todo */
.z-\[110\] {
  z-index: 110;
}
</style>
