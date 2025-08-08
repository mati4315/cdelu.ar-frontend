import axios from 'axios';
import type {
  Survey,
  SurveyStats,
  SurveyOption,
  SurveyVoteRequest,
  SurveyCreateRequest,
  SurveyUpdateRequest,
  SurveyFilters,
  SurveyListResponse,
  SurveyResponse,
  SurveyStatsResponse,
  SurveyVoteResponse,
  SurveyCreateResponse,
  SurveyUpdateResponse,
  SurveyDeleteResponse
} from '../types/survey';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

// Obtener token del localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

// Crear cliente axios para encuestas
const surveyClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
surveyClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Función para manejar errores de la API
async function handleApiError(error: any): Promise<never> {
  if (axios.isAxiosError(error) && error.response) {
    const apiError = error.response.data;
    const status = error.response.status;
    
    console.log('🔍 Error API detallado:', {
      status,
      data: apiError,
      url: error.config?.url,
      method: error.config?.method
    });
    
    // Manejar errores específicos
    if (status === 403) {
      throw new Error('No tienes permisos de administrador para realizar esta acción');
    } else if (status === 401) {
      throw new Error('Debes iniciar sesión para realizar esta acción');
    } else if (status === 400) {
      // Mostrar detalles específicos de validación
      const validationMessage = apiError.message || apiError.error || 'Error de validación';
      console.log('📋 Detalles de validación:', apiError);
      throw new Error(`Error de validación: ${validationMessage}`);
    } else if (status === 500) {
      // Mensajes específicos para errores 500 comunes en votación
      if (apiError.message?.includes('votado') || apiError.message?.includes('duplicate')) {
        throw new Error('Ya has participado en esta encuesta. No puedes votar nuevamente.');
      }
      if (apiError.message?.includes('límite') || apiError.message?.includes('limit')) {
        throw new Error('Has alcanzado el límite de votos permitidos para esta encuesta.');
      }
      throw new Error('Error interno del servidor. La encuesta puede haber alcanzado su límite o ya has votado. Intenta refrescar la página.');
    } else {
      throw new Error(apiError.error || apiError.message || 'Error en la API');
    }
  }
  throw new Error(error.message || 'Error desconocido en la API');
}

class SurveyService {
  private baseUrl = '/surveys';

