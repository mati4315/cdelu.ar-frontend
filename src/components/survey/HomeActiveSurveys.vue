<template>
  <div class="home-active-surveys">
    <!-- Encuesta principal (la más reciente) -->
    <div v-if="activeSurveys.length > 0" class="mb-4">
      <div class="survey-container">
        <!-- Header de la encuesta -->
        <div class="survey-header">
          <div class="active-badge">Activa</div>
          <div class="votes-total">{{ activeSurveys[0].total_votes || 0 }} votos totales</div>
        </div>

        <!-- Pregunta -->
        <h3 class="survey-title">
          {{ activeSurveys[0].question }}
        </h3>

        <!-- Opciones con votación directa (Estado 0: No ha votado) -->
        <div v-if="shouldShowVotingOptions(activeSurveys[0])" class="space-y-3 mb-4">
          <div 
            v-for="option in activeSurveys[0].options?.slice(0, 3)" 
            :key="option.id"
            class="voting-option"
            :class="{ 
              'opacity-50 cursor-not-allowed': voting === option.id,
              'border-green-500': justVoted === option.id
            }"
            @click="voting !== option.id && voteOption(option.id)"
          >
            <span class="voting-option-text">
              {{ option.option_text }}
            </span>
            <div class="flex items-center space-x-2">
              <span class="voting-option-count">
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

        <!-- Resultados con porcentajes y barras de progreso (Estado 1: Ya votó) -->
        <div v-else-if="shouldShowResults(activeSurveys[0])" class="space-y-3 mb-4">
          <div 
            v-for="(option, index) in activeSurveys[0].options?.slice(0, 3)" 
            :key="option.id"
            class="option-result"
          >
            <div class="option-header">
              <span class="option-text">{{ option.option_text }}</span>
              <span class="option-percentage">{{ calculatePercentage(option) }}%</span>
            </div>
            
            <div class="progress-bar-container">
              <div 
                class="progress-fill"
                :class="`option${index + 1}`"
                :style="{ 
                  width: `${calculatePercentage(option)}%`,
                  animation: 'slideIn 0.8s ease-out'
                }"
              ></div>
            </div>
            
            <div class="option-stats">
              <span class="votes-count">{{ option.votes_count || 0 }} votos</span>
            </div>
          </div>
        </div>

        <!-- Footer del survey -->
        <div class="survey-footer">
          <div v-if="shouldShowVotingOptions(activeSurveys[0])" class="flex items-center space-x-2 text-blue-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            <span class="text-sm font-medium">Selecciona tu respuesta</span>
          </div>
          <div v-else-if="shouldShowResults(activeSurveys[0])" class="results-footer">
            <div class="thanks-message">
              <svg class="thanks-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Gracias por participar</span>
            </div>
            <!-- Botón de actualización -->
            <button
              @click="refreshSurveyResults"
              :disabled="refreshing"
              class="refresh-results-btn"
              title="Actualizar resultados"
            >
              <svg 
                class="refresh-icon" 
                :class="{ 'animate-spin': refreshing }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span v-if="!refreshing">Actualizar</span>
              <span v-else>Actualizando...</span>
            </button>
          </div>
          <span class="text-xs text-gray-400">
            {{ getTimeRemaining(activeSurveys[0]) }}
            <span v-if="lastRefresh && shouldShowResults(activeSurveys[0])" class="last-update">
              • Actualizado {{ getLastUpdateTime() }}
            </span>
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
 
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSurveyStore } from '@/store/survey';
import { useAuthStore } from '@/store/auth';
import type { Survey, SurveyOption } from '@/types/survey';

const router = useRouter();
const surveyStore = useSurveyStore();

// Estado local
const voting = ref<number | null>(null);
const justVoted = ref<number | null>(null);
const userVotedSurveys = ref<Set<number>>(new Set());
const refreshing = ref(false);
const lastRefresh = ref<Date>(new Date());

// Computed properties
const activeSurveys = computed(() => {
  return surveyStore.activeSurveys.slice(0, 3); // Solo las primeras 3
});

// Métodos
const goToSurveys = () => {
  router.push('/surveys');
};

