<template>
  <div class="login-view flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-12 transition-colors duration-300">
    <div class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 md:p-10 rounded-xl shadow-lg dark:shadow-gray-700/50 transition-colors duration-300">
      <div>
        <img class="mx-auto h-12 w-auto" src="/logo.png" alt="Diario CdelU">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Inicia sesión en tu cuenta
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only">Correo electrónico</label>
            <input 
              id="email-address" 
              name="email" 
              type="email" 
              v-model="email" 
              autocomplete="email" 
              required 
              class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-t-md focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:z-10 sm:text-sm transition-colors duration-300"
              placeholder="Correo electrónico"
            >
          </div>
          <div>
            <label for="password" class="sr-only">Contraseña</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              v-model="password" 
              autocomplete="current-password" 
              required 
              class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-b-md focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:z-10 sm:text-sm transition-colors duration-300"
              placeholder="Contraseña"
            >
          </div>
        </div>

        <div v-if="authStore.error" class="text-red-500 dark:text-red-400 text-sm text-center">
          {{ authStore.error }}
        </div>

        <div>
          <button 
            type="submit" 
            :disabled="authStore.isLoading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:bg-blue-300 dark:disabled:bg-blue-700 transition-colors"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-blue-500 dark:text-blue-300 group-hover:text-blue-400 dark:group-hover:text-blue-200 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
            </span>
            {{ authStore.isLoading ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </div>
      </form>
      <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
        ¿No tienes cuenta?
        <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
          Regístrate aquí
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

async function handleLogin() {
  if (!email.value || !password.value) {
    authStore.$patch({ error: 'Por favor, completa todos los campos.' });
    return;
  }
  try {
    await authStore.login({ email: email.value, password: password.value });
    if (authStore.isAuthenticated) {
      // Obtener la ruta de redirección de los query params
      const redirectPath = router.currentRoute.value.query.redirect as string;
      
      // Si hay una ruta de redirección y es válida, ir allí
      if (redirectPath && redirectPath !== '/login') {
        router.push(redirectPath);
      } else {
        // Si no hay redirección o es inválida, ir al home
        router.push('/');
      }
    }
  } catch (error) {}
}

onMounted(() => {
  authStore.$patch({ error: null });
});
</script>

<style scoped>
.login-view {
  padding-top: 0;
}
</style> 