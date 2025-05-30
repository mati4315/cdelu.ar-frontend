<template>
  <footer 
    v-if="showFooter && canInstallPWA"
    class="fixed bottom-0 left-0 right-0 bg-blue-600 dark:bg-blue-700 text-white p-4 shadow-lg transition-transform duration-500 ease-in-out z-40"
    :class="{ 'translate-y-full': !isVisible, 'translate-y-0': isVisible }"
  >
    <div class="container mx-auto flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
      <p class="mb-2 sm:mb-0">¡Lleva Diario CdelU contigo! Instala la aplicación para una mejor experiencia.</p>
      <button 
        @click="promptInstall"
        class="bg-white text-blue-600 dark:text-blue-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors"
      >
        Instalar Aplicación
      </button>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const showFooter = ref(false); // Controla si el footer debe considerarse para mostrar (scroll > 60%)
const isVisible = ref(false);  // Controla la animación de entrada/salida
let deferredPrompt: any = null; // Para guardar el evento beforeinstallprompt
const canInstallPWA = ref(false);

const SCROLL_THRESHOLD_PERCENT = 0.60; // 60%

function handleScroll() {
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  const scrolledPercent = (scrollY + windowHeight) / documentHeight;

  if (scrolledPercent > SCROLL_THRESHOLD_PERCENT) {
    showFooter.value = true;
    // Esperar un poco antes de hacerlo visible para que la animación se aprecie
    setTimeout(() => isVisible.value = true, 100);
  } else {
    isVisible.value = false;
    // Esperar a que termine la animación de salida antes de ocultar completamente
    setTimeout(() => showFooter.value = false, 500); 
  }
}

async function promptInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    if (outcome === 'accepted') {
      canInstallPWA.value = false; // Ocultar el botón después de la instalación
    }
    deferredPrompt = null;
  }
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Prevenir que el navegador muestre su propio prompt
    deferredPrompt = e;
    canInstallPWA.value = true; // Habilitar el botón si la PWA es instalable
    console.log('`beforeinstallprompt` event was fired.');
  });

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Comprobar el estado inicial del scroll

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    canInstallPWA.value = false;
    isVisible.value = false;
    showFooter.value = false;
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  // No es necesario remover 'beforeinstallprompt' ya que generalmente se dispara una vez
});

</script>

<style scoped>
/* Estilos adicionales si son necesarios */
.container {
  max-width: 1200px;
}
</style> 