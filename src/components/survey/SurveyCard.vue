<template>
  <div class="survey-card bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Header de la encuesta -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-2">
        <span 
          class="px-2 py-1 text-xs font-medium rounded-full"
          :class="statusClasses"
        >
          {{ statusText }}
        </span>
      </div>
      
      <p class="text-base font-medium text-gray-900 dark:text-white">
        {{ survey.question }}
      </p>
      
      <div class="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
        <span>{{ survey.total_votes }} votos</span>
        <span>{{ survey.options_count }} opciones</span>
      </div>
    </div>

    <!-- Opciones de la encuesta -->
    <div class="p-4">
      <div v-if="!hasUserVoted && canVote" class="space-y-3">
        <!-- Opciones para votar -->
        <div 
          v-for="option in survey.options" 
          :key="option.id"
          class="option-item"
        >
          <label 
            class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900/20': isOptionSelected(option.id) }"
          >
            <input
              :type="survey.is_multiple_choice ? 'checkbox' : 'radio'"
              :name="`survey-${survey.id}`"
              :value="option.id"
              :checked="isOptionSelected(option.id)"
              @change="handleOptionChange(option.id)"
              class="mr-3 text-blue-600 focus:ring-blue-500"
              :disabled="loading"
            />
            <span class="text-gray-900 dark:text-white">{{ option.option_text }}</span>
          </label>
        </div>
        
        <!-- Botón de votar -->
        <button
          @click="handleVote"
          :disabled="!canSubmitVote || loading"
          class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="loading">Votando...</span>
          <span v-else>Votar</span>
        </button>
        
        <!-- Mensaje de error -->
        <p v-if="error" class="text-red-600 dark:text-red-400 text-sm mt-2">
          {{ error }}
        </p>
      </div>

      <!-- Resultados si ya votó -->
      <div v-else-if="hasUserVoted" class="space-y-4">
        <!-- Total de votos -->
        <div class="text-center mb-4">
          <p class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ getRealTotalVotes() }} votos
          </p>
        </div>
        
        <!-- Opciones con resultados -->
        <div class="space-y-3">
          <div 
            v-for="(option, index) in survey.options" 
            :key="option.id"
            class="result-item bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            :style="{ '--index': index }"
          >
            <!-- Opción y porcentaje -->
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-900 dark:text-white font-medium">
                {{ option.option_text }}
              </span>
              <div class="flex items-center space-x-2">
                <div 
                  class="w-3 h-3 rounded-full"
                  :class="{
                    'bg-blue-500': calculatePercentage(option) <= 25,
                    'bg-green-500': calculatePercentage(option) > 25 && calculatePercentage(option) <= 50,
                    'bg-yellow-500': calculatePercentage(option) > 50 && calculatePercentage(option) <= 75,
                    'bg-red-500': calculatePercentage(option) > 75
                  }"
                ></div>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ calculatePercentage(option) }}%
                </span>
              </div>
            </div>
            
            <!-- Barra de progreso -->
            <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
              <div 
                class="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out transform origin-left"
                :style="{ 
                  width: `${calculatePercentage(option)}%`,
                  transform: 'scaleX(0)',
                  animation: 'slideIn 1s ease-out forwards'
                }"
              ></div>
            </div>
            
            <!-- Votos -->
            <div class="flex justify-between items-center mt-2">
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ option.votes_count }} votos
              </span>
            </div>
          </div>
        </div>
        
        <!-- Mensaje de confirmación -->
        <div class="text-center mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p class="text-sm text-green-700 dark:text-green-400 font-medium">
            ✅ Gracias por participar en esta encuesta
          </p>
        </div>
      </div>

      <!-- Encuesta inactiva -->
      <div v-else class="text-center py-4">
        <p class="text-gray-500 dark:text-gray-400">
          Esta encuesta no está disponible para votar
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSurveyStore } from '@/store/survey';
import { surveyService } from '@/services/surveyService';
import type { Survey, SurveyOption } from '@/types/survey';

interface Props {
  survey: Survey;
}

const props = defineProps<Props>();
const surveyStore = useSurveyStore();

