<template>
  <div class="home-active-surveys">
    <!-- Encuesta principal (la más reciente) -->
    <div v-if="activeSurveys.length > 0" class="mb-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <!-- Header de la encuesta -->
      
          <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {{ activeSurveys[0].total_votes || 0 }} votos
          </span>
    

        <!-- Pregunta -->
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 line-clamp-2">
          {{ activeSurveys[0].question }}
        </h3>

        <!-- Opciones con votación directa -->
        <div v-if="!hasUserVoted(activeSurveys[0])" class="space-y-2 mb-4">
          <div 
            v-for="option in activeSurveys[0].options?.slice(0, 3)" 
            :key="option.id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            :class="{ 
              'opacity-50 cursor-not-allowed': voting === option.id,
              'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700': justVoted === option.id
            }"
            @click="voting !== option.id && voteOption(option.id)"
          >
            <span class="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
              {{ option.option_text }}
            </span>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ option.votes_count || 0 }}
              </span>
              <div v-if="voting === option.id" class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div v-else-if="justVoted === option.id" class="w-4 h-4 text-green-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
          </div>
          <div v-if="(activeSurveys[0].options?.length || 0) > 3" class="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
            +{{ (activeSurveys[0].options?.length || 0) - 3 }} más opciones
          </div>
        </div>

        <!-- Resultados si ya votó -->
        <div v-else class="space-y-2 mb-4">
          <div 
            v-for="option in activeSurveys[0].options?.slice(0, 3)" 
            :key="option.id"
            class="relative flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden"
          >
            <!-- Barra de progreso como fondo -->
            <div 
              class="absolute inset-0 bg-blue-500 opacity-30 transition-all duration-1000 ease-out"
              :style="{ 
                width: `${calculatePercentage(option)}%`,
                animation: 'fadeIn 0.5s ease-out'
              }"
            ></div>
            
            <!-- Contenido sobre la barra -->
            <div class="relative z-10 flex items-center justify-between w-full">
              <span class="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                {{ option.option_text }}
              </span>
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ option.votes_count || 0 }}
                </span>
                <span class="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {{ calculatePercentage(option) }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón de acción -->
        <div class="flex items-center justify-between">
          <div v-if="!hasUserVoted(activeSurveys[0])" class="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            <span class="text-sm font-medium">Selecciona tu respuesta</span>
          </div>
          <div v-else class="flex items-center space-x-2 text-green-600 dark:text-green-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-sm font-medium">Gracias por participar</span>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ getTimeRemaining(activeSurveys[0]) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Botón "Ver más encuestas" si hay más de una -->
    <div v-if="activeSurveys.length > 1" class="text-center">
      <button 
        @click="goToSurveys"
        class="inline-flex items-center space-x-3 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <span class="text-sm font-medium">Ver más encuestas</span>
        <span class="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
          {{ activeSurveys.length - 1 }}
        </span>
      </button>
    </div>

    <!-- Estado vacío -->
    <div v-else>
      <div class="text-gray-400 dark:text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p class="text-sm">No hay encuestas activas</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSurveyStore } from '@/store/survey';
import type { Survey, SurveyOption } from '@/types/survey';

const router = useRouter();
const surveyStore = useSurveyStore();

// Estado local
const voting = ref<number | null>(null);
const justVoted = ref<number | null>(null);
const userVotedSurveys = ref<Set<number>>(new Set());

// Computed properties
const activeSurveys = computed(() => {
  return surveyStore.activeSurveys.slice(0, 3); // Solo las primeras 3
});

// Métodos
const goToSurveys = () => {
  router.push('/surveys');
};

const hasUserVoted = (survey: Survey): boolean => {
  // Verificar en localStorage primero
  const votedSurveys = localStorage.getItem('userVotedSurveys');
  if (votedSurveys) {
    const votedIds = JSON.parse(votedSurveys);
    if (votedIds.includes(survey.id)) {
      return true;
    }
  }
  
  // Verificar en los datos del backend
  return survey.user_voted === true || 
         (survey.user_votes && survey.user_votes.length > 0) ||
         false;
};

