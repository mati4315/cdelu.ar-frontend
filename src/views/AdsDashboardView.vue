<template>
  <div class="ads-dashboard-view">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Dashboard de Publicidad</h1>
      <p class="dashboard-subtitle">Gestiona tus anuncios y métricas de monetización</p>
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
      <button 
        @click="showCreateModal = true"
        class="create-btn"
      >
        <span>➕</span>
        Crear Anuncio
      </button>
      
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
const editingAd = ref<Ad | null>(null);

// Verificar permisos de administrador
const checkAdminPermissions = () => {
  if (!authStore.isAdmin) {
    console.error('Acceso denegado: Se requiere rol de administrador');
    router.push('/');
    return false;
  }
  return true;
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

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingAd.value = null;
  resetForm();
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
  await Promise.all([loadAds(), loadStats()]);
});
</script>

<style scoped>
.ads-dashboard-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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

@media (max-width: 768px) {
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
}
</style> 