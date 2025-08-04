<template>
  <div class="ads-dashboard-view">
    <!-- Banner de Loterías Activas -->
    <div v-if="lotteryAdInfo" class="lottery-banner bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="lottery-icon text-3xl">🎰</div>
          <div>
            <h3 class="text-lg font-semibold text-yellow-800">
              Sistema Automático de Loterías
            </h3>
            <p class="text-sm text-yellow-700">
              {{ lotteryAdInfo.activeLotteries }} lotería{{ lotteryAdInfo.activeLotteries !== 1 ? 's' : '' }} activa{{ lotteryAdInfo.activeLotteries !== 1 ? 's' : '' }} • Anuncio {{ lotteryAdInfo.adStatus }}
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <div class="status-indicator">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  :class="lotteryAdInfo.adStatus === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
              {{ lotteryAdInfo.adStatus }}
            </span>
          </div>
          <button @click="refreshLotteryAdInfo" 
                  class="refresh-btn bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm transition-colors">
            🔄 Actualizar
          </button>
        </div>
      </div>
      
      <!-- Información del Anuncio -->
      <div v-if="lotteryAdInfo.ad" class="mt-4 p-4 bg-white rounded-lg border border-yellow-100">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="font-medium text-gray-600">Título:</span>
            <p class="text-gray-900">{{ lotteryAdInfo.ad.titulo }}</p>
          </div>
          <div>
            <span class="font-medium text-gray-600">Prioridad:</span>
            <p class="text-gray-900">{{ lotteryAdInfo.ad.prioridad }}</p>
          </div>
          <div>
            <span class="font-medium text-gray-600">Última actualización:</span>
            <p class="text-gray-900">{{ formatDate(lotteryAdInfo.ad.updated_at) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">📢 Dashboard de Publicidad</h1>
      <p class="dashboard-subtitle">Gestiona todos los anuncios de la plataforma</p>
    </div>

    <!-- Estadísticas -->
    <div v-if="stats" class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.total }}</h3>
          <p class="stat-label">Total Anuncios</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.activos }}</h3>
          <p class="stat-label">Anuncios Activos</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">👁️</div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.total_impresiones }}</h3>
          <p class="stat-label">Impresiones</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🖱️</div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.total_clics }}</h3>
          <p class="stat-label">Clics</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.ctr_promedio.toFixed(2) }}%</h3>
          <p class="stat-label">CTR Promedio</p>
        </div>
      </div>
    </div>

    <!-- Controles -->
    <div class="dashboard-controls">
      <div class="controls-left">
        <button 
          @click="showCreateModal = true"
          class="create-btn"
        >
          <span>➕</span>
          Crear Anuncio
        </button>
        
        <button 
          @click="showCreateLotteryAdModal = true"
          class="create-lottery-btn"
        >
          <span>🎰</span>
          Crear Anuncio de Lotería
        </button>
        
        <button 
          @click="openAllAdsView"
          class="view-all-btn"
        >
          <span>👁️</span>
          Ver Todas las Publicidades
        </button>
      </div>
      
      <div class="filters">
        <select v-model="filters.categoria" class="filter-select">
          <option value="">Todas las categorías</option>
          <option value="gaming">Gaming</option>
          <option value="tecnologia">Tecnología</option>
          <option value="eventos">Eventos</option>
          <option value="general">General</option>
        </select>
        
        <select v-model="filters.activo" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        
        <select v-model="filters.sort" class="filter-select">
          <option value="created_at">Más recientes</option>
          <option value="titulo">Título A-Z</option>
          <option value="prioridad">Prioridad</option>
        </select>
      </div>
    </div>

    <!-- Lista de anuncios -->
    <div class="ads-list">
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Cargando anuncios...</p>
      </div>
      
      <div v-else-if="ads.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <h3>No hay anuncios</h3>
        <p>Crea tu primer anuncio para comenzar a monetizar</p>
        <button @click="showCreateModal = true" class="create-btn">
          Crear Anuncio
        </button>
      </div>
      
      <div v-else class="ads-grid">
        <div 
          v-for="ad in ads" 
          :key="ad.id"
          class="ad-card"
        >
          <div class="ad-header">
            <span class="ad-status" :class="ad.activo ? 'active' : 'inactive'">
              {{ ad.activo ? 'Activo' : 'Inactivo' }}
            </span>
            <div class="ad-actions">
              <button @click="editAd(ad)" class="action-btn edit">
                ✏️
              </button>
              <button @click="deleteAd(ad)" class="action-btn delete">
                🗑️
              </button>
            </div>
          </div>
          
          <div class="ad-content">
            <h3 class="ad-title">{{ ad.titulo }}</h3>
            <p class="ad-description">{{ ad.descripcion }}</p>
            
            <div v-if="ad.image_url" class="ad-image">
              <img :src="ad.image_url" :alt="ad.titulo" />
            </div>
            
            <div class="ad-meta">
              <span class="ad-category">{{ ad.categoria }}</span>
              <span class="ad-priority">Prioridad: {{ ad.prioridad }}</span>
            </div>
            
            <div class="ad-stats">
              <span>👁️ {{ ad.impresiones_actuales }}/{{ ad.impresiones_maximas }}</span>
              <span>🖱️ {{ ad.clics_count }} clics</span>
              <span v-if="ad.impresiones_actuales > 0">
                CTR: {{ ((ad.clics_count / ad.impresiones_actuales) * 100).toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de crear/editar anuncio -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ showEditModal ? 'Editar Anuncio' : 'Crear Anuncio' }}</h2>
          <button @click="closeModal" class="close-btn">✕</button>
        </div>
        
        <form @submit.prevent="saveAd" class="ad-form">
          <div class="form-group">
            <label>Título *</label>
            <input v-model="form.titulo" type="text" required />
          </div>
          
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="form.descripcion" rows="3"></textarea>
          </div>
          
          <div class="form-group">
            <label>URL de imagen</label>
            <input v-model="form.image_url" type="url" />
          </div>
          
          <div class="form-group">
            <label>URL de destino *</label>
            <input v-model="form.enlace_destino" type="url" required />
          </div>
          
          <div class="form-group">
            <label>Texto opcional</label>
            <input v-model="form.texto_opcional" type="text" />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Categoría</label>
              <select v-model="form.categoria">
                <option value="general">General</option>
                <option value="gaming">Gaming</option>
                <option value="tecnologia">Tecnología</option>
                <option value="eventos">Eventos</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Prioridad (1-10)</label>
              <input v-model.number="form.prioridad" type="number" min="1" max="10" />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Impresiones máximas</label>
              <input v-model.number="form.impresiones_maximas" type="number" min="0" />
            </div>
            
            <div class="form-group">
              <label>
                <input v-model="form.activo" type="checkbox" />
                Activo
              </label>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">
              Cancelar
            </button>
            <button type="submit" class="save-btn">
              {{ showEditModal ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de crear anuncio de lotería especial -->
    <div v-if="showCreateLotteryAdModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>🎰 Crear Anuncio de Lotería Especial</h2>
          <button @click="closeModal" class="close-btn">✕</button>
        </div>
        
        <div class="lottery-ad-info">
          <div class="info-card">
            <h3>📋 Información del Anuncio Especial</h3>
            <ul class="info-list">
              <li>✅ <strong>Prioridad 3</strong> - Se mostrará con alta prioridad</li>
              <li>🎯 <strong>Dinámico</strong> - Selecciona loterías activas aleatoriamente</li>
              <li>👤 <strong>Personalizado</strong> - Muestra estado de participación del usuario</li>
              <li>🎰 <strong>Botón inteligente</strong> - "Participar" o "Ver mi número" según el caso</li>
              <li>📊 <strong>Estadísticas</strong> - Muestra progreso y tickets vendidos</li>
            </ul>
          </div>
          
          <div class="lottery-ad-preview">
            <h3>👀 Vista Previa</h3>
            <div class="preview-card">
              <div class="preview-header">
                <span class="preview-badge">🎰 Lotería Especial</span>
                <span class="preview-priority">Prioridad: 3</span>
              </div>
              <div class="preview-content">
                <h4>🎰 [Título de Lotería Aleatoria]</h4>
                <p>Descripción dinámica de la lotería seleccionada...</p>
                <div class="preview-stats">
                  <span>📊 Tickets: X/Y</span>
                  <span>💰 Precio: Gratis/$$</span>
                  <span>⏰ Finaliza: X días</span>
                </div>
                <div class="preview-button">
                  <span class="button-text">Participar / Ver mi número</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="closeModal" class="cancel-btn">
            Cancelar
          </button>
          <button type="button" @click="createLotteryAd" class="create-lottery-btn">
            🎰 Crear Anuncio de Lotería
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal para ver todas las publicidades -->
    <div v-if="showAllAdsView" class="modal-overlay" @click="closeAllAdsModal">
      <div class="modal-content all-ads-modal" @click.stop>
        <div class="modal-header">
          <h2>👁️ Todas las Publicidades</h2>
          <button @click="closeAllAdsModal" class="close-btn">✕</button>
        </div>
        
        <div class="modal-body">
          <div v-if="isLoadingAllAds" class="loading">
            <div class="spinner"></div>
            <p>Cargando todas las publicidades...</p>
          </div>
          
          <div v-else-if="allAds.length === 0" class="empty-state">
            <span class="empty-icon">📭</span>
            <h3>No hay publicidades</h3>
            <p>No se encontraron publicidades para mostrar</p>
          </div>
          
          <div v-else class="all-ads-list">
            <div 
              v-for="ad in allAds" 
              :key="ad.id"
              class="all-ad-item"
            >
              <!-- Header del anuncio -->
              <div class="all-ad-header">
                <div class="all-ad-badge">
                  <span class="all-ad-icon">📢</span>
                  <span class="all-ad-status" :class="ad.activo ? 'active' : 'inactive'">
                    {{ ad.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
                <div class="all-ad-date">
                  {{ formatDate(ad.created_at) }}
                </div>
              </div>
              
              <!-- Contenido del anuncio -->
              <div class="all-ad-content">
                <h3 class="all-ad-title">{{ ad.titulo }}</h3>
                <p class="all-ad-description">{{ ad.descripcion }}</p>
                
                <!-- Imagen del anuncio -->
                <div v-if="ad.image_url" class="all-ad-image">
                  <img :src="ad.image_url" :alt="ad.titulo" />
                </div>
                
                <!-- Meta información -->
                <div class="all-ad-meta">
                  <span class="all-ad-category">{{ ad.categoria }}</span>
                  <span class="all-ad-priority">Prioridad: {{ ad.prioridad }}</span>
                </div>
                
                <!-- Estadísticas -->
                <div class="all-ad-stats">
                  <span>👁️ {{ ad.impresiones_actuales }}/{{ ad.impresiones_maximas }}</span>
                  <span>🖱️ {{ ad.clics_count }} clics</span>
                  <span v-if="ad.impresiones_actuales > 0">
                    CTR: {{ ((ad.clics_count / ad.impresiones_actuales) * 100).toFixed(1) }}%
                  </span>
                </div>
                
                <!-- Botón de acción -->
                <div class="all-ad-action">
                  <a 
                    v-if="ad.enlace_destino"
                    :href="ad.enlace_destino" 
                    target="_blank"
                    class="all-ad-link"
                  >
                    🔗 Ver Anuncio
                  </a>
                  <span v-else class="all-ad-no-link">
                    Sin enlace
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeAllAdsModal" class="cancel-btn">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useAds } from '@/composables/useAds';
import adsService from '@/services/adsService';
import type { Ad, AdForm } from '@/types/ads';

// Estado reactivo
const router = useRouter();
const authStore = useAuthStore();
const { activeAds, stats, loadStats } = useAds();
const ads = ref<Ad[]>([]);
const isLoading = ref(false);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showCreateLotteryAdModal = ref(false);
const showAllAdsView = ref(false);
const allAds = ref<Ad[]>([]);
const isLoadingAllAds = ref(false);
const editingAd = ref<Ad | null>(null);

// Información de loterías activas
const lotteryAdInfo = ref<any>(null);

// Verificar permisos de administrador
const checkAdminPermissions = () => {
  if (!authStore.isAdmin) {
    console.error('Acceso denegado: Se requiere rol de administrador');
    router.push('/');
    return false;
  }
  return true;
};

// Cargar información de loterías activas
const loadLotteryAdInfo = async () => {
  try {
    // Obtener loterías activas
    const lotteriesResponse = await fetch('http://localhost:3001/api/v1/lotteries?status=active');
    const lotteriesData = await lotteriesResponse.json();
    
    const activeLotteries = lotteriesData.data?.filter((lottery: any) => 
      lottery.status === 'active' && lottery.current_status === 'running'
    ) || [];
    
    // Obtener anuncio de lotería existente
    const adsResponse = await fetch('http://localhost:3001/api/v1/ads?categoria=eventos', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const adsData = await adsResponse.json();
    
    const lotteryAd = adsData.data?.find((ad: any) => 
      ad.titulo.includes('🎰') && ad.categoria === 'eventos'
    );
    
    lotteryAdInfo.value = {
      activeLotteries: activeLotteries.length,
      adStatus: lotteryAd?.activo ? 'ACTIVO' : 'INACTIVO',
      ad: lotteryAd || null
    };
    
  } catch (error) {
    console.error('Error cargando información de loterías:', error);
  }
};

// Actualizar información de loterías
const refreshLotteryAdInfo = async () => {
  await loadLotteryAdInfo();
};

// Formatear fecha
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Filtros
const filters = reactive({
  categoria: '',
  activo: '',
  sort: 'created_at'
});

// Formulario
const form = reactive<AdForm>({
  titulo: '',
  descripcion: '',
  image_url: '',
  enlace_destino: '',
  texto_opcional: '',
  categoria: 'general',
  prioridad: 1,
  activo: true,
  impresiones_maximas: 0
});

// Métodos
const loadAds = async () => {
  if (!checkAdminPermissions()) return;
  
  try {
    isLoading.value = true;
    const params: any = {
      page: 1,
      limit: 50
    };
    
    if (filters.categoria) params.categoria = filters.categoria;
    if (filters.activo) params.activo = filters.activo;
    if (filters.sort) params.sort = filters.sort;
    
    const response = await adsService.getAllAds(params);
    ads.value = response.data;
  } catch (error) {
    console.error('Error cargando anuncios:', error);
  } finally {
    isLoading.value = false;
  }
};

const editAd = (ad: Ad) => {
  editingAd.value = ad;
  Object.assign(form, ad);
  showEditModal.value = true;
};

const deleteAd = async (ad: Ad) => {
  if (!checkAdminPermissions()) return;
  
  if (!confirm('¿Estás seguro de que quieres eliminar este anuncio?')) return;
  
  try {
    await adsService.deleteAd(ad.id);
    await loadAds();
    await loadStats();
  } catch (error) {
    console.error('Error eliminando anuncio:', error);
  }
};

const saveAd = async () => {
  if (!checkAdminPermissions()) return;
  
  try {
    if (showEditModal.value && editingAd.value) {
      await adsService.updateAd(editingAd.value.id, form);
    } else {
      await adsService.createAd(form);
    }
    
    closeModal();
    await loadAds();
    await loadStats();
  } catch (error) {
    console.error('Error guardando anuncio:', error);
  }
};

const createLotteryAd = async () => {
  if (!checkAdminPermissions()) return;
  
  try {
    // Crear anuncio especial de lotería (sin tipo_especial para compatibilidad con backend)
    const lotteryAdData = {
      titulo: '🎰 Lotería Especial',
      descripcion: 'Anuncio dinámico de lotería que se actualiza automáticamente con loterías activas',
      enlace_destino: '/lotteries',
      texto_opcional: 'Anuncio especial con prioridad 3 - Solo se muestra si hay loterías activas',
      categoria: 'eventos',
      prioridad: 3,
      activo: true,
      impresiones_maximas: 0
    };
    
    await adsService.createAd(lotteryAdData);
    closeModal();
    await loadAds();
    await loadStats();
  } catch (error) {
    console.error('Error creando anuncio de lotería:', error);
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  showCreateLotteryAdModal.value = false;
  editingAd.value = null;
  resetForm();
};

const loadAllAds = async () => {
  if (!checkAdminPermissions()) return;
  
  try {
    isLoadingAllAds.value = true;
    const response = await adsService.getAllAds({
      page: 1,
      limit: 100, // Cargar más anuncios para la vista completa
      sort: 'created_at' // Ordenar por fecha de creación (más nuevos primero)
    });
    allAds.value = response.data;
  } catch (error) {
    console.error('Error cargando todas las publicidades:', error);
  } finally {
    isLoadingAllAds.value = false;
  }
};

const openAllAdsView = async () => {
  showAllAdsView.value = true;
  await loadAllAds();
};

const closeAllAdsModal = () => {
  showAllAdsView.value = false;
  allAds.value = [];
};

const resetForm = () => {
  Object.assign(form, {
    titulo: '',
    descripcion: '',
    image_url: '',
    enlace_destino: '',
    texto_opcional: '',
    categoria: 'general',
    prioridad: 1,
    activo: true,
    impresiones_maximas: 0
  });
};

// Lifecycle
onMounted(async () => {
  if (!checkAdminPermissions()) return;
  await Promise.all([loadAds(), loadStats(), loadLotteryAdInfo()]);
});
</script>

<style scoped>
.ads-dashboard-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  padding-top: 120px; /* Más espacio para el header fijo */
}

.dashboard-header {
  text-align: center;
  margin-bottom: 30px;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 8px;
}

.dashboard-subtitle {
  color: #6b7280;
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 2rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
}

.stat-label {
  color: #6b7280;
  margin: 0;
  font-size: 0.9rem;
}

.dashboard-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
  flex-wrap: wrap;
}

.create-btn {
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.create-lottery-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.create-lottery-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.view-all-btn {
  background: linear-gradient(135deg, #f59e0b, #ea580c);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.view-all-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
}

.ads-list {
  min-height: 400px;
}

.loading {
  text-align: center;
  padding: 40px;
}

.spinner {
  border: 3px solid #f3f4f6;
  border-top: 3px solid #8b5cf6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  display: block;
}

.ads-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.ad-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s;
}

.ad-card:hover {
  transform: translateY(-2px);
}

.ad-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.ad-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.ad-status.active {
  background: #dcfce7;
  color: #166534;
}

.ad-status.inactive {
  background: #fef2f2;
  color: #dc2626;
}

.ad-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #f3f4f6;
}

.ad-content {
  padding: 20px;
}

.ad-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1f2937;
}

.ad-description {
  color: #6b7280;
  margin-bottom: 15px;
  line-height: 1.5;
}

.ad-image {
  margin-bottom: 15px;
}

.ad-image img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.ad-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.ad-category,
.ad-priority {
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #6b7280;
}

.ad-stats {
  display: flex;
  gap: 15px;
  font-size: 0.8rem;
  color: #6b7280;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.ad-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group label {
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-btn {
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

.save-btn {
  padding: 10px 20px;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.save-btn:hover {
  background: #7c3aed;
}

/* Estilos para el modal de lotería */
.lottery-ad-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.info-card {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.info-card h3 {
  margin-bottom: 15px;
  color: #1f2937;
  font-size: 1.1rem;
}

.info-list {
  list-style: none;
  padding: 0;
}

.info-list li {
  margin-bottom: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.9rem;
  color: #4b5563;
}

.info-list li:last-child {
  border-bottom: none;
}

.lottery-ad-preview {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.lottery-ad-preview h3 {
  margin-bottom: 15px;
  color: #1f2937;
  font-size: 1.1rem;
}

.preview-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f59e0b, #ea580c);
  color: white;
}

.preview-badge {
  font-size: 0.8rem;
  font-weight: 600;
}

.preview-priority {
  font-size: 0.7rem;
  opacity: 0.9;
}

.preview-content {
  padding: 16px;
}

.preview-content h4 {
  margin-bottom: 8px;
  color: #1f2937;
  font-size: 1rem;
}

.preview-content p {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.preview-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 0.8rem;
  color: #6b7280;
}

.preview-button {
  background: linear-gradient(135deg, #f59e0b, #ea580c);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Estilos para el banner de loterías activas */
.lottery-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #d97706;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 20px;
  margin-top: 10px; /* Menos espacio ya que tenemos padding-top en el contenedor */
  position: relative;
  z-index: 1; /* Menor que el header (z-50) pero mayor que el contenido */
}

.lottery-icon {
  color: #f59e0b;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-btn {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.2s;
}

.refresh-btn:hover {
  background: #d97706;
}

/* Estilos para el modal de todas las publicidades */
.all-ads-modal {
  max-width: 90vw;
  max-height: 90vh;
  width: 1200px;
}

.all-ads-list {
  max-height: 60vh;
  overflow-y: auto;
  padding: 20px 0;
}

.all-ad-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.all-ad-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.all-ad-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.all-ad-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.all-ad-icon {
  font-size: 1.2rem;
}

.all-ad-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.all-ad-status.active {
  background: #dcfce7;
  color: #166534;
}

.all-ad-status.inactive {
  background: #fee2e2;
  color: #dc2626;
}

.all-ad-date {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.all-ad-content {
  padding: 20px;
}

.all-ad-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 10px;
}

.all-ad-description {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 15px;
}

.all-ad-image {
  margin-bottom: 15px;
}

.all-ad-image img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.all-ad-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.all-ad-category {
  background: #eff6ff;
  color: #1d4ed8;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.all-ad-priority {
  background: #fef3c7;
  color: #92400e;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.all-ad-stats {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
  font-size: 0.9rem;
  color: #6b7280;
}

.all-ad-action {
  display: flex;
  justify-content: flex-end;
}

.all-ad-link {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
}

.all-ad-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.all-ad-no-link {
  color: #9ca3af;
  font-size: 0.9rem;
  font-style: italic;
}

@media (max-width: 768px) {
  .ads-dashboard-view {
    padding-top: 100px; /* Menos espacio en móvil */
  }
  
  .dashboard-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters {
    justify-content: center;
  }
  
  .ads-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .lottery-banner {
    margin-top: 5px; /* Menos espacio en móvil */
    padding: 10px 15px; /* Padding más pequeño */
    flex-direction: column;
    gap: 10px;
  }
  
  .lottery-banner > div {
    width: 100%;
    justify-content: center;
  }
}
</style> 