const markSurveyAsVoted = (surveyId: number) => {
  // Agregar a localStorage
  const votedSurveys = localStorage.getItem('userVotedSurveys');
  let votedIds = votedSurveys ? JSON.parse(votedSurveys) : [];
  if (!votedIds.includes(surveyId)) {
    votedIds.push(surveyId);
    localStorage.setItem('userVotedSurveys', JSON.stringify(votedIds));
  }
  
  // Agregar al estado local
  userVotedSurveys.value.add(surveyId);
};

const calculatePercentage = (option: SurveyOption): number => {
  const survey = activeSurveys.value[0];
  if (!survey) return 0;
  
  console.log('🔍 Calculando porcentaje para:', option.option_text);
  console.log('   - Votos de la opción:', option.votes_count);
  console.log('   - Porcentaje del backend:', option.percentage);
  console.log('   - Total de votos del survey:', survey.total_votes);
  
  // Si el backend proporciona el porcentaje, usarlo directamente
  if (option.percentage !== undefined && option.percentage !== null) {
    console.log('   - Usando porcentaje del backend:', option.percentage + '%');
    return option.percentage;
  }
  
  // Fallback al cálculo local si el backend no proporciona porcentaje
  let totalVotes = survey.total_votes || 0;
  
  if (totalVotes === 0) {
    console.log('   - No hay votos totales, 0%');
    return 0;
  }
  
  const percentage = Math.round((option.votes_count / totalVotes) * 100);
  console.log('   - Porcentaje calculado localmente:', percentage + '%');
  return percentage;
};

const voteOption = async (optionId: number) => {
  if (!activeSurveys.value[0]) return;
  
  const survey = activeSurveys.value[0];
  voting.value = optionId;
  
  try {
    const result = await surveyStore.voteSurvey(survey.id, {
      option_ids: [optionId]
    });
    
    if (result.success) {
      // Mostrar confirmación temporal
      justVoted.value = optionId;
      markSurveyAsVoted(survey.id); // Marcar la encuesta como votada
      
      // Recargar la encuesta para mostrar resultados
      await surveyStore.reloadSurvey(survey.id);
      console.log('✅ Voto registrado exitosamente');
      
      // Limpiar confirmación después de 3 segundos
      setTimeout(() => {
        justVoted.value = null;
      }, 3000);
    } else {
      console.log('Error al votar:', result.message);
      // Mostrar error temporal
      alert(result.message || 'Error al votar');
    }
  } catch (error) {
    console.error('Error al votar:', error);
    alert('Error al votar. Por favor, intenta nuevamente.');
  } finally {
    voting.value = null;
  }
};

const getTimeRemaining = (survey: Survey): string => {
  if (!survey.expires_at) return 'Sin límite de tiempo';
  
  const now = new Date();
  const expires = new Date(survey.expires_at);
  const diff = expires.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expirada';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} día${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

// Cargar encuestas activas al montar el componente
onMounted(async () => {
  console.log('🔄 Cargando encuestas activas...');
  if (surveyStore.activeSurveys.length === 0) {
    await surveyStore.loadActiveSurveys(3);
  }
  console.log('📊 Encuestas activas cargadas:', surveyStore.activeSurveys.length);
  if (activeSurveys.value.length > 0) {
    const survey = activeSurveys.value[0];
    console.log('📋 Primera encuesta (BACKEND ARREGLADO):', {
      id: survey.id,
      question: survey.question,
      total_votes: survey.total_votes,
      user_voted: survey.user_voted,
      user_votes: survey.user_votes,
      options: survey.options?.map(opt => ({
        id: opt.id,
        text: opt.option_text,
        votes: opt.votes_count,
        percentage: opt.percentage
      }))
    });
  }
});
</script>

<style scoped>
.home-active-surveys {
  @apply w-full;
}

/* Animación suave para el contador */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

/* Line clamp para truncar texto */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Animación para las barras de progreso */
@keyframes slideIn {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.3;
  }
}

/* Hover effects */
.home-active-surveys button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Transiciones suaves */
.home-active-surveys * {
  transition: all 0.2s ease-in-out;
}
</style> 