<template>
  <div class="feed-survey-item">
    <div class="survey-card bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <!-- Header de la encuesta -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <span class="text-2xl">📊</span>
            <span class="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded-full">
              Encuesta
            </span>
          </div>
          <span 
            class="px-2 py-1 text-xs font-medium rounded-full"
            :class="statusClasses"
          >
            {{ statusText }}
          </span>
        </div>
        
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {{ survey.title }}
        </h3>
        
        <p v-if="survey.description" class="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {{ survey.description }}
        </p>
        
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
        <div v-if="!survey.user_voted && canVote" class="space-y-3">
          <!-- Opciones para votar -->
          <div 
            v-for="option in survey.options" 
            :key="option.id"
            class="option-item"
          >
            <label 
              class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900/20': selectedOptions.includes(option.id) }"
            >
              <input
                :type="survey.is_multiple_choice ? 'checkbox' : 'radio'"
                :name="`survey-${survey.id}`"
                :value="option.id"
                v-model="selectedOptions"
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
        <div v-else-if="survey.user_voted" class="space-y-3">
          <div 
            v-for="option in survey.options" 
            :key="option.id"
            class="result-item"
          >
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="text-gray-900 dark:text-white">{{ option.option_text }}</span>
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ option.votes_count }} votos
                </span>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  ({{ calculatePercentage(option) }}%)
                </span>
              </div>
            </div>
            
            <!-- Barra de progreso -->
            <div class="mt-2 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${calculatePercentage(option)}%` }"
              ></div>
            </div>
          </div>
          
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
            Ya votaste en esta encuesta
          </p>
        </div>

        <!-- Encuesta inactiva -->
        <div v-else class="text-center py-4">
          <p class="text-gray-500 dark:text-gray-400">
            Esta encuesta no está disponible para votar
          </p>
        </div>
      </div>

      <!-- Footer con acciones -->
      <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{{ formatDate(survey.created_at) }}</span>
          <button 
            @click="$emit('view-details', survey)"
            class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Ver detalles
          </button>
        </div>
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
const emit = defineEmits<{
  'view-details': [survey: Survey];
}>();

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

const canSubmitVote = computed(() => {
  if (selectedOptions.value.length === 0) return false;
  
  const maxVotes = props.survey.is_multiple_choice 
    ? props.survey.max_votes_per_user 
    : 1;
    
  return selectedOptions.value.length <= maxVotes;
});

// Métodos
const calculatePercentage = (option: SurveyOption): number => {
  if (props.survey.total_votes === 0) return 0;
  return Math.round((option.votes_count / props.survey.total_votes) * 100);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const handleVote = async () => {
  if (!canSubmitVote.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const result = await surveyStore.voteSurvey(props.survey.id, {
      option_ids: selectedOptions.value
    });
    
    if (result.success) {
      // Limpiar selección
      selectedOptions.value = [];
      // Mostrar notificación de éxito (opcional)
      console.log('Voto registrado exitosamente');
    } else {
      error.value = result.message;
    }
  } catch (err) {
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
</style> 