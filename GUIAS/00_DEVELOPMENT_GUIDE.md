# 📚 GUÍA COMPLETA DE DESARROLLO - FRONTEND VUE.JS

> **📖 Documentación completa para desarrolladores y IA sobre el proyecto frontend**

## 🎯 DESCRIPCIÓN DEL PROYECTO

**Diario CdelU Frontend** - Aplicación web Vue.js que replica la experiencia de Facebook para noticias locales de Concepción del Uruguay. Incluye sistema de feed, noticias, encuestas, loterías y autenticación completa.

### 🏗️ Arquitectura General
```
📱 Frontend Vue.js ↔️ 🌐 API Backend ↔️ 📱 Android APK
    (Este proyecto)      (Laravel)       (Réplica nativa)
```

## 🛠️ STACK TECNOLÓGICO

### ✅ Tecnologías Principales
- **Framework:** Vue.js 3 (Composition API)
- **Bundler:** Vite
- **Estado:** Pinia (stores)
- **Routing:** Vue Router 4
- **Estilos:** Tailwind CSS + CSS Variables
- **HTTP:** Axios
- **UI:** Componentes custom + Material Design Icons

### ✅ Dependencias Clave
```json
{
  "vue": "^3.x",
  "vue-router": "^4.x", 
  "pinia": "^2.x",
  "vite": "^4.x",
  "tailwindcss": "^3.x",
  "axios": "^1.x"
}
```

## 📁 ESTRUCTURA DETALLADA DEL PROYECTO

```
frontend/
├── 📖 00_AI_REFERENCE.md           // Referencia rápida IA
├── 📚 00_DEVELOPMENT_GUIDE.md      // Esta guía
├── 📊 00_PROJECT_STATUS.md         // Estado actual
├── 🌐 README.md                    // Documentación principal
├── ⚙️ package.json                 // Dependencias
├── ⚙️ vite.config.js              // Configuración Vite
├── ⚙️ tailwind.config.js          // Configuración Tailwind
├── 📁 public/                      // Archivos estáticos
│   ├── favicon.ico
│   └── logo.png
├── 📁 src/
│   ├── 📄 main.js                  // Entrada principal
│   ├── 📄 App.vue                  // Componente raíz
│   ├── 📁 components/              // Componentes reutilizables
│   │   ├── 🔝 AppHeader.vue        // Header principal
│   │   ├── 📋 FeedTabs.vue         // Pestañas feed
│   │   ├── 📰 NewsItem.vue         // Card noticia
│   │   ├── 📊 SurveyCard.vue       // Card encuesta
│   │   ├── 💬 PostCard.vue         // Card comunicación
│   │   ├── 🎰 LotteryCard.vue      // Card lotería
│   │   ├── 👤 UserAvatar.vue       // Avatar usuario
│   │   ├── ⏳ LoadingSpinner.vue   // Componente carga
│   │   └── ⚠️ ErrorMessage.vue     // Mensaje error
│   ├── 📁 views/                   // Vistas/páginas
│   │   ├── 🏠 HomeView.vue         // Página principal
│   │   ├── 📰 NewsView.vue         // Lista noticias
│   │   ├── 📖 NewsDetailView.vue   // Detalle noticia
│   │   ├── 📊 SurveyView.vue       // Lista encuestas
│   │   ├── 🎰 LotteryView.vue      // Lista loterías
│   │   ├── 👤 ProfileView.vue      // Perfil usuario
│   │   ├── 🔐 LoginView.vue        // Inicio sesión
│   │   └── 📝 RegisterView.vue     // Registro
│   ├── 📁 stores/                  // Estados Pinia
│   │   ├── 🔐 auth.js              // Store autenticación
│   │   ├── 📰 feed.js              // Store feed principal
│   │   ├── 📊 survey.js            // Store encuestas
│   │   └── 🎰 lottery.js           // Store loterías
│   ├── 📁 router/                  // Configuración rutas
│   │   └── 🧭 index.js             // Rutas Vue Router
│   ├── 📁 utils/                   // Utilidades
│   │   ├── 🌐 api.js               // Cliente API
│   │   ├── 📝 formatters.js        // Formateadores
│   │   ├── 🔐 auth.js              // Helpers auth
│   │   └── 📅 dates.js             // Helpers fechas
│   ├── 📁 styles/                  // Estilos globales
│   │   ├── 🎨 main.css             // Variables CSS + Tailwind
│   │   └── 📱 responsive.css       // Media queries
│   └── 📁 assets/                  // Recursos estáticos
│       ├── 🖼️ images/
│       └── ⚡ icons/
└── 📁 docs/                        // Documentación adicional
    └── 📋 api-endpoints.md         // Lista endpoints API
```

