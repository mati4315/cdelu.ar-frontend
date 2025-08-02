<template>
  <div v-if="showDashboard" class="performance-dashboard fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 max-w-sm z-50">
    <!-- Header -->
    <div class="dashboard-header flex justify-between items-center mb-3">
      <h3 class="text-sm font-bold text-gray-800 dark:text-gray-200">
        📊 Performance
      </h3>
      <div class="dashboard-controls flex gap-1">
        <button 
          @click="toggleExpanded"
          class="control-btn text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          :title="isExpanded ? 'Contraer' : 'Expandir'"
        >
          {{ isExpanded ? '➖' : '➕' }}
        </button>
        <button 
          @click="closeDashboard"
          class="control-btn text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Cerrar"
        >
          ✕
        </button>
      </div>
    </div>
    
    <!-- Score general -->
    <div class="performance-score mb-3">
      <div class="score-container flex items-center gap-2">
        <span class="score-label text-xs text-gray-600 dark:text-gray-400">Score:</span>
        <div class="score-value flex items-center gap-1">
          <span class="text-lg font-bold" :class="getScoreColor(score)">
            {{ score }}
          </span>
          <span class="text-xs text-gray-500">/100</span>
        </div>
      </div>
      <div class="score-bar bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
        <div 
          class="score-fill rounded-full h-full transition-all duration-500"
          :class="getScoreColor(score)"
          :style="{ width: `${score}%` }"
        ></div>
      </div>
    </div>
    
    <!-- Métricas expandidas -->
    <div v-if="isExpanded" class="metrics-expanded">
      <!-- Core Web Vitals -->
      <div class="metrics-section mb-3">
        <h4 class="section-title text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Core Web Vitals
        </h4>
        <div class="metrics-grid grid grid-cols-3 gap-2 text-xs">
          <MetricCard 
            name="LCP"
            :metric="metrics.lcp"
            tooltip="Largest Contentful Paint"
          />
          <MetricCard 
            name="FID"
            :metric="metrics.fid"
            tooltip="First Input Delay"
          />
          <MetricCard 
            name="CLS"
            :metric="metrics.cls"
            tooltip="Cumulative Layout Shift"
          />
        </div>
      </div>
      
      <!-- Otras métricas -->
      <div class="metrics-section mb-3">
        <h4 class="section-title text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Otras Métricas
        </h4>
        <div class="metrics-grid grid grid-cols-2 gap-2 text-xs">
          <MetricCard 
            name="FCP"
            :metric="metrics.fcp"
            tooltip="First Contentful Paint"
          />
          <MetricCard 
            name="TTFB"
            :metric="metrics.ttfb"
            tooltip="Time to First Byte"
          />
          <MetricCard 
            name="Memory"
            :metric="metrics.memoryUsage"
            tooltip="Uso de memoria JavaScript"
          />
          <MetricCard 
            name="Load"
            :metric="metrics.pageLoadTime"
            tooltip="Tiempo de carga de página"
          />
        </div>
      </div>
      
      <!-- Problemas detectados -->
      <div v-if="performanceSummary.issues.length > 0" class="issues-section">
        <h4 class="section-title text-xs font-semibold text-red-700 dark:text-red-300 mb-2">
          ⚠️ Problemas
        </h4>
        <ul class="issues-list text-xs text-red-600 dark:text-red-400 space-y-1">
          <li v-for="issue in performanceSummary.issues" :key="issue" class="issue-item">
            • {{ issue }}
          </li>
        </ul>
      </div>
      
      <!-- Acciones -->
      <div class="dashboard-actions mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div class="actions-grid grid grid-cols-2 gap-2">
          <button 
            @click="refreshMetrics"
            class="action-btn text-xs py-1 px-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded transition-colors"
          >
            🔄 Refrescar
          </button>
          <button 
            @click="exportMetrics"
            class="action-btn text-xs py-1 px-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded transition-colors"
          >
            📤 Exportar
          </button>
        </div>
      </div>
    </div>
    
    <!-- Estado de conexión -->
    <div class="connection-status mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
      <span :class="isCollecting ? 'text-green-500' : 'text-red-500'">●</span>
      {{ isCollecting ? 'Recopilando' : 'Detenido' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useWebVitals } from '@/composables/useWebVitals';
import MetricCard from './MetricCard.vue';

interface Props {
  autoHide?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const props = withDefaults(defineProps<Props>(), {
  autoHide: false,
  position: 'bottom-right'
});

// Web Vitals composable
const { metrics, isCollecting, getPerformanceSummary } = useWebVitals({
  enableLogging: true,
  enableReporting: false,
  sampleRate: 1.0
});

// Estado local
const showDashboard = ref(!props.autoHide);
const isExpanded = ref(false);

// Computados
const score = computed(() => metrics.value.score);
const performanceSummary = computed(() => getPerformanceSummary());

// Colores basados en score
const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600 bg-green-600';
  if (score >= 70) return 'text-yellow-600 bg-yellow-600';
  return 'text-red-600 bg-red-600';
};

// Funciones
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const closeDashboard = () => {
  showDashboard.value = false;
};

const refreshMetrics = () => {
  // Recargar página para recalcular métricas
  window.location.reload();
};

const exportMetrics = () => {
  const data = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    metrics: metrics.value,
    summary: performanceSummary.value
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `performance-metrics-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Hotkey para mostrar/ocultar dashboard
const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.shiftKey && event.key === 'P') {
    event.preventDefault();
    showDashboard.value = !showDashboard.value;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  
  // Mostrar el dashboard solo en desarrollo por defecto
  if (import.meta.env.DEV && !props.autoHide) {
    showDashboard.value = true;
  }
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.performance-dashboard {
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  min-width: 200px;
  max-height: 90vh;
  overflow-y: auto;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.control-btn {
  transition: all 0.15s ease;
  min-width: 20px;
  text-align: center;
}

.score-fill {
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.metrics-grid {
  gap: 0.375rem;
}

.action-btn {
  transition: all 0.15s ease;
  font-weight: 500;
}

.action-btn:hover {
  transform: translateY(-1px);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .performance-dashboard {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .metrics-grid.grid-cols-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Posicionamiento dinámico */
.performance-dashboard.bottom-left {
  bottom: 1rem;
  left: 1rem;
  right: auto;
}

.performance-dashboard.top-right {
  top: 1rem;
  bottom: auto;
}

.performance-dashboard.top-left {
  top: 1rem;
  left: 1rem;
  bottom: auto;
  right: auto;
}

/* Dark mode optimizations */
.dark .performance-dashboard {
  background-color: rgba(31, 41, 55, 0.95);
  border-color: rgba(75, 85, 99, 0.8);
}

/* Scrollbar styling */
.performance-dashboard::-webkit-scrollbar {
  width: 4px;
}

.performance-dashboard::-webkit-scrollbar-track {
  background: transparent;
}

.performance-dashboard::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

.performance-dashboard::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.8);
}
</style> 