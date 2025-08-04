<template>
  <div class="admin-login">
    <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Acceso de Administrador
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Inicia sesión para gestionar encuestas
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="admin@trigamer.net"
          />
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contraseña
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Tu contraseña"
          />
        </div>

        <!-- Error message -->
        <div v-if="error" class="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
          <p class="text-red-700 dark:text-red-400 text-sm">{{ error }}</p>
        </div>

        <!-- Success message -->
        <div v-if="success" class="p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
          <p class="text-green-700 dark:text-green-400 text-sm">{{ success }}</p>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="loading">Iniciando sesión...</span>
          <span v-else>Iniciar Sesión</span>
        </button>
      </form>

              <!-- Info -->
        <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <p class="text-blue-700 dark:text-blue-400 text-sm">
            <strong>Credenciales de prueba:</strong><br>
            Email: admin@cdelu.ar<br>
            Contraseña: admin123
          </p>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// Estado del formulario
const form = ref({
          email: 'matias4315@gmail.com',
        password: 'w35115415'
});

const loading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

// Métodos
const handleLogin = async () => {
  loading.value = true;
  error.value = null;
  success.value = null;
  
  try {
    console.log('🔐 Intentando login con:', form.value.email);
    
    await authStore.login({
      email: form.value.email,
      password: form.value.password
    });
    
    // Verificar si el login fue exitoso
    if (authStore.isAuthenticated) {
      success.value = 'Login exitoso. Redirigiendo...';
      console.log('✅ Login exitoso como administrador');
      
      // Redirigir al panel de administración
      setTimeout(() => {
        router.push('/surveys/admin');
      }, 1000);
    } else {
      error.value = 'Credenciales incorrectas';
    }
  } catch (err) {
    console.error('Error en login:', err);
    error.value = err instanceof Error ? err.message : 'Error al iniciar sesión';
  } finally {
    loading.value = false;
  }
};
</script> 