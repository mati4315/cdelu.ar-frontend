<template>
  <button
    @click="handleClick"
    :disabled="loading || !isAuthenticated"
    :class="[
      'px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'hover:scale-105 active:scale-95',
      buttonClass
    ]"
    :title="buttonTitle"
  >
    <span v-if="loading" class="flex items-center gap-2">
      <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
      {{ loadingText }}
    </span>
    <span v-else class="flex items-center gap-2">
      <component :is="buttonIcon" class="w-4 h-4" />
      {{ buttonText }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';

interface Props {
  userId: number;
  isFollowing: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

interface Emits {
  follow: [userId: number];
  unfollow: [userId: number];
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  variant: 'primary',
  size: 'md'
});

const emit = defineEmits<Emits>();

const { isAuthenticated } = useAuth();

// Debug: Watch for prop changes
watch(() => props.isFollowing, (newValue, oldValue) => {
  console.log(`🔍 [FOLLOW BUTTON] isFollowing changed: ${oldValue} → ${newValue}`);
});

watch(() => props.loading, (newValue, oldValue) => {
  console.log(`🔍 [FOLLOW BUTTON] loading changed: ${oldValue} → ${newValue}`);
});

// Computed properties
const buttonText = computed(() => {
  if (!isAuthenticated.value) return 'Inicia sesión para seguir';
  return props.isFollowing ? 'Dejar de seguir' : 'Seguir';
});

const loadingText = computed(() => {
  return props.isFollowing ? 'Dejando de seguir...' : 'Siguiendo...';
});

const buttonTitle = computed(() => {
  if (!isAuthenticated.value) return 'Debes iniciar sesión para seguir usuarios';
  return props.isFollowing ? 'Dejar de seguir' : 'Seguir usuario';
});

const buttonClass = computed(() => {
  const baseClasses = 'border focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-6 py-2 text-sm',
    lg: 'px-8 py-3 text-base'
  };
  
  // State and variant classes
  if (!isAuthenticated.value) {
    return `${baseClasses} ${sizeClasses[props.size]} bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600`;
  }
  
  if (props.isFollowing) {
    // Following state - can unfollow
    switch (props.variant) {
      case 'secondary':
        return `${baseClasses} ${sizeClasses[props.size]} bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 hover:border-red-300 focus:ring-red-500 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30 dark:hover:text-red-300`;
      case 'outline':
        return `${baseClasses} ${sizeClasses[props.size]} bg-transparent text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 hover:border-red-400 focus:ring-red-500 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-300`;
      default: // primary
        return `${baseClasses} ${sizeClasses[props.size]} bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600 focus:ring-red-500`;
    }
  } else {
    // Not following state - can follow
    switch (props.variant) {
      case 'secondary':
        return `${baseClasses} ${sizeClasses[props.size]} bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400`;
      case 'outline':
        return `${baseClasses} ${sizeClasses[props.size]} bg-transparent text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 focus:ring-blue-500 dark:text-blue-400 dark:border-blue-600 dark:hover:bg-blue-900/20`;
      default: // primary
        return `${baseClasses} ${sizeClasses[props.size]} bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 focus:ring-blue-500`;
    }
  }
});

const buttonIcon = computed(() => {
  if (!isAuthenticated.value) {
    return 'LockIcon';
  }
  return props.isFollowing ? 'MinusIcon' : 'PlusIcon';
});

// Event handlers
const handleClick = () => {
  if (!isAuthenticated.value || props.loading) return;
  
  console.log(`👥 [FOLLOW BUTTON] ${props.isFollowing ? 'Unfollow' : 'Follow'} usuario ${props.userId}`);
  
  if (props.isFollowing) {
    emit('unfollow', props.userId);
  } else {
    emit('follow', props.userId);
  }
};

// Icons as components
const PlusIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
    </svg>
  `
};

const MinusIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
    </svg>
  `
};

const LockIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
    </svg>
  `
};
</script>

<style scoped>
/* Animaciones personalizadas */
@keyframes pulse-blue {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0);
  }
}

@keyframes pulse-red {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0);
  }
}

/* Efecto de pulso cuando se hace hover */
button:not(:disabled):hover {
  animation: pulse-blue 1s infinite;
}

button:not(:disabled).bg-red-500:hover {
  animation: pulse-red 1s infinite;
}

/* Transiciones suaves */
button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Efecto de focus mejorado */
button:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Estados dark mode */
@media (prefers-color-scheme: dark) {
  button:focus {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
}

/* Responsive */
@media (max-width: 768px) {
  button {
    min-width: 100px;
  }
}
</style>
