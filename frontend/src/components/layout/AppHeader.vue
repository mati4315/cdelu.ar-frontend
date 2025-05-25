<template>
  <header 
    ref="headerRef" 
    class="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 p-4 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out shadow-md"
    :class="{ '-translate-y-full': !isHeaderVisible && !isAtTop, 'py-3': !isAtTop, 'py-4': isAtTop }"
  >
    <div class="container mx-auto flex justify-between items-center">
      <!-- Izquierda: Menú y Selector de Tema -->
      <div class="header-left w-1/4 flex items-center space-x-3">
        <button @click="toggleMenu" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </button>
        <button @click="toggleDark()" class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none">
          <svg v-if="isDark" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m8.66-12.66l-.707.707M5.05 18.95l-.707.707M21 12h-1M4 12H3m15.32-6.68l-.707-.707M5.75 5.05l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"></path></svg>
        </button>
      </div>

      <!-- Centro: Logo -->
      <div class="header-center w-1/2 flex justify-center">
        <router-link to="/">
          <img src="/logo.png" alt="Diario CdelU Logo" class="h-10 transition-all duration-300 ease-in-out" :class="{ 'h-8': !isAtTop, 'h-10': isAtTop }">
        </router-link>
      </div>

      <!-- Derecha: Autenticación -->
      <div class="header-right w-1/4 flex justify-end items-center space-x-3">
        <template v-if="authStore.isAuthenticated && authStore.user">
          <span class="text-sm">Hola, {{ authStore.user.nombre }}</span>
          <button 
            @click="handleLogout"
            class="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            Salir
          </button>
        </template>
        <template v-else>
          <router-link 
            to="/login" 
            class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            Ingresar
          </router-link>
          <router-link 
            to="/register" 
            class="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            Registrarse
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useWindowScroll, useDark, useToggle } from '@vueuse/core';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';

const headerRef = ref<HTMLElement | null>(null);
const isHeaderVisible = ref(true);
const isAtTop = ref(true);
let lastScrollY = 0;

const authStore = useAuthStore();
const router = useRouter();

// Lógica para el tema oscuro/claro
const isDark = useDark(); // useDark se encarga de la clase en <html> y localStorage
const toggleDark = useToggle(isDark);

function handleScroll() {
  const currentScrollY = window.scrollY;
  isAtTop.value = currentScrollY < 50;

  if (isAtTop.value) {
    isHeaderVisible.value = true;
  } else {
    if (currentScrollY < lastScrollY) {
      isHeaderVisible.value = true;
    } else {
      isHeaderVisible.value = false;
    }
  }
  lastScrollY = currentScrollY < 0 ? 0 : currentScrollY;
}

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const toggleMenu = () => {
  console.log('Toggle menu clicked');
  // Implementar lógica de menú lateral aquí
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  lastScrollY = window.scrollY;
  isAtTop.value = lastScrollY < 50;
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

</script>

<style scoped>
.container {
  max-width: 1200px;
}
/* Otros estilos específicos del header pueden ir aquí */
</style> 