const hasUserVoted = (survey: Survey): boolean => {
  // Si el backend proporciona has_voted (sistema binario nuevo), usarlo
  if (survey.has_voted !== undefined) {
    return survey.has_voted;
  }
  
  // Si el backend proporciona user_voted (sistema actual), usarlo
  if (survey.user_voted !== undefined) {
    return survey.user_voted;
  }
  
  // Si el backend proporciona user_votes, verificar si tiene votos
  if (survey.user_votes && survey.user_votes.length > 0) {
    return true;
  }
  
  // Fallback para usuarios no autenticados
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  
  // Si el usuario NO está autenticado, solo confiar en localStorage
  if (!isAuthenticated) {
    const votedSurveys = localStorage.getItem('userVotedSurveys');
    if (votedSurveys) {
      const votedIds = JSON.parse(votedSurveys);
      return votedIds.includes(survey.id);
    }
    return false;
  }
  
  // Si el usuario SÍ está autenticado pero no hay datos del backend
  return false;
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
  
  // Si el backend proporciona el porcentaje, usarlo directamente
  if (option.percentage !== undefined && option.percentage !== null) {
    // Convertir a número si viene como string
    const percentage = typeof option.percentage === 'string' ? parseFloat(option.percentage) : option.percentage;
    return percentage;
  }
  
  // Fallback al cálculo local si el backend no proporciona porcentaje
  let totalVotes = survey.total_votes || 0;
  
  if (totalVotes === 0) {
    return 0;
  }
  
  const percentage = Math.round((option.votes_count / totalVotes) * 100);
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
      
      // Marcar la encuesta como votada INMEDIATAMENTE
      markSurveyAsVoted(survey.id);
      
      // Recargar datos del backend
      await surveyStore.reloadSurvey(survey.id);
      await surveyStore.loadActiveSurveys(3);
      
      // Verificar que el estado se actualizó correctamente
      if (activeSurveys.value.length > 0) {
        const updatedSurvey = activeSurveys.value[0];
      }
      
      // Limpiar confirmación después de 3 segundos
      setTimeout(() => {
        justVoted.value = null;
      }, 3000);
    } else {
      console.error('Error al votar:', result.message);
      // Mostrar mensaje de error más amigable
      if (result.message?.includes('límite') || result.message?.includes('limit')) {
        alert('Esta encuesta ha alcanzado su límite de participación. ¡Gracias por tu interés!');
      } else if (result.message?.includes('votado') || result.message?.includes('duplicate')) {
        alert('Ya has participado en esta encuesta anteriormente.');
      } else {
        alert(result.message || 'Error al votar');
      }
    }
  } catch (error) {
    console.error('Error al votar:', error);
    
    // Mensajes de error más informativos
    const errorMessage = error.message || 'Error desconocido';
    
    if (errorMessage.includes('límite') || errorMessage.includes('alcanzado')) {
      alert('⚠️ Esta encuesta ha alcanzado su límite de participación.\n\n💡 Solución: El administrador puede crear una nueva encuesta o aumentar el límite.');
    } else if (errorMessage.includes('votado') || errorMessage.includes('participado')) {
      alert('ℹ️ Ya has participado en esta encuesta.\n\nSolo puedes votar una vez por encuesta.');
    } else if (errorMessage.includes('servidor') || errorMessage.includes('500')) {
      alert('🔧 Problema técnico detectado.\n\n💡 Posibles causas:\n• La encuesta alcanzó su límite\n• Ya has votado anteriormente\n• Problema temporal del servidor\n\nIntenta refrescar la página o contacta al administrador.');
    } else {
      alert(`❌ Error al votar: ${errorMessage}\n\nSi el problema persiste, contacta al administrador.`);
    }
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

const getLastUpdateTime = () => {
  if (!lastRefresh.value) return 'Nunca';
  const now = new Date();
  const diff = now.getTime() - lastRefresh.value.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  return `${days} día${days > 1 ? 's' : ''}`;
};

const shouldShowVotingOptions = (survey: Survey): boolean => {
  if (!survey) return false;
  
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  
  // Para usuarios NO autenticados (anónimos/invitados)
  if (!isAuthenticated) {
    console.log('🔍 [GUEST DEBUG] Usuario NO autenticado detectado');
    console.log('🔍 [GUEST DEBUG] Survey data:', {
      id: survey.id,
      has_voted: survey.has_voted,
      user_voted: survey.user_voted,
      show_options: survey.show_options,
      user_votes: survey.user_votes
    });
    
    // Solo verificar localStorage para usuarios invitados
    const votedSurveys = localStorage.getItem('userVotedSurveys');
    console.log('🔍 [GUEST DEBUG] localStorage userVotedSurveys:', votedSurveys);
    
    if (votedSurveys) {
      try {
        const votedIds = JSON.parse(votedSurveys);
        const hasVotedLocally = Array.isArray(votedIds) && votedIds.includes(survey.id);
        console.log('🔍 [GUEST DEBUG] hasVotedLocally:', hasVotedLocally, 'votedIds:', votedIds);
        return !hasVotedLocally; // Mostrar opciones solo si NO ha votado
      } catch (error) {
        localStorage.removeItem('userVotedSurveys');
        console.log('🔍 [GUEST DEBUG] localStorage corrupto, permitiendo votar');
        return true; // Si hay error, permitir votar
      }
    }
    console.log('🔍 [GUEST DEBUG] No hay localStorage, permitiendo votar');
    return true; // Si no hay localStorage, permitir votar
  }
  
  // Para usuarios autenticados - CONFIAR EN EL BACKEND
  
  // 1. Si el backend dice explícitamente que ya votó
  if (survey.has_voted === true || survey.user_voted === true) {
    return false; // Ya votó - mostrar resultados
  }
  
  // 2. Si hay datos de votación en user_votes
  if (survey.user_votes && survey.user_votes.length > 0) {
    return false; // Ya votó - mostrar resultados
  }
  
  // 3. Si el backend dice explícitamente que no mostrar opciones
  if (survey.show_options === false) {
    return false; // Backend dice no mostrar opciones
  }
  
  // 4. Verificar localStorage como respaldo
  const votedSurveys = localStorage.getItem('userVotedSurveys');
  if (votedSurveys) {
    try {
      const votedIds = JSON.parse(votedSurveys);
      if (Array.isArray(votedIds) && votedIds.includes(survey.id)) {
        return false; // Ya votó según localStorage
      }
    } catch (error) {
      localStorage.removeItem('userVotedSurveys');
    }
  }
  
  // Por defecto: permitir votar si no hay evidencia de voto previo
  return true;
};

const shouldShowResults = (survey: Survey): boolean => {
  return !shouldShowVotingOptions(survey);
};

// Función para actualizar los resultados de la encuesta
const refreshSurveyResults = async () => {
  if (!activeSurveys.value[0] || refreshing.value) return;
  
  try {
    refreshing.value = true;
    
    const survey = activeSurveys.value[0];
    
    // Recargar los datos específicos de esta encuesta
    await surveyStore.reloadSurvey(survey.id);
    
    // Recargar la lista de encuestas activas
    await surveyStore.loadActiveSurveys(3);
    
    lastRefresh.value = new Date();
    
  } catch (error) {
    console.error('❌ Error al actualizar resultados:', error);
  } finally {
    refreshing.value = false;
  }
};

// Función para manejar cuando la página se vuelve visible
const handleVisibilityChange = () => {
  if (!document.hidden && activeSurveys.value.length > 0) {
    const timeSinceLastRefresh = new Date().getTime() - lastRefresh.value.getTime();
    
    // Solo actualizar si han pasado más de 30 segundos desde la última actualización
    if (timeSinceLastRefresh > 30000) {
      refreshSurveyResults();
    }
  }
};

// Función para limpiar localStorage corrupto
const clearVotedSurveys = () => {
  localStorage.removeItem('userVotedSurveys');
  // Forzar re-render
  const survey = activeSurveys.value[0];
  if (survey) {
    surveyStore.loadActiveSurveys(3);
  }
};

// Cargar encuestas activas al montar el componente
onMounted(async () => {
  if (surveyStore.activeSurveys.length === 0) {
    await surveyStore.loadActiveSurveys(3);
  }
  
  // Agregar listener para visibilidad de la página
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Funciones de debug disponibles solo en desarrollo
  if (import.meta.env.DEV) {
    (window as any).clearSurveyVotes = clearVotedSurveys;
    (window as any).debugSurveyState = () => {
      const survey = activeSurveys.value[0];
      if (survey) {
        console.log('🔍 Estado actual:', {
          survey: survey,
          shouldShowOptions: shouldShowVotingOptions(survey),
          localStorage: localStorage.getItem('userVotedSurveys'),
          isAuthenticated: useAuthStore().isAuthenticated
        });
      }
    };
  }
});

// Limpiar listeners al desmontar
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<style scoped>
.home-active-surveys {
  @apply w-full;
}

/* Contenedor principal del survey */
.survey-container {
  background-color: #161b22;
  padding: 10px 10px 20px 10px;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
  border: 1px solid #30363d;
}

/* Header del survey */
.survey-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* Título del survey */
.survey-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 5px;
  text-align: center;
  color: #58a6ff;
  line-height: 1.3;
}

