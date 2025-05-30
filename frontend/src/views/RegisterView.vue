<template>
  <div class="register-view flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-12 transition-colors duration-300">
    <div class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 md:p-10 rounded-xl shadow-lg dark:shadow-gray-700/50 transition-colors duration-300">
      <div>
        <img class="mx-auto h-12 w-auto" src="/logo.png" alt="Diario CdelU">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Crea una nueva cuenta
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm ">
          <div>
            <label for="nombre" class="sr-only">Nombre completo</label>
            <input 
              id="nombre" 
              name="nombre" 
              type="text" 
              v-model="nombre" 
              autocomplete="name" 
              required 
              class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-t-md focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:z-10 sm:text-sm transition-colors duration-300"
              placeholder="Nombre completo"
            >
          </div>
          <div class="-mt-px">
            <label for="email-address-register" class="sr-only">Correo electrónico</label>
            <input 
              id="email-address-register" 
              name="email" 
              type="email" 
              v-model="email" 
              autocomplete="email" 
              required 
              class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:z-10 sm:text-sm transition-colors duration-300"
              placeholder="Correo electrónico"
            >
          </div>
          <div class="-mt-px">
            <label for="password-register" class="sr-only">Contraseña</label>
            <input 
              id="password-register" 
              name="password" 
              type="password" 
              v-model="password" 
              autocomplete="new-password" 
              required 
              class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:z-10 sm:text-sm transition-colors duration-300"
              placeholder="Contraseña (mín. 6 caracteres)"
            >
          </div>
          <div class="-mt-px">
            <label for="password-confirm" class="sr-only">Confirmar contraseña</label>
            <input 
              id="password-confirm" 
              name="password_confirm" 
              type="password" 
              v-model="passwordConfirm" 
              autocomplete="new-password" 
              required 
              class="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-b-md focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:z-10 sm:text-sm transition-colors duration-300"
              placeholder="Confirmar contraseña"
            >
          </div>
        </div>

        <div v-if="authStore.error" class="text-red-500 dark:text-red-400 text-sm text-center">
          {{ authStore.error }}
        </div>
        <div v-if="successMessage" class="text-green-500 dark:text-green-400 text-sm text-center">
          {{ successMessage }}
        </div>

        <div>
          <button 
            type="submit" 
            :disabled="authStore.isLoading || !passwordsMatch || password.length < 6"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-green-400 disabled:bg-green-300 dark:disabled:bg-green-700 transition-colors"
          >
            {{ authStore.isLoading ? 'Registrando...' : 'Crear cuenta' }}
          </button>
        </div>
      </form>
       <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
        ¿Ya tienes una cuenta?
        <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
          Inicia sesión aquí
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();

const nombre = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const successMessage = ref<string | null>(null);

const passwordsMatch = computed(() => password.value === passwordConfirm.value);

async function handleRegister() {
  if (!passwordsMatch.value) {
    authStore.$patch({ error: 'Las contraseñas no coinciden.'});
    return;
  }
  if (password.value.length < 6) {
    authStore.$patch({ error: 'La contraseña debe tener al menos 6 caracteres.'});
    return;
  }
  authStore.$patch({ error: null });
  successMessage.value = null;

  try {
    await authStore.register({
      nombre: nombre.value,
      email: email.value,
      password: password.value,
    });
    successMessage.value = '¡Registro exitoso! Ahora puedes iniciar sesión.';
    setTimeout(() => {
       router.push('/login');
    }, 3000);
  } catch (error) {}
}

onMounted(() => {
  authStore.$patch({ error: null });
  successMessage.value = null;
});
</script>

<style scoped>
.register-view {
  padding-top: 0;
}
</style> 