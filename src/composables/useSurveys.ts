import { ref, computed } from 'vue';
import { useSurveyStore } from '@/store/survey';
import type { Survey } from '@/types/survey';

export function useSurveys() {
  const surveyStore = useSurveyStore();
  
  // Estado local
  const surveysLoaded = ref(false);
  const surveysError = ref<string | null>(null);
  
  // Computed properties
  const activeSurveys = computed(() => surveyStore.activeSurveys);
  const surveysLoading = computed(() => surveyStore.loading);
  
  /**
   * Cargar encuestas activas para el feed
   */
  const loadFeedSurveys = async (limit: number = 3) => {
    try {
      surveysError.value = null;
      await surveyStore.loadActiveSurveys(limit);
      surveysLoaded.value = true;
    } catch (error) {
      surveysError.value = error instanceof Error ? error.message : 'Error cargando encuestas';
      console.error('Error cargando encuestas para el feed:', error);
    }
  };
  
  /**
   * Obtener encuestas para mostrar en el feed
   */
  const getFeedSurveys = computed(() => {
    return activeSurveys.value.filter(survey => 
      survey.status === 'active' && survey.total_votes >= 0
    );
  });
  
  /**
   * Verificar si hay encuestas disponibles para el feed
   */
  const hasFeedSurveys = computed(() => {
    return getFeedSurveys.value.length > 0;
  });
  
  /**
   * Obtener encuestas para insertar en el feed
   */
  const getSurveysForFeed = (maxCount: number = 2) => {
    const availableSurveys = getFeedSurveys.value;
    return availableSurveys.slice(0, maxCount);
  };
  
  /**
   * Insertar encuestas en el feed de manera inteligente
   */
  const insertSurveysInFeed = (feedItems: any[], surveys: Survey[], insertEvery: number = 4) => {
    const result = [...feedItems];
    const surveysToInsert = [...surveys];
    
    // Insertar encuestas cada N items
    for (let i = insertEvery; i < result.length; i += insertEvery) {
      if (surveysToInsert.length > 0) {
        const survey = surveysToInsert.shift()!;
        result.splice(i, 0, {
          type: 'survey',
          id: survey.id,
          survey: survey,
          is_survey: true
        });
      }
    }
    
    return result;
  };
  
  /**
   * Manejar voto exitoso en encuesta
   */
  const handleSurveyVote = async (surveyId: number, voteData: { option_ids: number[] }) => {
    try {
      const result = await surveyStore.voteSurvey(surveyId, voteData);
      if (result.success) {
        // Recargar encuestas para actualizar el estado
        await loadFeedSurveys();
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al votar';
      return { success: false, message: errorMessage };
    }
  };
  
  /**
   * Verificar si un item del feed es una encuesta
   */
  const isSurveyItem = (item: any): item is { type: 'survey'; id: number; survey: Survey; is_survey: true } => {
    return item && item.type === 'survey' && item.is_survey === true;
  };
  
  /**
   * Obtener estadísticas de encuestas
   */
  const getSurveyStats = computed(() => {
    const surveys = getFeedSurveys.value;
    return {
      total: surveys.length,
      active: surveys.filter(s => s.status === 'active').length,
      voted: surveys.filter(s => s.user_voted).length,
      available: surveys.filter(s => !s.user_voted && s.status === 'active').length
    };
  });
  
  return {
    // Estado
    surveysLoaded,
    surveysError,
    activeSurveys,
    surveysLoading,
    
    // Computed
    getFeedSurveys,
    hasFeedSurveys,
    getSurveyStats,
    
    // Métodos
    loadFeedSurveys,
    getSurveysForFeed,
    insertSurveysInFeed,
    handleSurveyVote,
    isSurveyItem
  };
} 