/* Contador de votos totales */
.votes-total {
  text-align: center;
  font-size: 1.2rem;
  color: #79c0ff;
  font-weight: 600;
}

/* Badge de estado activo */
.active-badge {
  background-color: #238636;
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  display: inline-block;
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

/* Estilos para el Estado 1 - Resultados */
.option-result {
  margin-bottom: 0px;
  padding: 10px;
  background-color: #1c2128;
  border-radius: 12px;
  border: 1px solid #30363d;
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.option-text {
  font-size: 1.1rem;
  font-weight: bold;
  color: #e6edf3;
}

.option-percentage {
  font-size: 1.1rem;
  font-weight: bold;
  color: #58a6ff;
}

.progress-bar-container {
  background-color: #21262d;
  border-radius: 10px;
  overflow: hidden;
  height: 20px;
  box-shadow: inset 0 0 5px #000;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: #fff;
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 10px;
  transition: width 0.6s ease;
  position: relative;
}

/* Colores personalizados para cada opción */
.option1 {
  background: linear-gradient(90deg, #00ff88, #00cc66);
}

.option2 {
  background: linear-gradient(90deg, #3399ff, #3366ff);
}

.option3 {
  background: linear-gradient(90deg, #ff9933, #ff6600);
}

.option-stats {
  display: flex;
  justify-content: flex-end;
}

.votes-count {
  font-size: 0.9rem;
  color: #79c0ff;
  font-weight: 500;
}

/* Animación de entrada para las barras */
@keyframes slideIn {
  from {
    width: 0%;
  }
  to {
    width: var(--final-width);
  }
}

/* Footer del survey */
.survey-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #30363d;
}

/* Footer para resultados con botón de actualización */
.results-footer {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

/* Estilos para el mensaje de agradecimiento */
.thanks-message {
  background-color: #238636;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: bold;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.9rem;
}

.thanks-icon {
  width: 14px;
  height: 14px;
}

/* Botón de actualización */
.refresh-results-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background-color: #21262d;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #79c0ff;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-results-btn:hover:not(:disabled) {
  background-color: #30363d;
  border-color: #58a6ff;
  color: #58a6ff;
}

.refresh-results-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-results-btn .refresh-icon {
  width: 14px;
  height: 14px;
}

/* Animación de rotación para el icono */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Indicador de última actualización */
.last-update {
  opacity: 0.7;
  font-style: italic;
}

/* Estilos para opciones de votación (Estado 0) */
.voting-option {
  margin-bottom: 15px;
  padding: 15px;
  background-color: #1c2128;
  border-radius: 12px;
  border: 1px solid #30363d;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.voting-option:hover {
  background-color: #21262d;
  border-color: #58a6ff;
}

.voting-option:active {
  transform: scale(0.98);
}

.voting-option-text {
  font-size: 1.1rem;
  font-weight: bold;
  color: #e6edf3;
}

.voting-option-count {
  font-size: 0.9rem;
  color: #79c0ff;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 640px) {
  .survey-container {
    padding: 20px;
  }
  
  .survey-title {
    font-size: 1.5rem;
  }
  
  .option-result,
  .voting-option {
    padding: 12px;
  }
  
  .option-text,
  .voting-option-text {
    font-size: 1rem;
  }
  
  .option-percentage {
    font-size: 1rem;
  }
  
  .progress-bar-container {
    height: 16px;
  }
  
  .survey-footer {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .results-footer {
    flex-direction: column;
    gap: 8px;
    align-items: center;
    width: 100%;
  }
  
  .refresh-results-btn {
    font-size: 0.75rem;
    padding: 5px 8px;
  }
  
  .thanks-message {
    font-size: 0.8rem;
    padding: 6px 10px;
  }
}
</style> 