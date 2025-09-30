<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-surface rounded-2xl shadow-2xl max-w-md w-full mx-4 relative transform transition-all duration-300 ease-out">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl p-6 text-white text-center">
          <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold mb-2">¡Te gusta este contenido!</h2>
          <p class="text-blue-100 text-sm">Únete a la comunidad para dar likes y más</p>
        </div>

        <!-- Cuerpo del modal -->
        <div class="modal-body p-6">
          <div class="text-center mb-6">
            <p class="text-primary text-lg mb-4">
              Para dar <span class="font-semibold text-red-500">❤️ Me Gusta</span> necesitas estar registrado
            </p>
            
            <div class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-6">
              <h3 class="font-semibold text-primary mb-3">Al unirte podrás:</h3>
              <ul class="text-left text-muted space-y-2">
                <li class="flex items-center">
                  <span class="text-red-500 mr-2">❤️</span>
                  Dar likes a noticias y posts
                </li>
                <li class="flex items-center">
                  <span class="text-blue-500 mr-2">💬</span>
                  Comentar y participar en conversaciones
                </li>
                <li class="flex items-center">
                  <span class="text-green-500 mr-2">📝</span>
                  Crear tus propias publicaciones
                </li>
                <li class="flex items-center">
                  <span class="text-purple-500 mr-2">👥</span>
                  Seguir a otros usuarios
                </li>
              </ul>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="space-y-3">
            <button 
              @click="navigateToLogin"
              class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                </svg>
                Iniciar Sesión
              </span>
            </button>
            
            <button 
              @click="navigateToRegister"
              class="w-full bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              <span class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
                Crear Cuenta Gratis
              </span>
            </button>
            
            <button 
              @click="closeModal"
              class="w-full text-muted hover:text-primary font-medium py-2 transition-colors"
            >
              Ahora no, gracias
            </button>
          </div>
        </div>

        <!-- Botón cerrar X -->
        <button 
          @click="closeModal"
          class="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const router = useRouter()

const closeModal = () => {
  emit('close')
}

const navigateToLogin = () => {
  closeModal()
  router.push('/login')
}

const navigateToRegister = () => {
  closeModal()
  router.push('/register')
}

// Cerrar con Escape
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}

// Agregar y remover listener para Escape
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden' // Prevenir scroll del body
  } else {
    document.removeEventListener('keydown', handleEscape)
    document.body.style.overflow = '' // Restaurar scroll
  }
})

// Cleanup al desmontar
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<script lang="ts">
import { watch, onUnmounted } from 'vue'
</script>

<style scoped>
/* Animaciones para el modal */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.modal-body {
  background-color: rgba(255, 255, 255, 0.96);
}

html.dark .modal-body {
  background-color: rgba(28, 30, 33, 0.96);
}

/* Efectos hover adicionales */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* Gradientes personalizados */
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-blue-500 {
  --tw-gradient-from: #3b82f6;
  --tw-gradient-to: rgb(59 130 246 / 0);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-purple-600 {
  --tw-gradient-to: #9333ea;
}

/* Dark mode adjustments */
html.dark .bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}
</style>
