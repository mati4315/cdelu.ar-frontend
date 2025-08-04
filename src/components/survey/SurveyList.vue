<template>
  <div class="survey-list">
    <!-- Loading state -->
    <div v-if="loading" class="space-y-4">
      <div 
        v-for="i in 3" 
        :key="i"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
      >
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div class="space-y-2">
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-600 dark:text-red-400 mb-2">
        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
      </div>
      <p class="text-gray-600 dark:text-gray-400">{{ error }}</p>
      <button 
        @click="loadSurveys"
        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Reintentar
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="surveys.length === 0" class="text-center py-8">
      <div class="text-gray-400 dark:text-gray-500 mb-2">
        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      </div>
      <p class="text-gray-600 dark:text-gray-400">No hay encuestas disponibles</p>
    </div>

    <!-- Surveys list -->
    <div v-else class="space-y-4">
      <SurveyCard 
        v-for="survey in surveys" 
        :key="survey.id" 
        :survey="survey"
        @vote-success="handleVoteSuccess"
      />
    </div>

    <!-- Load more button -->
    <div v-if="hasMoreSurveys && !loading" class="text-center mt-6">
      <button 
        @click="loadMoreSurveys"
        class="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        Cargar más encuestas
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useSurveyStore } from '@/store/survey';
import SurveyCard from './SurveyCard.vue';
import type { Survey } from '@/types/survey';

interface Props {
  type?: 'active' | 'all' | 'completed';
  limit?: number;
  autoLoad?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'active',
  limit: 10,
  autoLoad: true
});

const emit = defineEmits<{
  'vote-success': [surveyId: number];
  'survey-click': [survey: Survey];
}>();

const surveyStore = useSurveyStore();

// Computed properties
const surveys = computed(() => {
  switch (props.type) {
    case 'active':
      return surveyStore.activeSurveys;
    case 'all':
      return surveyStore.surveys;
    case 'completed':
      return surveyStore.getCompletedSurveys;
    default:
      return surveyStore.activeSurveys;
  }
});

const loading = computed(() => surveyStore.loading);
const error = computed(() => surveyStore.error);
const hasMoreSurveys = computed(() => {
  return surveyStore.pagination && 
         surveyStore.pagination.page < surveyStore.pagination.pages;
});

// Methods
const loadSurveys = async () => {
  if (props.type === 'active') {
    await surveyStore.loadActiveSurveys(props.limit);
  } else {
    await surveyStore.loadSurveys({
      limit: props.limit,
      status: props.type === 'completed' ? 'completed' : 'all'
    });
  }
};

const loadMoreSurveys = async () => {
  if (surveyStore.pagination) {
    const nextPage = surveyStore.pagination.page + 1;
    await surveyStore.loadSurveys({
      page: nextPage,
      limit: props.limit,
      status: props.type === 'completed' ? 'completed' : 'all'
    });
  }
};

const handleVoteSuccess = (surveyId: number) => {
  emit('vote-success', surveyId);
};

// Lifecycle
onMounted(() => {
  if (props.autoLoad) {
    loadSurveys();
  }
});

// Watch for type changes
watch(() => props.type, () => {
  if (props.autoLoad) {
    loadSurveys();
  }
});
</script> 