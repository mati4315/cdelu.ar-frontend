<template>
  <div class="lottery-detail">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Cargando lotería...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">❌</div>
      <h2 class="error-title">Error al cargar la lotería</h2>
      <p class="error-message">{{ error }}</p>
      <button @click="loadLottery" class="retry-btn">
        🔄 Intentar de nuevo
      </button>
    </div>

    <!-- Lottery Content -->
    <div v-else-if="lottery" class="lottery-content">
      <!-- Header de la lotería -->
      <div class="lottery-header">
        <div class="lottery-badge">
          <span class="lottery-icon">🎰</span>
          <span class="lottery-status" :class="getStatusClass(lottery.status)">
            {{ getStatusText(lottery.status) }}
          </span>
        </div>
        
        <h1 class="lottery-title">{{ lottery.title }}</h1>
        <p class="lottery-description">{{ lottery.description }}</p>
      </div>

      <!-- Imagen de la lotería -->
      <div v-if="lottery.image_url" class="lottery-image-container">
        <img 
          :src="lottery.image_url" 
          :alt="lottery.title"
          class="lottery-image"
          @load="handleImageLoad"
          @error="handleImageError"
        />
      </div>

      <!-- Estadísticas de la lotería -->
      <div class="lottery-stats">
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3 class="stat-value" :class="lottery.is_free ? 'text-green-600' : 'text-blue-600'">
              {{ lottery.is_free ? 'Gratis' : `$${lottery.ticket_price}` }}
            </h3>
            <p class="stat-label">Precio por ticket</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🎫</div>
          <div class="stat-content">
            <h3 class="stat-value">{{ lottery.tickets_sold }}/{{ lottery.max_tickets }}</h3>
            <p class="stat-label">Tickets vendidos</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <h3 class="stat-value">{{ lottery.num_winners }}</h3>
            <p class="stat-label">Ganadores</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <h3 class="stat-value">{{ formatEndDate(lottery.end_date) }}</h3>
            <p class="stat-label">Finaliza</p>
          </div>
        </div>
      </div>

      <!-- Barra de progreso -->
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">Progreso de la lotería</span>
          <span class="progress-percentage">{{ progressPercentage }}%</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <p class="progress-text">
          {{ lottery.tickets_sold }} de {{ lottery.max_tickets }} tickets vendidos
        </p>
      </div>

      <!-- Información del premio -->
      <div v-if="lottery.prize_description" class="prize-section">
        <h3 class="section-title">🏆 Premio</h3>
        <div class="prize-content">
          <p class="prize-description">{{ lottery.prize_description }}</p>
        </div>
      </div>

      <!-- Términos y condiciones -->
      <div v-if="lottery.terms_conditions" class="terms-section">
        <h3 class="section-title">📋 Términos y Condiciones</h3>
        <div class="terms-content">
          <p class="terms-text">{{ lottery.terms_conditions }}</p>
        </div>
      </div>

      <!-- Sección de participación -->
      <div class="participation-section">
        <h3 class="section-title">🎯 Participar en la Lotería</h3>
        
        <!-- Estado de participación del usuario -->
        <div v-if="userParticipation" class="user-participation">
          <div class="participation-badge success">
            <span class="badge-icon">✅</span>
            <span class="badge-text">Ya participaste</span>
          </div>
          <div class="user-tickets">
            <h4>Tus números:</h4>
            <div class="ticket-numbers">
              <span class="ticket-number">
                {{ userParticipation.ticket_number }}
              </span>
            </div>
          </div>
        </div>

        <!-- Formulario de participación -->
        <div v-else-if="canParticipate" class="participation-form">
          <div class="form-group">
            <label class="form-label">Selecciona tus números:</label>
            <div class="number-grid">
              <button
                v-for="number in availableNumbers"
                :key="number"
                @click="toggleNumber(number)"
                :class="[
                  'number-button',
                  selectedNumbers.includes(number) ? 'selected' : '',
                  !canSelectNumber(number) ? 'disabled' : ''
                ]"
                :disabled="!canSelectNumber(number)"
              >
                {{ number }}
              </button>
            </div>
            <p class="form-help">
              Selecciona entre {{ lottery.min_tickets }} y {{ lottery.max_tickets }} números
            </p>
          </div>

          <div class="form-summary">
            <div class="summary-item">
              <span class="summary-label">Números seleccionados:</span>
              <span class="summary-value">{{ selectedNumbers.length }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Precio total:</span>
              <span class="summary-value" :class="lottery.is_free ? 'text-green-600' : 'text-blue-600'">
                {{ lottery.is_free ? 'Gratis' : `$${totalPrice}` }}
              </span>
            </div>
          </div>

          <button 
            @click="participateInLottery"
            :disabled="!canSubmit || isSubmitting"
            class="participate-btn"
            :class="{ 'disabled': !canSubmit || isSubmitting }"
          >
            <span v-if="isSubmitting" class="loading-spinner-small"></span>
            {{ lottery.is_free ? 'Participar Gratis' : 'Comprar Tickets' }}
          </button>
        </div>

        <!-- Lotería no disponible -->
        <div v-else class="lottery-unavailable">
          <div class="unavailable-icon">⏰</div>
          <h4 class="unavailable-title">Lotería no disponible</h4>
          <p class="unavailable-message">
            {{ getUnavailableMessage(lottery.status) }}
          </p>
        </div>
      </div>

      <!-- Ganadores (si la lotería ha terminado) -->
      <div v-if="lottery.status === 'finished' && winners.length > 0" class="winners-section">
        <h3 class="section-title">🏆 Ganadores</h3>
        <div class="winners-list">
          <div 
            v-for="winner in winners" 
            :key="winner.id"
            class="winner-item"
          >
            <div class="winner-info">
              <span class="winner-name">{{ winner.username }}</span>
              <span class="winner-ticket">Ticket #{{ winner.ticket_number }}</span>
            </div>
            <div class="winner-prize">
              {{ winner.prize_description }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado inicial -->
    <div v-else class="initial-state">
      <h1>🎰 Lotería #{{ id }}</h1>
      <p>Vista detallada de la lotería</p>
      <div class="info">
        <p><strong>ID:</strong> {{ id }}</p>
        <p><strong>Estado:</strong> Cargando...</p>
      </div>
      <button @click="loadLottery" class="load-btn">
        🔄 Cargar Lotería
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import type { Lottery, LotteryTicket, LotteryWinner } from '@/types/lottery';

// Props
interface Props {
  id: string;
}

const props = defineProps<Props>();

// Composables
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Estado reactivo
const lottery = ref<Lottery | null>(null);
const userParticipation = ref<LotteryTicket | null>(null);
const winners = ref<LotteryWinner[]>([]);
const selectedNumbers = ref<number[]>([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const error = ref<string | null>(null);

// Computed
const progressPercentage = computed((): number => {
  if (!lottery.value) return 0;
  const sold = lottery.value.tickets_sold || 0;
  const max = lottery.value.max_tickets || 1;
  return Math.round((sold / max) * 100);
});

const availableNumbers = computed((): number[] => {
  if (!lottery.value) return [];
  const numbers = [];
  for (let i = 1; i <= lottery.value.max_tickets; i++) {
    numbers.push(i);
  }
  return numbers;
});

const canParticipate = computed((): boolean => {
  if (!lottery.value || !authStore.isAuthenticated) return false;
  return lottery.value.status === 'active' && lottery.value.current_status === 'running';
});

const canSubmit = computed((): boolean => {
  if (!lottery.value) return false;
  const minTickets = lottery.value.min_tickets || 1;
  const maxTickets = lottery.value.max_tickets;
  return selectedNumbers.value.length >= minTickets && selectedNumbers.value.length <= maxTickets;
});

const totalPrice = computed((): number => {
  if (!lottery.value || lottery.value.is_free) return 0;
  return selectedNumbers.value.length * (lottery.value.ticket_price || 0);
});

// Métodos
const loadLottery = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    // Cargar lotería
    const lotteryResponse = await fetch(`http://localhost:3001/api/v1/lotteries/${props.id}`);
    if (!lotteryResponse.ok) {
      throw new Error('Lotería no encontrada');
    }
    const lotteryData = await lotteryResponse.json();
    lottery.value = lotteryData.data;

    // Cargar participación del usuario si está autenticado
    if (authStore.isAuthenticated) {
      await loadUserParticipation();
    }

    // Cargar ganadores si la lotería ha terminado
    if (lottery.value.status === 'finished') {
      await loadWinners();
    }

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido';
  } finally {
    isLoading.value = false;
  }
};

const loadUserParticipation = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch(`http://localhost:3001/api/v1/lotteries/${props.id}/tickets`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        userParticipation.value = data.data[0];
      }
    }
  } catch (err) {
    console.error('Error cargando participación del usuario:', err);
  }
};

