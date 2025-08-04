<template>
  <div class="survey-form">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Pregunta -->
      <div>
        <label for="question" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Pregunta *
        </label>
        <input
          id="question"
          v-model="form.question"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Ej: ¿Qué deporte prefieres ver?"
        />
      </div>

      <!-- Opciones -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Opciones de respuesta *
        </label>
        <div class="space-y-2">
          <div 
            v-for="(option, index) in form.options" 
            :key="index"
            class="flex items-center space-x-2"
          >
            <input
              v-model="form.options[index]"
              type="text"
              required
              class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              :placeholder="`Opción ${index + 1}`"
            />
            <button
              v-if="form.options.length > 2"
              @click="removeOption(index)"
              type="button"
              class="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <button
          v-if="form.options.length < 10"
          @click="addOption"
          type="button"
          class="mt-2 px-4 py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
        >
          + Agregar opción
        </button>
      </div>

      <!-- Configuración -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Tipo de selección -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de selección
          </label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="form.is_multiple_choice"
                type="radio"
                :value="false"
                class="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">Selección única</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="form.is_multiple_choice"
                type="radio"
                :value="true"
                class="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">Selección múltiple</span>
            </label>
          </div>
        </div>

        <!-- Máximo de votos -->
        <div v-if="form.is_multiple_choice">
          <label for="max_votes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Máximo de votos por usuario
          </label>
          <input
            id="max_votes"
            v-model.number="form.max_votes_per_user"
            type="number"
            min="1"
            max="10"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <!-- Duración de la encuesta -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Duración de la encuesta *
        </label>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="duration_hours" class="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Horas
            </label>
            <input
              id="duration_hours"
              v-model.number="form.duration_hours"
              type="number"
              min="0"
              max="168"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="0"
            />
          </div>
          <div>
            <label for="duration_minutes" class="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Minutos
            </label>
            <input
              id="duration_minutes"
              v-model.number="form.duration_minutes"
              type="number"
              min="0"
              max="59"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="0"
            />
          </div>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          La encuesta estará activa durante este tiempo
        </p>
      </div>

      <!-- Estado (solo para edición) -->
      <div v-if="isEditing">
        <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Estado
        </label>
        <select
          id="status"
          v-model="form.status"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="active">Activa</option>
          <option value="inactive">Inactiva</option>
          <option value="completed">Completada</option>
        </select>
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" class="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
        <p class="text-red-700 dark:text-red-400 text-sm">{{ error }}</p>
      </div>

      <!-- Botones -->
      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('cancel')"
          type="button"
          class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="loading || !isFormValid"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="loading">{{ isEditing ? 'Actualizando...' : 'Creando...' }}</span>
          <span v-else>{{ isEditing ? 'Actualizar' : 'Crear' }} encuesta</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSurveyStore } from '@/store/survey';
import type { Survey, SurveyCreateRequest, SurveyUpdateRequest } from '@/types/survey';

interface Props {
  survey?: Survey; // Para edición
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'submit': [data: SurveyCreateRequest | SurveyUpdateRequest];
  'cancel': [];
}>();

const surveyStore = useSurveyStore();

// Estado del formulario
const form = ref({
  question: '',
  options: ['', ''], // Mínimo 2 opciones
  is_multiple_choice: false,
  max_votes_per_user: 1,
  duration_hours: 1,
  duration_minutes: 0,
  status: 'active' as 'active' | 'inactive' | 'completed'
});

const loading = ref(false);
const error = ref<string | null>(null);

// Computed properties
const isEditing = computed(() => !!props.survey);

const isFormValid = computed(() => {
  return form.value.question.trim() !== '' &&
         form.value.options.length >= 2 &&
         form.value.options.every(option => option.trim() !== '') &&
         (!form.value.is_multiple_choice || form.value.max_votes_per_user >= 1) &&
         (form.value.duration_hours > 0 || form.value.duration_minutes > 0);
});

// Methods
const addOption = () => {
  if (form.value.options.length < 10) {
    form.value.options.push('');
  }
};

const removeOption = (index: number) => {
  if (form.value.options.length > 2) {
    form.value.options.splice(index, 1);
  }
};

const handleSubmit = async () => {
  if (!isFormValid.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // Calcular la fecha de expiración basada en la duración
    const now = new Date();
    const totalMinutes = (form.value.duration_hours * 60) + form.value.duration_minutes;
    const expiresAt = new Date(now.getTime() + totalMinutes * 60 * 1000);
    
    const formData = {
      question: form.value.question.trim(),
      options: form.value.options.filter(option => option.trim() !== ''),
      is_multiple_choice: form.value.is_multiple_choice,
      max_votes_per_user: form.value.max_votes_per_user,
      expires_at: expiresAt.toISOString(),
      ...(isEditing.value && { status: form.value.status })
    };
    
    emit('submit', formData);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error en el formulario';
  } finally {
    loading.value = false;
  }
};

// Inicializar formulario para edición
onMounted(() => {
  if (props.survey) {
    // Calcular duración desde la fecha de expiración
    let durationHours = 1;
    let durationMinutes = 0;
    
    if (props.survey.expires_at) {
      const now = new Date();
      const expiresAt = new Date(props.survey.expires_at);
      const diffMs = expiresAt.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      durationHours = Math.floor(diffMinutes / 60);
      durationMinutes = diffMinutes % 60;
    }
    
    form.value = {
      question: props.survey.question,
      options: props.survey.options.map(option => option.option_text),
      is_multiple_choice: props.survey.is_multiple_choice,
      max_votes_per_user: props.survey.max_votes_per_user,
      duration_hours: durationHours,
      duration_minutes: durationMinutes,
      status: props.survey.status
    };
  }
});
</script> 