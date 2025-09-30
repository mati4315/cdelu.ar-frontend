import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/main.css' // Importar Tailwind CSS
import { analyticsService } from './services/analyticsService'
import { preloadCriticalResources } from './composables/usePerformance'

// Preload de recursos críticos
preloadCriticalResources();

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Inicializar Analytics (reemplazar con tu GA_MEASUREMENT_ID real)
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'GA_MEASUREMENT_ID';
if (GA_MEASUREMENT_ID !== 'GA_MEASUREMENT_ID') {
  analyticsService.initialize(GA_MEASUREMENT_ID);
}

app.mount('#app') 