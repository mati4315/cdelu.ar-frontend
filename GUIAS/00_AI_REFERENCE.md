# ⚡ AI REFERENCE - FRONTEND VUE.JS - CONSULTA RÁPIDA OBLIGATORIA

> **🚨 ANTES DE MODIFICAR CUALQUIER CÓDIGO: LEE ESTE ARCHIVO COMPLETO**

## 🎨 COLORES VÁLIDOS - CSS VARIABLES (src/styles/main.css)

### ✅ CSS Variables Disponibles (VÁLIDOS)
```css
/* Tema claro (:root) */
--bg: #f0f2f5;              /* Fondo general */
--surface: #ffffff;         /* Cards y superficies */
--surface-2: #f5f6f7;       /* Cards secundarias */
--text: #1c1e21;            /* Texto principal */
--muted: #606770;           /* Texto secundario */
--border: #ccd0d5;          /* Bordes */
--accent: #1877f2;          /* Enlaces y botones */
--nav: #4267b2;             /* Barra superior */
--on-nav: #ffffff;          /* Texto en navbar */
--nav-border: #365899;      /* Borde navbar */
--news-surface: #e9f0ff;    /* Fondo noticias */
--news-border: #c9d6f3;     /* Borde noticias */
--success: #22c55e;         /* Estados exitosos */
--warning: #f59e0b;         /* Advertencias */
--danger: #ef4444;          /* Errores */

/* Tema oscuro (html.dark) */
--bg: #18191a;              /* Fondo general oscuro */
--surface: #242526;         /* Cards oscuras */
--surface-2: #2f3031;       /* Cards secundarias oscuras */
--text: #e4e6eb;            /* Texto principal oscuro */
--muted: #b0b3b8;           /* Texto secundario oscuro */
--border: #3a3b3c;          /* Bordes oscuros */
--accent: #2d88ff;          /* Enlaces oscuros */
--nav: #3b5998;             /* Navbar oscura */
```

### ✅ Clases Tailwind Personalizadas
```css
/* Usar estas clases en lugar de colores hardcoded */
.bg-primary         /* bg-[var(--bg)] */
.bg-surface         /* bg-[var(--surface)] */
.bg-surface-2       /* bg-[var(--surface-2)] */
.text-primary       /* text-[var(--text)] */
.text-muted         /* text-[var(--muted)] */
.border-default     /* border-[var(--border)] */
.text-accent        /* text-[var(--accent)] */
.bg-accent          /* bg-[var(--accent)] */
```

### ❌ NO USAR ESTOS (Causará inconsistencias)
```css
/* NUNCA uses colores hardcoded: */
background-color: #ffffff;    /* ❌ Usar bg-surface */
color: #000000;              /* ❌ Usar text-primary */
border-color: #ccc;          /* ❌ Usar border-default */
```

## 🧩 COMPONENTES PRINCIPALES - ESTRUCTURA

### ✅ Componentes Core (src/components/)
```vue
AppHeader.vue           // 🔝 Header principal con logo y nav
FeedTabs.vue           // 📋 Pestañas del feed
NewsItem.vue           // 📰 Card de noticia individual
SurveyCard.vue         // 📊 Card de encuesta
PostCard.vue           // 💬 Card de comunicación
LotteryCard.vue        // 🎰 Card de lotería
UserAvatar.vue         // 👤 Avatar de usuario
LoadingSpinner.vue     // ⏳ Spinner de carga
ErrorMessage.vue       // ⚠️ Mensaje de error
```

### ✅ Vistas Principales (src/views/)
```vue
HomeView.vue           // 🏠 Página principal con feed
NewsView.vue           // 📰 Lista de noticias
NewsDetailView.vue     // 📖 Detalle de noticia
SurveyView.vue         // 📊 Lista de encuestas
LotteryView.vue        // 🎰 Lista de loterías
ProfileView.vue        // 👤 Perfil de usuario
LoginView.vue          // 🔐 Inicio de sesión
RegisterView.vue       // 📝 Registro
```

## 📊 STORES PINIA - ESTADOS VÁLIDOS

### ✅ useAuthStore (stores/auth.js)
```javascript
// Estados disponibles
const user = ref(null)                    // Usuario actual
const isAuthenticated = ref(false)       // Estado de autenticación
const loading = ref(false)               // Cargando auth
const error = ref(null)                  // Error de auth

// Métodos disponibles
login(email, password)                   // Iniciar sesión
register(nombre, email, password, rol)   // Registrarse
logout()                                 // Cerrar sesión
checkAuth()                             // Verificar autenticación
isAdmin()                               // Verificar si es admin
```

### ✅ useFeedStore (stores/feed.js)
```javascript
// Estados disponibles
const items = ref([])                    // Items del feed
const loading = ref(false)               // Cargando feed
const error = ref(null)                  // Error del feed
const selectedTab = ref('all')           // Tab seleccionado
const counts = ref({})                   // Contadores por tab

// Métodos disponibles
loadFeed(type = null)                    // Cargar feed
selectTab(tab)                          // Cambiar tab
toggleLike(feedId)                      // Toggle like
voteInSurvey(surveyId, optionId)        // Votar encuesta
refresh()                               // Refrescar feed
```

