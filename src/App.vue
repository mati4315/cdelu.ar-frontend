<template>
  <div id="app-container" class="flex flex-col min-h-screen">
    <AppHeader />
    <main class="flex-grow">
      <router-view />
    </main>
    <AppInstallFooter />
    <!-- Componente de notificaciones global -->
    <NotificationContainer />
    <!-- Puedes agregar un AppFooter general aquí si lo necesitas -->
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppInstallFooter from '@/components/layout/AppInstallFooter.vue'
import NotificationContainer from '@/components/ui/NotificationContainer.vue'

// useDark() ya se inicializa en AppHeader y maneja la clase <html>.
// No es estrictamente necesario llamarlo aquí de nuevo si AppHeader siempre está presente.
</script>

<style>
/* Estilos globales adicionales si son necesarios */
body {
  /* font-family ya está en main.css */
}

#app-container {
  background-color: var(--bg);
  color: var(--text);
}
</style> 