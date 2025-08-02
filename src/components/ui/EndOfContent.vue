<template>
  <div class="end-of-content bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-700 p-8">
    <div class="text-center">
      <!-- Icono animado -->
      <div class="end-icon-wrapper mb-4">
        <div class="end-icon text-4xl animate-bounce-gentle">
          {{ icon }}
        </div>
      </div>
      
      <!-- Mensaje principal -->
      <p class="text-green-700 dark:text-green-300 font-medium text-lg mb-2">
        {{ message }}
      </p>
      
      <!-- Mensaje secundario -->
      <p v-if="secondaryMessage" class="text-green-600 dark:text-green-400 text-sm">
        {{ secondaryMessage }}
      </p>
      
      <!-- Estadísticas opcionales -->
      <div v-if="showStats" class="end-stats mt-4 grid grid-cols-2 gap-4 max-w-xs mx-auto">
        <div class="stat-item text-center">
          <p class="stat-number text-lg font-bold text-green-700 dark:text-green-300">
            {{ totalItems }}
          </p>
          <p class="stat-label text-xs text-green-600 dark:text-green-400">
            Total visto
          </p>
        </div>
        <div v-if="readingTime" class="stat-item text-center">
          <p class="stat-number text-lg font-bold text-green-700 dark:text-green-300">
            {{ readingTime }}min
          </p>
          <p class="stat-label text-xs text-green-600 dark:text-green-400">
            Tiempo aprox.
          </p>
        </div>
      </div>
      
      <!-- Acción opcional -->
      <div v-if="showAction" class="end-action mt-6">
        <button
          @click="handleAction"
          class="action-btn bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 inline-flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
          {{ actionText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string;
  secondaryMessage?: string;
  icon?: string;
  showStats?: boolean;
  totalItems?: number;
  readingTime?: number;
  showAction?: boolean;
  actionText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  message: 'Has visto todo el contenido disponible',
  secondaryMessage: '¡Vuelve pronto para ver más novedades!',
  icon: '🎉',
  showStats: false,
  totalItems: 0,
  readingTime: 0,
  showAction: false,
  actionText: 'Volver arriba'
});

const emit = defineEmits<{
  action: [];
}>();

const handleAction = () => {
  emit('action');
};
</script>

<style scoped>
.end-of-content {
  /* Optimizaciones de performance */
  contain: layout style;
  will-change: transform;
}

.end-icon-wrapper {
  /* Centrar y optimizar la animación del icono */
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
}

.action-btn:active {
  transform: translateY(0);
}

/* Animación suave de bounce */
@keyframes bounce-gentle {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
  60% {
    transform: translateY(-4px);
  }
}

.animate-bounce-gentle {
  animation: bounce-gentle 2s ease-in-out infinite;
  will-change: transform;
}

/* Optimización para stats grid */
.end-stats {
  contain: content;
}

.stat-item {
  transition: transform 0.15s ease;
}

.stat-item:hover {
  transform: scale(1.05);
}

/* Gradiente optimizado */
.end-of-content {
  background-image: linear-gradient(
    to right,
    rgba(34, 197, 94, 0.1),
    rgba(59, 130, 246, 0.1)
  );
}

.dark .end-of-content {
  background-image: linear-gradient(
    to right,
    rgba(34, 197, 94, 0.05),
    rgba(59, 130, 246, 0.05)
  );
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .end-of-content {
    padding: 1.5rem;
  }
  
  .end-icon {
    font-size: 2.5rem;
  }
  
  .end-stats {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
}

/* Dark mode específico */
.dark .stat-number {
  color: rgb(34 197 94); /* green-500 */
}

.dark .stat-label {
  color: rgb(74 222 128); /* green-400 */
}
</style> 