  /**
   * Obtener todas las encuestas con filtros opcionales
   */
  async getSurveys(filters: SurveyFilters = {}): Promise<SurveyListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      
      const url = `${this.baseUrl}?${params.toString()}`;
      const response = await surveyClient.get<SurveyListResponse>(url);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Obtener encuestas activas
   */
  async getActiveSurveys(limit: number = 5): Promise<SurveyListResponse> {
    try {
      const url = `${this.baseUrl}/active?limit=${limit}`;
      const response = await surveyClient.get<SurveyListResponse>(url);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Obtener una encuesta específica por ID
   */
  async getSurvey(id: number): Promise<SurveyResponse> {
    try {
      const url = `${this.baseUrl}/${id}`;
      const response = await surveyClient.get<SurveyResponse>(url);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Obtener estadísticas de una encuesta
   */
  async getSurveyStats(id: number): Promise<SurveyStatsResponse> {
    try {
      const url = `${this.baseUrl}/${id}/stats`;
      const response = await surveyClient.get<SurveyStatsResponse>(url);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Votar en una encuesta
   */
  async voteSurvey(id: number, voteData: SurveyVoteRequest): Promise<SurveyVoteResponse> {
    try {
      const url = `${this.baseUrl}/${id}/vote`;
      console.log('🗳️ Enviando voto:', { url, voteData });
      
      const response = await surveyClient.post<SurveyVoteResponse>(url, voteData);
      console.log('✅ Voto exitoso:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al votar:', error);
      
      // Si el error es "Ya has votado", devolver una respuesta específica
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Ya has votado')) {
        return {
          success: false,
          message: 'Ya has votado en esta encuesta',
          isAlreadyVoted: true
        };
      }
      
      // Si el error es 401 (no autenticado), devolver una respuesta específica
      if (error.response?.status === 401) {
        return {
          success: false,
          message: 'Debes estar logueado para votar en las encuestas',
          isUnauthorized: true
        };
      }
      
      return handleApiError(error);
    }
  }

  /**
   * Crear una nueva encuesta (requiere autenticación de admin)
   */
  async createSurvey(surveyData: SurveyCreateRequest): Promise<SurveyCreateResponse> {
    try {
      console.log('📝 Creando encuesta:', { url: this.baseUrl, surveyData });
      console.log('📋 Datos enviados (JSON):', JSON.stringify(surveyData, null, 2));
      
      const response = await surveyClient.post<SurveyCreateResponse>(this.baseUrl, surveyData);
      console.log('✅ Encuesta creada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando encuesta:', error);
      return handleApiError(error);
    }
  }

  /**
   * Actualizar una encuesta existente (requiere autenticación de admin)
   */
  async updateSurvey(id: number, updateData: SurveyUpdateRequest): Promise<SurveyUpdateResponse> {
    try {
      const url = `${this.baseUrl}/${id}`;
      console.log('📝 Actualizando encuesta:', { url, updateData });
      
      const response = await surveyClient.put<SurveyUpdateResponse>(url, updateData);
      console.log('✅ Encuesta actualizada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error actualizando encuesta:', error);
      return handleApiError(error);
    }
  }

  /**
   * Eliminar una encuesta (requiere autenticación de admin)
   */
  async deleteSurvey(id: number): Promise<SurveyDeleteResponse> {
    try {
      const url = `${this.baseUrl}/${id}`;
      const response = await surveyClient.delete<SurveyDeleteResponse>(url);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * Obtener encuestas para el feed (limitadas y activas)
   */
  async getFeedSurveys(limit: number = 3): Promise<Survey[]> {
    try {
      const response = await this.getActiveSurveys(limit);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Error obteniendo encuestas para el feed:', error);
      return [];
    }
  }

  /**
   * Verificar si una encuesta está activa y puede recibir votos
   */
  isSurveyActive(survey: Survey): boolean {
    if (survey.status !== 'active') return false;
    
    if (survey.expires_at) {
      const now = new Date();
      const expiresAt = new Date(survey.expires_at);
      return now < expiresAt;
    }
    
    return true;
  }

  /**
   * Calcular el porcentaje de votos para una opción
   */
  calculateOptionPercentage(option: SurveyOption, totalVotes: number): number {
    if (totalVotes === 0) return 0;
    return Math.round((option.votes_count / totalVotes) * 100);
  }

  /**
   * Verificar si el usuario puede votar en la encuesta
   */
  canUserVote(survey: Survey): boolean {
    if (!this.isSurveyActive(survey)) return false;
    if (survey.user_voted) return false;
    return true;
  }

  /**
   * Obtener el número máximo de votos permitidos
   */
  getMaxVotesAllowed(survey: Survey): number {
    return survey.is_multiple_choice ? survey.max_votes_per_user : 1;
  }

  /**
   * Validar opciones seleccionadas para votar
   */
  validateVoteOptions(survey: Survey, selectedOptionIds: number[]): string | null {
    if (selectedOptionIds.length === 0) {
      return 'Debes seleccionar al menos una opción';
    }

    if (selectedOptionIds.length > this.getMaxVotesAllowed(survey)) {
      return `Solo puedes seleccionar máximo ${this.getMaxVotesAllowed(survey)} opción(es)`;
    }

    // Verificar que las opciones seleccionadas existen en la encuesta
    const validOptionIds = survey.options.map(option => option.id);
    const invalidOptions = selectedOptionIds.filter(id => !validOptionIds.includes(id));
    
    if (invalidOptions.length > 0) {
      return 'Algunas opciones seleccionadas no son válidas';
    }

    return null;
  }
}

export const surveyService = new SurveyService(); 