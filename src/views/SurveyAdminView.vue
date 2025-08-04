<template>
  <div class="survey-admin-view">
    <div class="max-w-6xl mx-auto px-4 py-6 pt-24" style="margin-top: 80px;">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Administración de Encuestas
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Gestiona las encuestas del portal
            </p>
          </div>
          <button
            v-if="isAdmin"
            @click="showCreateForm = true"
            class="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:scale-105 relative z-10"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Nueva Encuesta
          </button>
          <div v-else class="text-sm text-gray-500 dark:text-gray-400">
            Requiere permisos de administrador
          </div>
        </div>
      </div>

      <!-- Banner informativo para administradores -->
      <div v-if="isAdmin" class="mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800 dark:text-green-200">
              Panel de Administración
            </h3>
            <p class="text-sm text-green-700 dark:text-green-300 mt-1">
              Crea y gestiona encuestas para que los usuarios puedan participar. Las encuestas activas aparecerán en la página principal.
            </p>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Cargando encuestas...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-8">
        <div class="text-red-600 dark:text-red-400 mb-2">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ error }}</p>
        <div class="flex justify-center space-x-3">
          <button 
            v-if="isAdmin"
            @click="loadSurveys"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
          <button 
            v-if="!authStore.isAuthenticated"
            @click="$router.push('/login')"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>

      <!-- Permisos de administrador -->
      <div v-if="!isAdmin" class="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <p class="text-yellow-800 dark:text-yellow-200">
            <strong>Nota:</strong> Solo los administradores pueden crear, editar o eliminar encuestas.
          </p>
        </div>
      </div>

      <!-- Surveys table -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Título
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Votos
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tipo
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Creada
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="survey in surveys" :key="survey.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ survey.title }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ survey.question }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getStatusClasses(survey.status)"
                  >
                    {{ getStatusText(survey.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ survey.total_votes }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ survey.is_multiple_choice ? 'Múltiple' : 'Única' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(survey.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div v-if="isAdmin" class="flex space-x-2">
                    <button
                      @click="editSurvey(survey)"
                      class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Editar
                    </button>
                    <button
                      @click="deleteSurvey(survey.id)"
                      class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Eliminar
                    </button>
                  </div>
                  <div v-else class="text-gray-400 dark:text-gray-500 text-xs">
                    Solo administradores
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div v-if="showCreateForm || editingSurvey" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {{ editingSurvey ? 'Editar Encuesta' : 'Crear Nueva Encuesta' }}
            </h3>
            
            <SurveyForm
              :survey="editingSurvey || undefined"
              @submit="handleFormSubmit"
              @cancel="closeForm"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSurveyStore } from '@/store/survey';
import { useAuthStore } from '@/store/auth';
import SurveyForm from '@/components/survey/SurveyForm.vue';
import type { Survey, SurveyCreateRequest, SurveyUpdateRequest } from '@/types/survey';

const surveyStore = useSurveyStore();
const authStore = useAuthStore();

// Estado local
const showCreateForm = ref(false);
const editingSurvey = ref<Survey | null>(null);
const permissionError = ref<string | null>(null);

// Computed properties
const surveys = computed(() => surveyStore.surveys);
const loading = computed(() => surveyStore.loading);
const error = computed(() => surveyStore.error || permissionError.value);

// Verificar si el usuario es administrador
const isAdmin = computed(() => {
  return authStore.isAuthenticated && authStore.user?.rol === 'administrador';
});

// Methods
const loadSurveys = async () => {
  await surveyStore.loadSurveys({ status: 'all', limit: 50 });
};

const getStatusClasses = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'inactive':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'completed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Activa';
    case 'inactive':
      return 'Inactiva';
    case 'completed':
      return 'Completada';
    default:
      return 'Desconocido';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const editSurvey = (survey: Survey) => {
  editingSurvey.value = survey;
};

const deleteSurvey = async (surveyId: number) => {
  if (!isAdmin.value) {
    permissionError.value = 'No tienes permisos de administrador para realizar esta acción';
    return;
  }
  
  if (confirm('¿Estás seguro de que quieres eliminar esta encuesta?')) {
    try {
      const result = await surveyStore.deleteSurvey(surveyId);
      if (result.success) {
        console.log('Encuesta eliminada exitosamente');
        permissionError.value = null;
      } else {
        console.error('Error eliminando encuesta:', result.message);
        if (result.message.includes('permiso') || result.message.includes('Forbidden')) {
          permissionError.value = 'No tienes permisos de administrador para eliminar encuestas';
        }
      }
    } catch (error) {
      console.error('Error eliminando encuesta:', error);
      permissionError.value = 'Error al eliminar la encuesta. Verifica tus permisos.';
    }
  }
};

const handleFormSubmit = async (formData: SurveyCreateRequest | SurveyUpdateRequest) => {
  try {
    if (editingSurvey.value) {
      // Actualizar encuesta existente
      const result = await surveyStore.updateSurvey(editingSurvey.value.id, formData as SurveyUpdateRequest);
      if (result.success) {
        console.log('Encuesta actualizada exitosamente');
        closeForm();
      } else {
        console.error('Error actualizando encuesta:', result.message);
      }
    } else {
      // Crear nueva encuesta
      const result = await surveyStore.createSurvey(formData as SurveyCreateRequest);
      if (result.success) {
        console.log('Encuesta creada exitosamente');
        closeForm();
      } else {
        console.error('Error creando encuesta:', result.message);
      }
    }
  } catch (error) {
    console.error('Error en el formulario:', error);
  }
};

const closeForm = () => {
  showCreateForm.value = false;
  editingSurvey.value = null;
};

// Lifecycle
onMounted(() => {
  if (!authStore.isAuthenticated) {
    permissionError.value = 'Debes iniciar sesión para acceder a esta página';
    return;
  }
  
  if (!isAdmin.value) {
    permissionError.value = 'Solo los administradores pueden acceder a esta página';
    return;
  }
  
  loadSurveys();
});
</script> 