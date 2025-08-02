<template>
  <div class="theme-toggle">
    <button
      @click="toggleTheme"
      class="relative inline-flex h-10 w-20 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      :aria-label="isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
    >
      <!-- Sol -->
      <div
        class="absolute left-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300"
        :class="isDark ? 'translate-x-0' : 'translate-x-10'"
      >
        <svg
          v-if="!isDark"
          class="h-5 w-5 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <!-- Luna -->
      <div
        class="absolute right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 shadow-md transition-transform duration-300"
        :class="isDark ? 'translate-x-0' : '-translate-x-10'"
      >
        <svg
          v-if="isDark"
          class="h-5 w-5 text-blue-300"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </div>
    </button>

    <!-- Indicador de sistema -->
    <div v-if="isSystem" class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
      Usando preferencia del sistema
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/store/theme';

const themeStore = useThemeStore();

const { isDark, isSystem, toggleTheme } = themeStore;
</script>

<style scoped>
.theme-toggle {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Animación suave para el toggle */
button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

button:hover {
  transform: scale(1.05);
}

button:active {
  transform: scale(0.95);
}
</style> 