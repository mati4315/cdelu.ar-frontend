<template>
  <div 
    class="metric-card bg-gray-50 dark:bg-gray-700 rounded p-2 border" 
    :class="borderClass"
    :title="tooltip"
  >
    <div class="metric-name font-medium text-xs mb-1">
      {{ name }}
    </div>
    <div v-if="metric" class="metric-content">
      <div class="metric-value font-bold text-sm" :class="valueClass">
        {{ formatValue(metric.value, metric.unit) }}
      </div>
      <div class="metric-rating text-xs opacity-75">
        {{ getRatingText(metric.rating) }}
      </div>
    </div>
    <div v-else class="metric-content">
      <div class="metric-value text-xs text-gray-400">
        Midiendo...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  unit: string;
  timestamp: number;
}

interface Props {
  name: string;
  metric: WebVitalMetric | null;
  tooltip?: string;
}

const props = defineProps<Props>();

// Clases de color basadas en rating
const borderClass = computed(() => {
  if (!props.metric) return 'border-gray-300 dark:border-gray-600';
  
  switch (props.metric.rating) {
    case 'good':
      return 'border-green-400 dark:border-green-500';
    case 'needs-improvement':
      return 'border-yellow-400 dark:border-yellow-500';
    case 'poor':
      return 'border-red-400 dark:border-red-500';
    default:
      return 'border-gray-300 dark:border-gray-600';
  }
});

const valueClass = computed(() => {
  if (!props.metric) return 'text-gray-400';
  
  switch (props.metric.rating) {
    case 'good':
      return 'text-green-600 dark:text-green-400';
    case 'needs-improvement':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'poor':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
});

// Formatear valor con unidad
const formatValue = (value: number, unit: string): string => {
  if (unit === 'ms') {
    return value < 1000 ? `${value}ms` : `${(value / 1000).toFixed(1)}s`;
  }
  if (unit === 'MB') {
    return `${value}${unit}`;
  }
  if (unit === '') {
    return value.toString();
  }
  return `${value}${unit}`;
};

// Texto de rating
const getRatingText = (rating: 'good' | 'needs-improvement' | 'poor'): string => {
  switch (rating) {
    case 'good':
      return '✓ Bueno';
    case 'needs-improvement':
      return '⚠ Mejorar';
    case 'poor':
      return '✗ Malo';
    default:
      return '';
  }
};
</script>

<style scoped>
.metric-card {
  transition: all 0.15s ease;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.metric-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.metric-value {
  line-height: 1.2;
}

.metric-rating {
  font-weight: 500;
}

/* Dark mode optimizations */
.dark .metric-card {
  background-color: rgba(55, 65, 81, 0.8);
}

.dark .metric-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
</style> 