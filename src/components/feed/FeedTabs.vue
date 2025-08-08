<template>
  <div>
    <!-- Spacer para mantener el layout cuando sticky -->
    <div v-if="isSticky" class="tabs-spacer" :style="{ height: `${tabsHeight}px` }"></div>
    
    <div ref="tabsContainer" class="feed-tabs-container" :class="{
      'sticky': isSticky,
      'hidden': isHidden
    }" :style="stickyStyle">
      <div class="feed-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab', { 
            active: currentTab === tab.key,
            disabled: disabledTabs?.includes(tab.key)
          }]"
          :disabled="disabledTabs?.includes(tab.key)"
          @click="handleTabClick(tab.key)"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
          <span v-if="getTabCount(tab.key)" class="tab-count">
            {{ formatCount(getTabCount(tab.key)) }}
          </span>
        </button>
      </div>
      
      <!-- Indicador de carga en las pestañas -->
      <div v-if="isLoading" class="tabs-loading">
        <div class="loading-bar"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { FeedTabsProps, FeedTabsEmits } from '@/types/feed';

interface Props extends FeedTabsProps {
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  disabledTabs: () => []
});

const emit = defineEmits<FeedTabsEmits>();

const tabs = [
  { key: 'todo', label: 'Todo', icon: '🗞️', description: 'Noticias y comunidad' },
  { key: 'noticias', label: 'Noticias', icon: '📰', description: 'Solo noticias' },
  { key: 'comunidad', label: 'Comunidad', icon: '👥', description: 'Solo comunidad' }
] as const;

const getTabCount = (tab: string): number | null => {
  if (!props.stats) return null;
  
  switch (tab) {
    case 'todo': return props.stats.total;
    case 'noticias': return props.stats.by_type.news.count;
    case 'comunidad': return props.stats.by_type.community.count;
    default: return null;
  }
};

const formatCount = (count: number | null): string => {
  if (count === null) return '';
  
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  
  return count.toString();
};

const ignoreScrollUntil = ref<number>(0);

const handleTabClick = (tab: 'todo' | 'noticias' | 'comunidad') => {
  if (!props.disabledTabs?.includes(tab)) {
    // Evitar que el cambio de pestaña dispare ocultamientos indeseados
    ignoreScrollUntil.value = performance.now() + 700; // 700ms de gracia
    emit('tab-change', tab);
  }
};

// Referencias para sticky behavior
const tabsContainer = ref<HTMLElement | null>(null);
const isSticky = ref(false);
const isHidden = ref(false);
const lastScrollY = ref(0);
const tabsHeight = ref(0);
const stickyLeft = ref(0);
const stickyWidth = ref(0);

const setRootTabsHeightVar = () => {
  // Expone la altura para que otros componentes (header) puedan igualarla
  document.documentElement.style.setProperty('--feed-tabs-height', `${tabsHeight.value || 60}px`);
};

const updateStickyBoundsFromElement = (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  stickyLeft.value = r.left;
  stickyWidth.value = r.width;
};

const stickyStyle = computed(() => {
  return isSticky.value
    ? {
        left: `${stickyLeft.value}px`,
        width: `${stickyWidth.value}px`,
      }
    : {};
});

// Función para manejar el scroll
const handleScroll = () => {
  if (!tabsContainer.value) return;
  
  const currentScrollY = window.scrollY;
  const rect = tabsContainer.value.getBoundingClientRect();
  const scrollDirection = currentScrollY > lastScrollY.value ? 'down' : 'up';
  const delta = Math.abs(currentScrollY - lastScrollY.value);
  const now = performance.now();
  
  // Determinar si debe estar sticky (cuando llegue a la parte superior)
  if (rect.top <= 0) {
    isSticky.value = true;
    // Fijar ancho y posición horizontal del contenedor para que coincida con el layout
    // Usamos el tamaño original del elemento cuando no era sticky (guardado en updateStickyBoundsFromElement)
    
    // Si acabamos de cambiar de pestaña, no ocultar durante un corto periodo
    if (now < ignoreScrollUntil.value) {
      isHidden.value = false;
    } else {
      // Lógica de ocultación: ocultar solo al desplazarse hacia arriba con un umbral
      const hideThreshold = 12; // px
      const minScrollForHide = Math.max(100, tabsHeight.value);

      if (scrollDirection === 'up' && delta > hideThreshold && currentScrollY > minScrollForHide) {
        isHidden.value = true;
      } else if (scrollDirection === 'down' && delta > 0) {
        isHidden.value = false;
      }
    }
  } else {
    isSticky.value = false;
    isHidden.value = false;
    // Mientras no sea sticky, actualizamos los límites tomando su posición real
    updateStickyBoundsFromElement(tabsContainer.value);
  }
  
  lastScrollY.value = currentScrollY;
};

