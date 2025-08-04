<template>
  <div class="survey-view">
    <div class="max-w-4xl mx-auto px-4 py-6 pt-32" style="margin-top: 100px;">
      <!-- Header -->
      <div class="mb-8 mt-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Sorteos y Encuestas
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Participa en nuestros sorteos y comparte tu opinión
            </p>
          </div>
          
          <!-- Botón para administradores -->
          <div v-if="authStore.isAuthenticated && authStore.user?.rol === 'administrador'" class="flex items-center space-x-3">
            <router-link 
              to="/surveys/admin"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:scale-105 relative z-10"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Nueva Encuesta
            </router-link>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
          <nav class="flex space-x-1">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200"
              :class="activeTab === tab.id 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>

      <!-- Banner informativo -->
      <div class="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
              ¡Participa y gana!
            </h3>
            <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Completa las encuestas y participa en nuestros sorteos. Tu opinión es importante para nosotros.
            </p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="space-y-6">
        <!-- Encuestas activas -->
        <div v-if="activeTab === 'active'">
          <SurveyList 
            type="active" 
            :limit="10"
            @vote-success="handleVoteSuccess"
          />
        </div>

        <!-- Todas las encuestas -->
        <div v-else-if="activeTab === 'all'">
          <SurveyList 
            type="all" 
            :limit="20"
            @vote-success="handleVoteSuccess"
          />
        </div>

        <!-- Encuestas completadas -->
        <div v-else-if="activeTab === 'completed'">
          <SurveyList 
            type="completed" 
            :limit="20"
            @vote-success="handleVoteSuccess"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import SurveyList from '@/components/survey/SurveyList.vue';

const authStore = useAuthStore();

// Tabs configuration
const tabs = [
  { id: 'active', name: 'Encuestas Activas' },
  { id: 'all', name: 'Todas las Encuestas' },
  { id: 'completed', name: 'Encuestas Completadas' }
];

const activeTab = ref('active');

// Methods
const handleVoteSuccess = (surveyId: number) => {
  console.log('Voto exitoso en encuesta:', surveyId);
  // Aquí podrías mostrar una notificación o actualizar algo
};
</script> 