const loadWinners = async () => {
  try {
    const response = await fetch(`http://localhost:3001/api/v1/lotteries/${props.id}/winners`);
    if (response.ok) {
      const data = await response.json();
      winners.value = data.data || [];
    }
  } catch (err) {
    console.error('Error cargando ganadores:', err);
  }
};

const toggleNumber = (number: number) => {
  const index = selectedNumbers.value.indexOf(number);
  if (index > -1) {
    selectedNumbers.value.splice(index, 1);
  } else {
    selectedNumbers.value.push(number);
  }
};

const canSelectNumber = (number: number): boolean => {
  if (!lottery.value) return false;
  const maxTickets = lottery.value.max_tickets;
  return selectedNumbers.value.length < maxTickets || selectedNumbers.value.includes(number);
};

const participateInLottery = async () => {
  if (!canSubmit.value || isSubmitting.value) return;

  try {
    isSubmitting.value = true;
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const response = await fetch(`http://localhost:3001/api/v1/lotteries/${props.id}/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ticket_numbers: selectedNumbers.value,
        payment_method: lottery.value?.is_free ? 'free' : 'credit_card'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Participación exitosa:', result);
      
      // Recargar participación del usuario
      await loadUserParticipation();
      
      // Limpiar selección
      selectedNumbers.value = [];
      
      // Mostrar mensaje de éxito
      alert('¡Participación exitosa! Revisa tus números en la sección de participación.');
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al participar');
    }

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    alert(`Error: ${message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const getStatusClass = (status: string): string => {
  const statusClasses = {
    'active': 'status-active',
    'running': 'status-running',
    'finished': 'status-finished',
    'cancelled': 'status-cancelled',
    'draft': 'status-draft'
  };
  return statusClasses[status as keyof typeof statusClasses] || 'status-default';
};

const getStatusText = (status: string): string => {
  const statusTexts = {
    'active': 'Activa',
    'running': 'En Curso',
    'finished': 'Finalizada',
    'cancelled': 'Cancelada',
    'draft': 'Borrador'
  };
  return statusTexts[status as keyof typeof statusTexts] || status;
};

const getUnavailableMessage = (status: string): string => {
  const messages = {
    'finished': 'Esta lotería ya ha finalizado',
    'cancelled': 'Esta lotería ha sido cancelada',
    'draft': 'Esta lotería aún no está disponible',
    'active': 'Esta lotería no está en ejecución'
  };
  return messages[status as keyof typeof messages] || 'Esta lotería no está disponible';
};

const formatEndDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff <= 0) return 'Finalizada';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return 'Pronto';
};

const handleImageLoad = () => {
  // Imagen cargada exitosamente
};

const handleImageError = () => {
  console.warn('Error cargando imagen de la lotería');
};

// Lifecycle
onMounted(() => {
  loadLottery();
});
</script>

<style scoped>
.lottery-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  padding-top: 120px;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  font-size: 1.1rem;
  color: #666;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.error-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #dc2626;
  margin-bottom: 10px;
}

.error-message {
  color: #666;
  margin-bottom: 20px;
}

.retry-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #b91c1c;
}