onMounted(() => {
  if (tabsContainer.value) {
    tabsHeight.value = tabsContainer.value.offsetHeight;
    setRootTabsHeightVar();
    updateStickyBoundsFromElement(tabsContainer.value);
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', () => {
    if (tabsContainer.value) {
      tabsHeight.value = tabsContainer.value.offsetHeight;
      setRootTabsHeightVar();
      // Recalcular ancho y left cuando no es sticky; si es sticky, usar el elemento padre inmediato
      if (!isSticky.value) {
        updateStickyBoundsFromElement(tabsContainer.value);
      } else if (tabsContainer.value.parentElement) {
        updateStickyBoundsFromElement(tabsContainer.value.parentElement as HTMLElement);
      }
    }
  }, { passive: true });
  handleScroll(); // Verificar estado inicial
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  // No es necesario limpiar la variable global al desmontar
});
</script>

<style scoped>
.tabs-spacer {
  width: 100%;
  background: transparent;
}

.feed-tabs-container {
  position: relative;
  background: white;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
  z-index: 10;
}

.feed-tabs-container.sticky {
  position: fixed;
  top: 0;
  /* left y width se ajustan dinámicamente para coincidir con el contenedor del feed */
  transform: translateY(0);
  /* Ocupa todo el ancho de la ventana */
  border-radius: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.feed-tabs-container.sticky.hidden {
  transform: translateY(-100%);
}

.feed-tabs-container.sticky:not(.hidden) {
  transform: translateY(0);
}

.feed-tabs {
  display: flex;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
  width: 100%;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #6c757d;
  transition: all 0.1s ease;
  position: relative;
  min-height: 60px;
}

.tab:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.5);
  color: #495057;
  transform: none;
}

.tab.active {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #28a745, #20c997);
}

.tab.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #adb5bd;
}

.tab-icon {
  font-size: 20px;
  transition: none;
}

.tab:hover:not(.disabled) .tab-icon {
  transform: none;
}

.tab.active .tab-icon {
  /* Eliminada animación pulse */
}

.tab-label {
  font-weight: inherit;
  transition: none;
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  min-width: 24px;
  text-align: center;
  backdrop-filter: blur(4px);
  transition: none;
}

.tab.active .tab-count {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab:not(.active) .tab-count {
  background: #007bff;
  color: white;
}

.tabs-loading {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #e9ecef;
  overflow: hidden;
}

.loading-bar {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #28a745, #ffc107, #dc3545);
  background-size: 400% 100%;
  animation: loading-gradient 2s ease-in-out infinite;
}

/* Animaciones mínimas necesarias */
@keyframes loading-gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .feed-tabs-container.sticky {
    left: 0;
  }
  
  .feed-tabs-container.sticky.hidden {
    transform: translateY(-100%);
  }
  
  .feed-tabs-container.sticky:not(.hidden) {
    transform: translateY(0);
  }
  
  .tab {
    padding: 12px 16px;
    font-size: 14px;
    min-height: 52px;
  }
  
  .tab-icon {
    font-size: 18px;
  }
  
  .tab-label {
    display: none;
  }
  
  .tab-count {
    font-size: 11px;
    padding: 2px 6px;
  }
}

@media (max-width: 480px) {
  .tab {
    padding: 10px 12px;
    gap: 4px;
  }
  
  .tab-icon {
    font-size: 16px;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .feed-tabs-container {
    background: #1a1a1a;
  }
  
  .feed-tabs-container.sticky {
    background: #1a1a1a;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .feed-tabs {
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
    border-bottom-color: #4a5568;
  }
  
  .tab {
    color: #a0aec0;
  }
  
  .tab:hover:not(.disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
  }
  
  .tab.active {
    background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
    color: white;
  }
  
  .tab.disabled {
    color: #4a5568;
  }
  
  .tabs-loading {
    background: #4a5568;
  }
}

/* Efectos de hover mejorados */
.tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
  opacity: 0;
  transition: none;
  pointer-events: none;
}

.tab:hover:not(.disabled)::before {
  opacity: 0;
}

/* Accesibilidad */
.tab:focus {
  outline: 2px solid #007bff;
  outline-offset: -2px;
}

.tab:focus:not(.active) {
  background: rgba(0, 123, 255, 0.1);
}
</style> 