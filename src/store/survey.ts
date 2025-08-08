import { defineStore } from 'pinia';
import { surveyService } from '@/services/surveyService';
import type { 
  Survey, 
  SurveyStats, 
  SurveyVoteRequest, 
  SurveyCreateRequest, 
  SurveyUpdateRequest,
  SurveyFilters 
} from '@/types/survey';

interface SurveyState {
  surveys: Survey[];
  activeSurveys: Survey[];
  currentSurvey: Survey | null;
  surveyStats: SurveyStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

export const useSurveyStore = defineStore('survey', {
  state: (): SurveyState => ({
    surveys: [],
    activeSurveys: [],
    currentSurvey: null,
    surveyStats: null,
    loading: false,
    error: null,
    pagination: null,
  }),

  getters: {
    /**
     * Obtener encuestas activas que pueden recibir votos
     */
    getVotableSurveys: (state) => {
      return state.activeSurveys.filter(survey => 
        surveyService.isSurveyActive(survey) && !survey.user_voted
      );
    },

    /**
     * Obtener encuestas completadas (ya votadas por el usuario)
     */
    getCompletedSurveys: (state) => {
      return state.activeSurveys.filter(survey => survey.user_voted);
    },

    /**
     * Verificar si hay encuestas activas disponibles
     */
    hasActiveSurveys: (state) => {
      return state.activeSurveys.length > 0;
    },

    /**
     * Obtener encuesta por ID
     */
    getSurveyById: (state) => (id: number) => {
      return state.surveys.find(survey => survey.id === id) || null;
    },
  },

  actions: {
    /**
     * Cargar todas las encuestas con filtros
     */
    async loadSurveys(filters: SurveyFilters = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await surveyService.getSurveys(filters);
        
        if (response.success) {
          this.surveys = response.data;
          this.pagination = response.pagination || null;
        } else {
          this.error = response.message || 'Error cargando encuestas';
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error cargando encuestas:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cargar encuestas activas para el feed
     */
    async loadActiveSurveys(limit: number = 5) {
      this.loading = true;
      this.error = null;
      
      try {
        // Intentar obtener encuestas activas del endpoint específico
        const response = await surveyService.getActiveSurveys(limit);
        
        if (response.success && response.data.length > 0) {
          this.activeSurveys = response.data;
        } else {
          // Si no hay encuestas activas, obtener todas y filtrar las activas
          const allSurveysResponse = await surveyService.getSurveys({ limit: 20 });
          
          if (allSurveysResponse.success) {
            // Filtrar encuestas activas en el frontend
            this.activeSurveys = allSurveysResponse.data.filter(survey => survey.status === 'active');
          } else {
            this.error = allSurveysResponse.message || 'Error cargando encuestas';
          }
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error cargando encuestas activas:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cargar una encuesta específica
     */
    async loadSurvey(id: number) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await surveyService.getSurvey(id);
        
        if (response.success) {
          this.currentSurvey = response.data;
          // También actualizar la encuesta en las listas
          this.updateSurveyInLists(response.data);
        } else {
          this.error = response.message || 'Error cargando encuesta';
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error cargando encuesta:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cargar estadísticas de una encuesta
     */
    async loadSurveyStats(id: number) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await surveyService.getSurveyStats(id);
        
        if (response.success) {
          this.surveyStats = response.data;
        } else {
          this.error = response.message || 'Error cargando estadísticas';
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error cargando estadísticas:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Votar en una encuesta
     */
    async voteSurvey(id: number, voteData: SurveyVoteRequest) {
      this.loading = true;
      this.error = null;
      
      try {
        // Intentar encontrar la encuesta en las listas locales
        const survey = this.currentSurvey || this.getSurveyById(id);
        
        // Si no encontramos la encuesta localmente, intentar votar directamente
        // (el backend validará los datos)
        if (!survey) {
          console.log('⚠️ Encuesta no encontrada localmente, votando directamente...');
        } else {
          // Validar opciones antes de enviar
          const validationError = surveyService.validateVoteOptions(survey, voteData.option_ids);
          if (validationError) {
            throw new Error(validationError);
          }
        }

        const response = await surveyService.voteSurvey(id, voteData);
        
        if (response.success) {
          // Actualizar la encuesta actual si es la misma
          if (this.currentSurvey && this.currentSurvey.id === id) {
            await this.loadSurvey(id);
          }
          
          // Actualizar encuestas activas
          await this.loadActiveSurveys();
          
          return { success: true, message: response.message };
        } else {
          // Si el usuario ya votó, recargar la encuesta para mostrar resultados
          if (response.isAlreadyVoted) {
            // Recargar la encuesta específica para obtener el estado actualizado
            const surveyResponse = await surveyService.getSurvey(id);
            if (surveyResponse.success) {
              // Actualizar la encuesta en las listas locales
              this.updateSurveyInLists(surveyResponse.data);
            }
            return { success: false, message: response.message };
          }
          
          // Si el usuario no está autenticado
          if (response.isUnauthorized) {
            return { success: false, message: response.message };
          }
          
          this.error = response.message || 'Error al votar';
          return { success: false, message: response.message };
        }
      } catch (error) {
        console.error('Error votando en encuesta:', error);
        this.error = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Crear nueva encuesta (admin)
     */
    async createSurvey(surveyData: SurveyCreateRequest) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await surveyService.createSurvey(surveyData);
        
        if (response.success) {
          // Recargar encuestas después de crear una nueva
          await this.loadSurveys();
          await this.loadActiveSurveys();
          
          return { success: true, message: response.message, id: response.data?.id };
        } else {
          this.error = response.message || 'Error creando encuesta';
          return { success: false, message: response.message };
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error creando encuesta:', error);
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualizar encuesta existente (admin)
     */
    async updateSurvey(id: number, updateData: SurveyUpdateRequest) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await surveyService.updateSurvey(id, updateData);
        
        if (response.success) {
          // Recargar encuestas después de actualizar
          await this.loadSurveys();
          await this.loadActiveSurveys();
          
          // Actualizar encuesta actual si es la misma
          if (this.currentSurvey && this.currentSurvey.id === id) {
            await this.loadSurvey(id);
          }
          
          return { success: true, message: response.message };
        } else {
          this.error = response.message || 'Error actualizando encuesta';
          return { success: false, message: response.message };
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error actualizando encuesta:', error);
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualizar una encuesta en las listas locales
     */
    updateSurveyInLists(updatedSurvey: Survey) {
      // Actualizar en la lista de encuestas activas
      const activeIndex = this.activeSurveys.findIndex(s => s.id === updatedSurvey.id);
      if (activeIndex !== -1) {
        this.activeSurveys[activeIndex] = updatedSurvey;
      }
      
      // Actualizar en la lista general de encuestas
      const surveyIndex = this.surveys.findIndex(s => s.id === updatedSurvey.id);
      if (surveyIndex !== -1) {
        this.surveys[surveyIndex] = updatedSurvey;
      }
      
      // Actualizar encuesta actual si es la misma
      if (this.currentSurvey && this.currentSurvey.id === updatedSurvey.id) {
        this.currentSurvey = updatedSurvey;
      }
    },

    /**
     * Eliminar encuesta (admin)
     */
    async deleteSurvey(id: number) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await surveyService.deleteSurvey(id);
        
        if (response.success) {
          // Remover de las listas locales
          this.surveys = this.surveys.filter(survey => survey.id !== id);
          this.activeSurveys = this.activeSurveys.filter(survey => survey.id !== id);
          
          // Limpiar encuesta actual si es la misma
          if (this.currentSurvey && this.currentSurvey.id === id) {
            this.currentSurvey = null;
          }
          
          return { success: true, message: response.message };
        } else {
          this.error = response.message || 'Error eliminando encuesta';
          return { success: false, message: response.message };
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error eliminando encuesta:', error);
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Limpiar estado de error
     */
    clearError() {
      this.error = null;
    },

    /**
     * Limpiar encuesta actual
     */
    clearCurrentSurvey() {
      this.currentSurvey = null;
      this.surveyStats = null;
    },

    /**
     * Resetear estado completo
     */
    reset() {
      this.surveys = [];
      this.activeSurveys = [];
      this.currentSurvey = null;
      this.surveyStats = null;
      this.loading = false;
      this.error = null;
      this.pagination = null;
    },

    /**
     * Recargar una encuesta específica y actualizar todas las listas
     */
    async reloadSurvey(id: number) {
      try {
        const response = await surveyService.getSurvey(id);
        
        if (response.success) {
          // Actualizar la encuesta en todas las listas
          this.updateSurveyInLists(response.data);
          
          // Si es la encuesta actual, actualizarla también
          if (this.currentSurvey && this.currentSurvey.id === id) {
            this.currentSurvey = response.data;
          }
        } else {
          console.error('❌ Error recargando encuesta:', response.message);
        }
      } catch (error) {
        console.error('❌ Error recargando encuesta:', error);
      }
    },
  },
}); 