# 📱 Diario CdelU - Frontend Vue.js

> **🤖 IMPORTANTE PARA IA:** Lee primero `00_AI_REFERENCE.md` antes de modificar cualquier código

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Pinia](https://img.shields.io/badge/Pinia-2.x-FFD859?logo=pinia)](https://pinia.vuejs.org/)

**Aplicación web moderna que replica la experiencia de Facebook para noticias locales de Concepción del Uruguay.**

## 🚀 INICIO RÁPIDO

```bash
# Clonar e instalar
git clone <repository-url>
cd frontend
npm install

# Desarrollo
npm run dev

# Producción
npm run build
```

## 📖 DOCUMENTACIÓN COMPLETA

### 🤖 **Para IA y Desarrolladores:**
- **⚡ [00_AI_REFERENCE.md](./00_AI_REFERENCE.md)** - 🚨 **LECTURA OBLIGATORIA** antes de modificar código
- **📚 [00_DEVELOPMENT_GUIDE.md](./00_DEVELOPMENT_GUIDE.md)** - Guía completa de desarrollo
- **📊 [00_PROJECT_STATUS.md](./00_PROJECT_STATUS.md)** - Estado actual del proyecto

### 🎯 **¿Qué contiene cada archivo?**
```
00_AI_REFERENCE.md      ⚡ Colores válidos, iconos, modelos, reglas
00_DEVELOPMENT_GUIDE.md 📚 Arquitectura, componentes, API, workflow  
00_PROJECT_STATUS.md    📊 Estado, métricas, bugs, roadmap
```

## 🎨 SISTEMA DE DISEÑO

### 🌈 Colores (CSS Variables)
```css
--bg: #f0f2f5           /* Fondo general */
--surface: #ffffff      /* Cards */
--text: #1c1e21         /* Texto principal */
--accent: #1877f2       /* Azul Facebook */
--success: #22c55e      /* Verde éxito */
--danger: #ef4444       /* Rojo error */
```

### 📝 Tipografía
- **Display:** 24px, bold - Títulos principales
- **Title:** 20px, bold - Títulos secciones  
- **Body:** 16px, normal - Texto principal
- **Small:** 14px, normal - Texto secundario

## 🧩 COMPONENTES PRINCIPALES

```
src/components/
├── AppHeader.vue       🔝 Header con logo y navegación
├── FeedTabs.vue        📋 Pestañas del feed  
├── NewsItem.vue        📰 Card de noticia
├── SurveyCard.vue      📊 Card de encuesta
├── LotteryCard.vue     🎰 Card de lotería
└── UserAvatar.vue      👤 Avatar de usuario
```

## 📱 VISTAS PRINCIPALES

```
src/views/
├── HomeView.vue        🏠 Página principal con feed
├── NewsView.vue        📰 Lista de noticias
├── SurveyView.vue      📊 Lista de encuestas
├── LotteryView.vue     🎰 Lista de loterías
├── LoginView.vue       🔐 Inicio de sesión
└── ProfileView.vue     👤 Perfil de usuario
```

## 🗄️ ESTADOS (PINIA)

```
src/stores/
├── auth.js            🔐 Autenticación y usuario
├── feed.js            📰 Feed principal
├── survey.js          📊 Encuestas  
└── lottery.js         🎰 Loterías
```

## 🌐 RUTAS

```
/                      🏠 Página principal
/news                  📰 Lista de noticias
/news/:id              📖 Detalle de noticia  
/surveys               📊 Lista de encuestas
/lotteries             🎰 Lista de loterías
/login                 🔐 Inicio de sesión
/register              📝 Registro
/profile               👤 Perfil de usuario
```

## ⚙️ CONFIGURACIÓN

### Variables de Entorno (.env)
```bash
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME="Diario CdelU"
VITE_ENABLE_SURVEYS=true
VITE_ENABLE_LOTTERIES=true
```

### Scripts NPM
```bash
npm run dev         # Servidor desarrollo (port 5173)
npm run build       # Build producción
npm run preview     # Preview del build
npm run lint        # Verificar código
npm run lint:fix    # Corregir automáticamente
```

## 🧪 TESTING

```bash
npm run test        # Tests unitarios
npm run test:e2e    # Tests end-to-end  
npm run coverage    # Reporte de cobertura
```

## 📊 PERFORMANCE

### 🎯 Métricas Objetivo
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s  
- **Time to Interactive:** < 3.5s

### 🚀 Optimizaciones
- ✅ Lazy loading de rutas
- ✅ Tree shaking automático
- ✅ Code splitting por chunks
- ✅ Compresión gzip/brotli

## 🔐 SEGURIDAD

- ✅ HTTPS en todos los entornos
- ✅ JWT con expiración automática
- ✅ Sanitización de inputs (XSS)
- ✅ CORS configurado restrictivamente
- ✅ Content Security Policy

## 📱 RÉPLICA ANDROID

### 🎯 Estado: **100% COMPLETADO**
- ✅ **Paridad visual:** Colores y tipografía exactos
- ✅ **Componentes:** Todos convertidos a Jetpack Compose
- ✅ **Navegación:** Vue Router → Android Navigation
- ✅ **Estados:** Pinia stores → ViewModels
- ✅ **API:** Endpoints completos disponibles

**📂 Ubicación:** `./cdelu.APK/`

## 🚀 DEPLOYMENT

### 🌐 Entornos
- **🟢 Producción:** https://cdelu.com.ar
- **🟡 Staging:** https://staging.cdelu.com.ar
- **🔵 Desarrollo:** http://localhost:5173

### 🔄 CI/CD
- ✅ GitHub Actions para build automático
- ✅ Tests automáticos en pull requests
- ✅ Deploy automático a staging
- ✅ Deploy manual a producción con aprobación

## 🛠️ STACK TECNOLÓGICO

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Vue.js** | 3.x | Framework principal |
| **Vite** | 4.x | Build tool y dev server |
| **Pinia** | 2.x | Gestión de estado |
| **Vue Router** | 4.x | Enrutamiento SPA |
| **Tailwind CSS** | 3.x | Framework CSS utility-first |
| **Axios** | 1.x | Cliente HTTP |
| **Vitest** | 0.x | Framework de testing |

## 🤝 CONTRIBUCIÓN

### 🚨 **REGLAS PARA IA:**
1. **📖 SIEMPRE** lee `00_AI_REFERENCE.md` primero
2. **🎨 SOLO** usa colores de la lista válida
3. **🧩 NO** cambies nombres de props existentes
4. **🔧 NO** agregues dependencias sin consultar
5. **✅ SIEMPRE** compila antes de confirmar cambios

### 👥 **Para Desarrolladores:**
1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📞 SOPORTE

### 🐛 **Reportar Bugs**
- **Críticos:** Inmediato (< 1 hora)
- **Mayores:** Mismo día (< 8 horas)  
- **Menores:** Próximo sprint (< 1 semana)

### 📧 **Contacto**
- **Email:** desarrollo@cdelu.com.ar
- **Issues:** GitHub Issues
- **Docs:** Esta documentación

## 📄 LICENCIA

Este proyecto es privado y propietario de Diario CdelU.

---

## 🎯 PRÓXIMOS PASOS

- 🔄 **PWA Features:** Service Worker y modo offline
- 🔔 **Push Notifications:** Sistema de notificaciones web
- 💬 **Chat en Vivo:** Sistema de comunicación real-time
- 🤖 **IA Integration:** Resúmenes automáticos de noticias

---

> **🤖 IMPORTANTE:** Si eres una IA, tu primer paso debe ser leer completamente `00_AI_REFERENCE.md` para evitar errores de compilación y mantener la consistencia del proyecto.