## 🎨 SISTEMA DE DISEÑO

### 🌈 Colores (CSS Variables)
El proyecto usa un sistema de variables CSS que soporta tema claro y oscuro:

```css
/* main.css - Variables principales */
:root {
  /* Colores base */
  --bg: #f0f2f5;              /* Fondo general */
  --surface: #ffffff;         /* Cards y superficies */
  --surface-2: #f5f6f7;       /* Cards secundarias */
  --text: #1c1e21;            /* Texto principal */
  --muted: #606770;           /* Texto secundario */
  --border: #ccd0d5;          /* Bordes */
  
  /* Colores funcionales */
  --accent: #1877f2;          /* Azul Facebook - enlaces y botones */
  --nav: #4267b2;             /* Azul navbar */
  --on-nav: #ffffff;          /* Texto en navbar */
  --success: #22c55e;         /* Verde - éxito */
  --warning: #f59e0b;         /* Amarillo - advertencia */
  --danger: #ef4444;          /* Rojo - error */
  
  /* Colores específicos */
  --news-surface: #e9f0ff;    /* Fondo noticias destacadas */
  --news-border: #c9d6f3;     /* Borde noticias */
}

/* Tema oscuro */
html.dark {
  --bg: #18191a;
  --surface: #242526;
  --text: #e4e6eb;
  --muted: #b0b3b8;
  /* ... etc */
}
```

### 📝 Tipografía
```css
/* Jerarquía de texto */
.text-display    /* 24px, bold - Títulos principales */
.text-title      /* 20px, bold - Títulos secciones */
.text-subtitle   /* 18px, bold - Subtítulos */
.text-body       /* 16px, normal - Texto principal */
.text-small      /* 14px, normal - Texto secundario */
.text-caption    /* 12px, medium - Captions y badges */
```

### 🎯 Componentes Base
Todos los componentes siguen estos principios:
- **Consistencia:** Usan variables CSS predefinidas
- **Responsive:** Mobile-first con Tailwind
- **Accesible:** ARIA labels y keyboard navigation
- **Reutilizable:** Props bien definidas y slots

## 🗄️ GESTIÓN DE ESTADO (PINIA)

### 🔐 Auth Store (stores/auth.js)
Maneja toda la autenticación y estado del usuario:

```javascript
export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref(null)
  const isAuthenticated = ref(false)
  const loading = ref(false)
  const error = ref(null)
  
  // Getters
  const isAdmin = computed(() => user.value?.rol === 'administrador')
  const userName = computed(() => user.value?.nombre || 'Usuario')
  
  // Actions
  async function login(email, password) {
    loading.value = true
    try {
      const response = await api.post('/auth/login', { email, password })
      user.value = response.data.user
      isAuthenticated.value = true
      localStorage.setItem('auth_token', response.data.token)
    } catch (error) {
      error.value = error.response?.data?.message || 'Error de autenticación'
    } finally {
      loading.value = false
    }
  }
  
  async function logout() {
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('auth_token')
    router.push('/login')
  }
  
  return { user, isAuthenticated, loading, error, isAdmin, login, logout }
})
```

### 📰 Feed Store (stores/feed.js)
Maneja el feed principal con noticias, comunicaciones, encuestas:

```javascript
export const useFeedStore = defineStore('feed', () => {
  // Estado
  const items = ref([])
  const loading = ref(false)
  const selectedTab = ref('all')
  const counts = ref({
    all: 0,
    news: 0,
    communications: 0,
    surveys: 0,
    lotteries: 0
  })
  
  // Actions
  async function loadFeed(type = null) {
    loading.value = true
    try {
      const endpoint = type ? `/feed/${type}` : '/feed'
      const response = await api.get(endpoint)
      items.value = response.data.data
      counts.value = response.data.counts
    } catch (error) {
      console.error('Error loading feed:', error)
    } finally {
      loading.value = false
    }
  }
  
  function selectTab(tab) {
    selectedTab.value = tab
    const typeMap = {
      all: null,
      news: 'noticias',
      communications: 'comunidad',
      surveys: 'encuestas',
      lotteries: 'loterias'
    }
    loadFeed(typeMap[tab])
  }
  
  async function toggleLike(feedId) {
    try {
      await api.post(`/feed/${feedId}/like/toggle`)
      // Actualizar estado local
      const item = items.value.find(i => i.id === feedId)
      if (item && item.data) {
        item.data.isLiked = !item.data.isLiked
        item.data.likesCount += item.data.isLiked ? 1 : -1
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }
  
  return { items, loading, selectedTab, counts, loadFeed, selectTab, toggleLike }
})
```