## 🌐 API ENDPOINTS - RUTAS VÁLIDAS

### ✅ Endpoints Disponibles (utils/api.js)
```javascript
// Autenticación
POST /auth/login                        // Iniciar sesión
POST /auth/register                     // Registrarse
GET /auth/me                           // Obtener usuario actual

// Feed
GET /feed                              // Obtener feed general
GET /feed/noticias                     // Feed de noticias
GET /feed/comunidad                    // Feed de comunicaciones
POST /feed/{feedId}/like               // Dar like
DELETE /feed/{feedId}/like             // Quitar like

// Noticias
GET /news                              // Lista de noticias
GET /news/{id}                         // Detalle de noticia
POST /news/{id}/comments               // Crear comentario

// Encuestas
GET /surveys                           // Lista de encuestas
GET /surveys/active                    // Encuestas activas
POST /surveys/{id}/vote                // Votar en encuesta

// Loterías
GET /lotteries                         // Lista de loterías
GET /lotteries/active                  // Loterías activas
POST /lotteries/{id}/buy               // Comprar ticket
```

## 🚨 REGLAS OBLIGATORIAS FRONTEND

### 1. ✅ ANTES DE MODIFICAR CUALQUIER ARCHIVO:
```markdown
1. ✅ Consultar este AI_REFERENCE.md
2. ✅ Usar SOLO variables CSS de main.css
3. ✅ Respetar estructura de componentes existente
4. ✅ NO cambiar nombres de props en componentes
5. ✅ NO modificar estructura de stores sin consultar
6. ✅ Usar composables existentes (useAuth, useFeed)
```

### 2. ✅ ESTRUCTURA DE ARCHIVOS CRÍTICOS:
```
src/
├── components/              // 🧩 Componentes reutilizables
│   ├── AppHeader.vue       // Header principal
│   ├── FeedTabs.vue        // Tabs del feed
│   ├── NewsItem.vue        // Card de noticia
│   └── SurveyCard.vue      // Card de encuesta
├── views/                  // 📄 Vistas/páginas
│   ├── HomeView.vue        // Página principal
│   ├── NewsView.vue        // Lista noticias
│   └── SurveyView.vue      // Lista encuestas
├── stores/                 // 🗄️ Estados Pinia
│   ├── auth.js            // Store de autenticación
│   └── feed.js            // Store del feed
├── utils/                  // 🛠️ Utilidades
│   ├── api.js             // Cliente API
│   └── formatters.js      // Formateadores
├── styles/                 // 🎨 Estilos
│   └── main.css           // Variables CSS globales
└── router/                // 🧭 Rutas
    └── index.js           // Configuración Vue Router
```

### 3. ✅ WORKFLOW OBLIGATORIO:
```markdown
1. 📖 Leer AI_REFERENCE.md (este archivo)
2. 🔍 Verificar que variables CSS estén en main.css
3. ✏️ Usar componentes y stores existentes
4. 🔧 NO crear nuevos stores sin documentar
5. 🧪 Probar en desarrollo: npm run dev
6. ✅ Verificar que no hay errores en consola
```

## 🎯 PATRONES ESTÁNDAR VUE

### ✅ Componente típico:
```vue
<template>
  <div class="bg-surface border-default rounded-lg p-4">
    <h2 class="text-primary text-lg font-bold mb-2">
      {{ title }}
    </h2>
    <p class="text-muted text-sm">
      {{ description }}
    </p>
    <button 
      @click="handleClick"
      class="bg-accent text-white px-4 py-2 rounded mt-4 hover:opacity-90"
    >
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup>
// Props definidos
const props = defineProps({
  title: String,
  description: String,
  buttonText: { type: String, default: 'Acción' }
})

// Emits definidos
const emit = defineEmits(['click'])

// Lógica del componente
const handleClick = () => {
  emit('click')
}
</script>
```

### ❌ NUNCA hagas esto:
```vue
<!-- ❌ MAL - Colores hardcoded -->
<div style="background-color: #ffffff; color: #000000;">

<!-- ❌ MAL - No usar variables CSS -->
<div class="bg-white text-black">

<!-- ❌ MAL - Props no definidas -->
<MyComponent :randomProp="value" />
```

## 🚀 COMANDOS ÚTILES

### ✅ Para desarrollo:
```bash
cd "D:\WEB MATER\frontend"
npm run dev                 # Servidor desarrollo
npm run build              # Build producción
npm run preview            # Preview build
```

### ✅ Para verificar linting:
```bash
npm run lint               # Verificar código
npm run lint:fix           # Corregir automáticamente
```

---

> **🎯 RECUERDA: Este archivo es tu BIBLIA para el frontend Vue.js. Consúltalo SIEMPRE antes de modificar código.**
