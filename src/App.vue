<template>
  <div id="app-container" class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
    <AppHeader />
    <main class="flex-grow">
      <router-view />
    </main>
    <AppInstallFooter />
    <!-- Puedes agregar un AppFooter general aquí si lo necesitas -->
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppInstallFooter from '@/components/layout/AppInstallFooter.vue'

// useDark() ya se inicializa en AppHeader y maneja la clase <html>.
// No es estrictamente necesario llamarlo aquí de nuevo si AppHeader siempre está presente.
</script>

<style>
/* Estilos globales adicionales si son necesarios */
body {
  /* font-family ya está en main.css */
}
</style> 