## 🧭 SISTEMA DE RUTAS

### Vue Router Configuration (router/index.js)
```javascript
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'Inicio - Diario CdelU' }
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('../views/NewsView.vue'),
    meta: { title: 'Noticias' }
  },
  {
    path: '/news/:id',
    name: 'NewsDetail',
    component: () => import('../views/NewsDetailView.vue'),
    props: true,
    meta: { title: 'Noticia' }
  },
  {
    path: '/surveys',
    name: 'Surveys',
    component: () => import('../views/SurveyView.vue'),
    meta: { title: 'Encuestas' }
  },
  {
    path: '/lotteries',
    name: 'Lotteries', 
    component: () => import('../views/LotteryView.vue'),
    meta: { title: 'Loterías' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: 'Iniciar Sesión', guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { title: 'Registrarse', guest: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { title: 'Perfil', auth: true }
  }
]
```

## 🌐 INTEGRACIÓN API

### Cliente API (utils/api.js)
```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor para agregar token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expirado, redirigir a login
      localStorage.removeItem('auth_token')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default api
```

### Endpoints Principales
```javascript
// Autenticación
POST /auth/login              // Login
POST /auth/register           // Registro
GET /auth/me                 // Usuario actual
POST /auth/logout            // Logout

// Feed
GET /feed                    // Feed general
GET /feed/noticias          // Solo noticias
GET /feed/comunidad         // Solo comunicaciones
POST /feed/{id}/like        // Dar like
DELETE /feed/{id}/like      // Quitar like

// Noticias
GET /news                   // Lista noticias
GET /news/{id}             // Detalle noticia
POST /news/{id}/comments   // Crear comentario

// Encuestas
GET /surveys               // Lista encuestas
GET /surveys/active        // Encuestas activas
POST /surveys/{id}/vote    // Votar
GET /surveys/{id}/results  // Resultados

// Loterías
GET /lotteries            // Lista loterías
GET /lotteries/active     // Loterías activas
POST /lotteries/{id}/buy  // Comprar ticket
```

## 🧪 DESARROLLO Y TESTING

### ✅ Comandos de Desarrollo
```bash
# Instalación inicial
npm install

# Servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
npm run lint:fix

# Formateo de código
npm run format
```

### 🐛 Debug y Herramientas
- **Vue DevTools:** Para inspeccionar componentes y estado
- **Network Tab:** Para monitorear llamadas API
- **Console:** Para logs y errores
- **Vite HMR:** Hot Module Replacement automático

## 📱 RESPONSIVE DESIGN

### Breakpoints Tailwind
```css
/* Mobile first approach */
sm: 640px    /* Tablet pequeña */
md: 768px    /* Tablet */
lg: 1024px   /* Desktop pequeño */
xl: 1280px   /* Desktop */
2xl: 1536px  /* Desktop grande */
```

### Patrón Responsive Típico
```vue
<div class="
  p-4               <!-- Mobile: padding 16px -->
  sm:p-6            <!-- Tablet: padding 24px -->
  lg:p-8            <!-- Desktop: padding 32px -->
  
  grid
  grid-cols-1       <!-- Mobile: 1 columna -->
  md:grid-cols-2    <!-- Tablet: 2 columnas -->
  lg:grid-cols-3    <!-- Desktop: 3 columnas -->
  
  gap-4             <!-- Mobile: gap 16px -->
  lg:gap-6          <!-- Desktop: gap 24px -->
">
```

## 🔧 CONFIGURACIÓN Y VARIABLES

### Variables de Entorno (.env)
```bash
# API
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME="Diario CdelU"

# Features
VITE_ENABLE_SURVEYS=true
VITE_ENABLE_LOTTERIES=true
VITE_ENABLE_DARK_MODE=true

# Debug
VITE_DEBUG_API=false
VITE_SHOW_DEV_TOOLS=true
```

### Configuración Vite (vite.config.js)
```javascript
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

## 📊 MÉTRICAS Y PERFORMANCE

### ✅ Objetivos de Performance
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **Time to Interactive:** < 3.5s

### 🚀 Optimizaciones Implementadas
- **Lazy Loading:** Rutas y componentes
- **Tree Shaking:** Eliminación código no usado
- **Code Splitting:** Chunks por ruta
- **Image Optimization:** WebP cuando sea posible
- **Caching:** Service Worker para assets

---

> **📚 Esta guía cubre los aspectos fundamentales del desarrollo. Para detalles específicos, consulta el código fuente y los comentarios inline.**