// Estado local
const selectedOptions = ref<number[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Computed properties
const statusClasses = computed(() => {
  switch (props.survey.status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'inactive':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'completed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
});

const statusText = computed(() => {
  switch (props.survey.status) {
    case 'active':
      return 'Activa';
    case 'inactive':
      return 'Inactiva';
    case 'completed':
      return 'Completada';
    default:
      return 'Desconocido';
  }
});

const canVote = computed(() => {
  return surveyService.canUserVote(props.survey);
});

const hasUserVoted = computed(() => {
  console.log('🔍 Verificando si el usuario ya votó:');
  console.log('   - user_voted:', props.survey.user_voted);
  console.log('   - user_votes:', props.survey.user_votes);
  console.log('   - user_votes length:', props.survey.user_votes?.length);
  
  // Verificar si el usuario ya votó de múltiples formas
  const hasVoted = props.survey.user_voted === true || 
                   (props.survey.user_votes && props.survey.user_votes.length > 0) ||
                   (props.survey.user_voted !== undefined && props.survey.user_voted !== false);
  
  console.log('   - Resultado hasUserVoted:', hasVoted);
  return hasVoted;
});

const canSubmitVote = computed(() => {
  if (selectedOptions.value.length === 0) return false;
  
  const maxVotes = props.survey.is_multiple_choice 
    ? props.survey.max_votes_per_user 
    : 1;
    
  return selectedOptions.value.length <= maxVotes;
});

// Métodos
const getRealTotalVotes = (): number => {
  // Si el backend proporciona total_votes, usarlo
  if (props.survey.total_votes > 0) {
    return props.survey.total_votes;
  }
  
  // Si el usuario ya votó pero total_votes es 0, usar user_votes
  if (props.survey.user_votes && props.survey.user_votes.length > 0) {
    return props.survey.user_votes.length;
  }
  
  // Calcular sumando los votos de todas las opciones
  if (props.survey.options) {
    return props.survey.options.reduce((total, option) => total + option.votes_count, 0);
  }
  
  return 0;
};

const calculatePercentage = (option: SurveyOption): number => {
  console.log('🔍 Calculando porcentaje para opción:', option.option_text);
  console.log('   - Votos de la opción:', option.votes_count);
  console.log('   - Total de votos de la encuesta:', props.survey.total_votes);
  
  const realTotalVotes = getRealTotalVotes();
  console.log('   - Total de votos real:', realTotalVotes);
  
  // Si el usuario ya votó pero total_votes es 0, calcular basado en user_votes
  if (props.survey.total_votes === 0 && props.survey.user_votes && props.survey.user_votes.length > 0) {
    console.log('   - Usuario ya votó pero total_votes es 0, calculando basado en user_votes');
    const userVoteCount = props.survey.user_votes.length;
    const isUserVote = props.survey.user_votes.includes(option.id);
    const percentage = isUserVote ? Math.round((1 / userVoteCount) * 100) : 0;
    console.log('   - Resultado (basado en user_votes):', percentage + '%');
    return percentage;
  }
  
  if (realTotalVotes === 0) {
    console.log('   - Resultado: 0% (no hay votos totales)');
    return 0;
  }
  
  const percentage = Math.round((option.votes_count / realTotalVotes) * 100);
  console.log('   - Resultado:', percentage + '%');
  return percentage;
};

const isOptionSelected = (optionId: number): boolean => {
  return selectedOptions.value.includes(optionId);
};

const handleOptionChange = (optionId: number) => {
  if (props.survey.is_multiple_choice) {
    // Para checkboxes (selección múltiple)
    const index = selectedOptions.value.indexOf(optionId);
    if (index > -1) {
      selectedOptions.value.splice(index, 1);
    } else {
      selectedOptions.value.push(optionId);
    }
  } else {
    // Para radio buttons (selección única)
    selectedOptions.value = [optionId];
  }
};

const handleVote = async () => {
  if (!canSubmitVote.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    console.log('Enviando voto:', {
      surveyId: props.survey.id,
      optionIds: selectedOptions.value,
      survey: props.survey
    });
    
    const result = await surveyStore.voteSurvey(props.survey.id, {
      option_ids: selectedOptions.value
    });
    
    if (result.success) {
      // Limpiar selección
      selectedOptions.value = [];
      console.log('Voto registrado exitosamente');
      
      // Recargar los datos de la encuesta inmediatamente
      console.log('🔄 Recargando datos de la encuesta...');
      await surveyStore.reloadSurvey(props.survey.id);
      
    } else {
      // Si el usuario ya votó, no mostrar error, solo los resultados
      if (result.message?.includes('Ya has votado')) {
        console.log('Usuario ya votó, mostrando resultados');
        // Recargar los datos de la encuesta para mostrar resultados actualizados
        await surveyStore.reloadSurvey(props.survey.id);
      } else if (result.message?.includes('Debes estar logueado')) {
        error.value = 'Debes estar logueado para votar en las encuestas';
        console.log('Usuario no autenticado, redirigir al login');
        // Aquí podrías redirigir al login o mostrar un modal de login
      } else {
        error.value = result.message || 'Error al registrar el voto. Por favor, intenta nuevamente.';
      }
    }
  } catch (err) {
    console.error('Error completo:', err);
    error.value = err instanceof Error ? err.message : 'Error al votar';
  } finally {
    loading.value = false;
  }
};

// Inicializar con votos previos si existen
onMounted(() => {
  if (props.survey.user_votes && props.survey.user_votes.length > 0) {
    selectedOptions.value = [...props.survey.user_votes];
  }
});
</script>

<style scoped>
.option-item label:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-item {
  transition: all 0.3s ease;
}

.result-item:hover {
  transform: translateY(-1px);
}

@keyframes slideIn {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Animación para las barras de progreso */
.result-item .h-3 {
  animation: slideIn 1s ease-out forwards;
  animation-delay: calc(var(--index, 0) * 0.2s);
}

/* Efecto de pulso para las barras con alto porcentaje */
.result-item .h-3[style*="width: 100%"] {
  animation: slideIn 1s ease-out forwards, pulse 2s ease-in-out infinite;
  animation-delay: calc(var(--index, 0) * 0.2s);
}
</style> 