/* Initial State */
.initial-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.initial-state h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 20px;
}

.initial-state p {
  color: #6b7280;
  margin-bottom: 20px;
}

.info {
  background: #f9fafb;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info p {
  margin-bottom: 10px;
}

.info strong {
  color: #374151;
}

.load-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.load-btn:hover {
  background: #2563eb;
}

/* Lottery Content */
.lottery-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.lottery-header {
  text-align: center;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.lottery-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
}

.lottery-icon {
  font-size: 1.5rem;
}

.lottery-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
}

.lottery-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.lottery-description {
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
}

/* Lottery Image */
.lottery-image-container {
  padding: 20px;
}

.lottery-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Stats Grid */
.lottery-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
}

.stat-card {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 2rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #6b7280;
}

/* Progress Section */
.progress-section {
  padding: 20px;
  background: #f8fafc;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-label {
  font-weight: 600;
  color: #374151;
}

.progress-percentage {
  font-weight: bold;
  color: #059669;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: #6b7280;
  text-align: center;
}

/* Sections */
.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 15px;
}

.prize-section,
.terms-section {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.prize-description,
.terms-text {
  color: #6b7280;
  line-height: 1.6;
}

/* Participation Section */
.participation-section {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.user-participation {
  text-align: center;
  padding: 20px;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
}

.participation-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  margin-bottom: 15px;
}

.participation-badge.success {
  background: #dcfce7;
  color: #166534;
}

.user-tickets h4 {
  font-weight: 600;
  margin-bottom: 10px;
  color: #374151;
}

.ticket-numbers {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.ticket-number {
  background: #10b981;
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

/* Participation Form */
.participation-form {
  padding: 20px 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}

.number-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.number-button {
  width: 50px;
  height: 50px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.number-button:hover:not(.disabled) {
  border-color: #3b82f6;
  background: #eff6ff;
}

.number-button.selected {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.number-button.disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

.form-help {
  font-size: 0.9rem;
  color: #6b7280;
}

.form-summary {
  background: #f9fafb;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-label {
  font-weight: 600;
  color: #374151;
}

.summary-value {
  font-weight: bold;
}

.participate-btn {
  width: 100%;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.participate-btn:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.participate-btn.disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Lottery Unavailable */
.lottery-unavailable {
  text-align: center;
  padding: 40px 20px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.unavailable-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.unavailable-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #374151;
  margin-bottom: 10px;
}

.unavailable-message {
  color: #6b7280;
}

/* Winners Section */
.winners-section {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.winners-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.winner-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #fef3c7;
  border-radius: 8px;
  border: 1px solid #fde68a;
}

.winner-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.winner-name {
  font-weight: 600;
  color: #92400e;
}

.winner-ticket {
  font-size: 0.9rem;
  color: #a16207;
}

.winner-prize {
  font-weight: 600;
  color: #92400e;
}

/* Responsive */
@media (max-width: 768px) {
  .lottery-detail {
    padding: 15px;
    padding-top: 100px;
  }
  
  .lottery-title {
    font-size: 2rem;
  }
  
  .lottery-stats {
    grid-template-columns: 1fr;
  }
  
  .number-grid {
    grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
  }
  
  .number-button {
    width: 45px;
    height: 45px;
  }
  
  .winner-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style> 