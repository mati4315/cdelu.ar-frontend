# 📢 Guía Completa del Sistema de Publicidad Frontend

## 📋 Resumen del Sistema

El sistema de publicidad permite a los administradores crear, gestionar y monitorear anuncios que se muestran en el feed de la aplicación. Los anuncios se integran de forma nativa con el contenido del feed y proporcionan métricas detalladas de rendimiento.

### ✅ Componentes Implementados

1. **Dashboard de Publicidad** (`views/AdsDashboardView.vue`)
   - Panel de administración completo
   - Estadísticas en tiempo real
   - Gestión CRUD de anuncios
   - Filtros y búsqueda

2. **Servicio de Publicidad** (`services/adsService.ts`)
   - API completa para gestión de anuncios
   - Registro de impresiones y clics
   - Integración con el feed

3. **Tipos TypeScript** (`types/ads.ts`)
   - Interfaces completas para anuncios
   - Tipos para estadísticas y respuestas
   - Configuración de mezcla

4. **Composable de Publicidad** (`composables/useAds.ts`)
   - Hook reutilizable para componentes
   - Gestión de estado reactivo
   - Funciones de tracking

5. **Componente de Anuncio** (`components/feed/FeedAdItem.vue`)
   - Renderizado de anuncios en el feed
   - Tracking automático de impresiones/clics
   - Diseño responsivo

## 🔌 APIs del Backend

### Base URL
```
http://localhost:3001/api/v1
```

### Endpoints de Publicidad

| Método | Endpoint | Descripción | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/ads/active` | Obtener anuncios activos | No | No |
| GET | `/ads` | Listar todos los anuncios | Sí | Sí |
| GET | `/ads/:id` | Obtener anuncio específico | Sí | Sí |
| POST | `/ads` | Crear nuevo anuncio | Sí | Sí |
| PUT | `/ads/:id` | Actualizar anuncio | Sí | Sí |
| DELETE | `/ads/:id` | Eliminar anuncio | Sí | Sí |
| GET | `/ads/stats` | Obtener estadísticas | Sí | Sí |
| POST | `/ads/:id/impression` | Registrar impresión | No | No |
| POST | `/ads/:id/click` | Registrar clic | No | No |
| GET | `/feed` | Feed con anuncios mezclados | No | No |

### Endpoints de Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/register` | Registrarse |
| GET | `/auth/me` | Obtener perfil del usuario |
| POST | `/auth/logout` | Cerrar sesión |

## 📊 Estructura de Datos (APIs)

### Anuncio (Ad)
```json
{
  "id": 1,
  "titulo": "Anuncio de Prueba",
  "descripcion": "Descripción del anuncio",
  "image_url": "https://example.com/image.jpg",
  "enlace_destino": "https://example.com/destino",
  "texto_opcional": "Texto adicional",
  "categoria": "gaming",
  "prioridad": 5,
  "activo": true,
  "impresiones_maximas": 1000,
  "impresiones_actuales": 150,
  "clics_count": 25,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Estadísticas de Anuncios (AdsStats)
```json
{
  "total": 10,
  "activos": 8,
  "inactivos": 2,
  "total_impresiones": 5000,
  "total_clics": 250,
  "ctr_promedio": 5.0,
  "por_categoria": {
    "gaming": 4,
    "tecnologia": 3,
    "eventos": 2,
    "general": 1
  }
}
```

### Respuesta de Anuncios Activos
```json
{
  "data": [
    {
      "id": 1,
      "titulo": "Anuncio Activo",
      "activo": true
      // ... más campos
    }
  ],
  "total": 5
}
```

## 🔧 Ejemplos de Llamadas a la API

### 1. Obtener Anuncios Activos (Público)
```javascript
// GET /api/v1/ads/active
const response = await fetch('http://localhost:3001/api/v1/ads/active');
const data = await response.json();

// Respuesta esperada:
{
  "data": [
    {
      "id": 1,
      "titulo": "Anuncio Activo",
      "activo": true
      // ... más campos
    }
  ],
  "total": 5
}
```

### 2. Crear Anuncio (Admin)
```javascript
// POST /api/v1/ads
const response = await fetch('http://localhost:3001/api/v1/ads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    "titulo": "Nuevo Anuncio",
    "descripcion": "Descripción del anuncio",
    "image_url": "https://example.com/image.jpg",
    "enlace_destino": "https://example.com/destino",
    "texto_opcional": "Texto adicional",
    "categoria": "gaming",
    "prioridad": 5,
    "activo": true,
    "impresiones_maximas": 1000
  })
});
```

### 3. Registrar Impresión (Público)
```javascript
// POST /api/v1/ads/1/impression
const response = await fetch('http://localhost:3001/api/v1/ads/1/impression', {
  method: 'POST'
});
```

### 4. Registrar Clic (Público)
```javascript
// POST /api/v1/ads/1/click
const response = await fetch('http://localhost:3001/api/v1/ads/1/click', {
  method: 'POST'
});
```

### 5. Obtener Estadísticas (Admin)
```javascript
// GET /api/v1/ads/stats
const response = await fetch('http://localhost:3001/api/v1/ads/stats', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

## 🚀 Configuración del Servicio Frontend

### Configuración de Axios (adsService.ts)
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const adsApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor para autenticación
adsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adsService = {
  async getActiveAds(): Promise<ActiveAdsResponse> {
    const response = await adsApi.get('/api/v1/ads/active');
    return response.data;
  },

  async getAllAds(params?: AdsParams): Promise<AdsResponse> {
    const response = await adsApi.get('/api/v1/ads', { params });
    return response.data;
  },

  async createAd(ad: AdForm): Promise<Ad> {
    const response = await adsApi.post('/api/v1/ads', ad);
    return response.data.data;
  },

  async registerImpression(id: number): Promise<void> {
    await adsApi.post(`/api/v1/ads/${id}/impression`);
  },

  async registerClick(id: number): Promise<void> {
    await adsApi.post(`/api/v1/ads/${id}/click`);
  }
};
```

## 🔐 Autenticación y Autorización

### Headers Requeridos
```javascript
// Para rutas que requieren autenticación
headers: {
  'Authorization': 'Bearer ' + localStorage.getItem('token'),
  'Content-Type': 'application/json'
}
```

### Roles de Usuario
- **`usuario`**: Puede ver anuncios en el feed
- **`administrador`**: Puede crear, editar y gestionar anuncios

### Verificación de Permisos
```javascript
// En el router guard
if (to.meta.requiresAdmin && user.rol !== 'administrador') {
  next({ name: 'Home' });
  return;
}
```

## 📁 Estructura Completa de Archivos

```
frontend/src/
├── views/
│   ├── AdsDashboardView.vue          # ✅ Dashboard admin (IMPLEMENTADO)
│   └── LotteryDetailView.vue         # ✅ Vista detallada de loterías (NUEVO)
├── services/
│   └── adsService.ts                 # ✅ Servicio API (IMPLEMENTADO)
├── types/
│   └── ads.ts                        # ✅ Tipos TypeScript (IMPLEMENTADO)
├── composables/
│   └── useAds.ts                     # ✅ Composable (IMPLEMENTADO)
├── components/feed/
│   ├── FeedAdItem.vue                # ✅ Componente anuncio (IMPLEMENTADO)
│   └── FeedLotteryAdItem.vue         # ✅ Componente anuncio lotería (NUEVO)
├── components/lottery/
│   └── LotteryCard.vue               # ✅ Tarjeta de lotería (ACTUALIZADA)
├── router/
│   └── index.ts                      # ✅ Rutas configuradas (ACTUALIZADO)
├── test-lottery-ad.js                # ✅ Script de prueba (NUEVO)
├── test-lottery-ad-simple.js         # ✅ Script simplificado (NUEVO)
├── debug-backend-ads.js              # ✅ Script de debug (NUEVO)
├── test-lottery-system-integration.js # ✅ Script de integración (NUEVO)
├── test-lottery-detail.js            # ✅ Script de vista detallada (NUEVO)
└── READMES/
    └── create-lottery-ad.js          # ✅ Worker automático (BACKEND)
```

## 🎯 Estados de Anuncio

### Estados de Anuncio
- **`activo: true`**: Visible en el feed
- **`activo: false`**: Oculto del feed

### Categorías Disponibles
- **`gaming`**: Videojuegos y entretenimiento
- **`tecnologia`**: Tecnología y gadgets
- **`eventos`**: Eventos y actividades
- **`general`**: Anuncios generales

### Prioridades
- **1-10**: Mayor número = mayor prioridad
- **5**: Prioridad media por defecto
- **3**: Prioridad especial para anuncios de lotería dinámica

### Tipos Especiales
- **`lottery_dynamic`**: Anuncio dinámico de lotería que se actualiza automáticamente

## 🎨 Características de UI/UX

### Dashboard de Administración
- **Estadísticas en tiempo real**: Total anuncios, activos, impresiones, clics, CTR
- **Filtros avanzados**: Por categoría, estado, ordenamiento
- **Gestión CRUD**: Crear, editar, eliminar anuncios
- **Diseño responsivo**: Adaptado a móvil, tablet y desktop

### Componente de Anuncio en Feed
- **Diseño nativo**: Se integra naturalmente con el contenido
- **Badge de identificación**: "Publicidad" claramente marcado
- **Tracking automático**: Impresiones al cargar, clics al hacer click
- **Estadísticas visibles**: Impresiones, clics, CTR
- **Enlace externo**: Abre en nueva pestaña

### Componente de Anuncio de Lotería Especial
- **🎰 Diseño especial**: Gradiente amarillo-naranja distintivo
- **📊 Estadísticas de lotería**: Tickets vendidos, precio, ganadores
- **⏰ Tiempo restante**: Muestra cuándo finaliza la lotería
- **👤 Estado personalizado**: "Ya participaste" o "¡Aún no participas!"
- **🎯 Botón inteligente**: "Participar" o "Ver mi número" según el caso
- **📈 Barra de progreso**: Visualización del progreso de la lotería

### Estados Visuales
- **Loading**: Spinner con mensaje descriptivo
- **Empty State**: Icono y mensaje amigable
- **Error**: Banner rojo con opción de cerrar
- **Success**: Feedback visual en acciones

## 🔧 Variables de Entorno

### .env (Crear en la raíz del frontend)
```bash
# Variables de entorno para el frontend
VITE_API_URL=http://localhost:3001
```

### Uso en el código
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
```

## 🚀 Pasos de Implementación

### 1. Verificar Backend
```bash
# Verificar que el backend responde
curl http://localhost:3001/api/v1/ads/active
# Debería devolver: {"data":[],"total":0}
```

### 2. Instalar Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Crear Usuario Administrador
```bash
# Crear usuario con rol administrador en el backend
```

### 4. Probar Conexión
```bash
# Acceder al dashboard
http://localhost:5173/publicidad
```

## 🐛 Solución de Problemas

### ❌ Error 404 en API
**Problema**: `GET http://localhost:3001/api/v1/ads/active 404`
**Solución**: Verificar que el backend tenga las rutas de ads implementadas

### ❌ Error de CORS
**Problema**: CORS policy error
**Solución**: Configurar CORS en el backend

```javascript
// En el backend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### ❌ Error de Autenticación
**Problema**: 401 Unauthorized
**Solución**: Verificar token JWT

```javascript
// Verificar que el token esté en localStorage
const token = localStorage.getItem('token');
console.log('Token:', token);
```

### ❌ Anuncios no se muestran en el feed
**Problema**: Feed sin anuncios mezclados
**Solución**: Verificar integración en FeedMain.vue

```typescript
// En FeedMain.vue
import { useAds } from '@/composables/useAds';
const { activeAds, registerImpression, registerClick } = useAds();
```

## 📋 Checklist de Implementación

### Backend
- [ ] Servidor corriendo en puerto 3001
- [ ] Base de datos MySQL conectada
- [ ] Tablas de ads creadas
- [ ] Rutas de API configuradas
- [ ] CORS habilitado para localhost:5173
- [ ] Usuario administrador creado
- [ ] JWT configurado

### Frontend
- [ ] Servidor de desarrollo corriendo en puerto 5173
- [ ] Dashboard implementado (`views/AdsDashboardView.vue`)
- [ ] Servicio de API implementado (`services/adsService.ts`)
- [ ] Tipos TypeScript definidos (`types/ads.ts`)
- [ ] Composable implementado (`composables/useAds.ts`)
- [ ] Componente de anuncio creado (`components/feed/FeedAdItem.vue`)
- [ ] Ruta configurada en router (`/publicidad`)
- [ ] Variables de entorno configuradas

### Pruebas
- [ ] API responde correctamente
- [ ] Frontend se conecta sin errores 404
- [ ] Login de administrador funciona
- [ ] Creación de anuncios funciona
- [ ] Anuncios se muestran en el feed
- [ ] Tracking de impresiones funciona
- [ ] Tracking de clics funciona
- [ ] Dashboard muestra estadísticas
- [ ] Responsive design en móvil

## 🎯 Funcionalidades Implementadas

### ✅ Administradores
- [x] Dashboard con estadísticas en tiempo real
- [x] Crear nuevos anuncios
- [x] Editar anuncios existentes
- [x] Activar/desactivar anuncios
- [x] Eliminar anuncios
- [x] Filtrar por categoría y estado
- [x] Ordenar por diferentes criterios
- [x] Ver métricas de rendimiento
- [x] **Crear anuncios especiales de lotería dinámica**
- [x] **Banner de loterías activas en tiempo real**
- [x] **Sistema automático de gestión de anuncios de lotería**

### ✅ Usuarios
- [x] Ver anuncios en el feed
- [x] Anuncios claramente identificados
- [x] Tracking automático de impresiones
- [x] Tracking de clics
- [x] Enlaces externos seguros
- [x] **Ver anuncios dinámicos de lotería con prioridad 3**
- [x] **Botones inteligentes: "Participar" o "Ver mi número"**
- [x] **Estadísticas de lotería en tiempo real**

### ✅ Sistema Automático
- [x] **Worker automático cada 5 minutos**
- [x] **Verificación automática de loterías activas**
- [x] **Creación/actualización automática de anuncios**
- [x] **Activación/desactivación dinámica según estado**
- [x] **Banner visual con contador de loterías activas**

### ✅ Sistema
- [x] Autenticación y autorización
- [x] Validaciones en tiempo real
- [x] Manejo de errores
- [x] Estados de carga
- [x] Diseño responsivo
- [x] Animaciones y transiciones

## 🎨 Temas y Estilos

### Colores
- **Primario**: Purple-600 (#9333ea)
- **Secundario**: Blue-600 (#2563eb)
- **Éxito**: Green-600 (#16a34a)
- **Error**: Red-600 (#dc2626)
- **Advertencia**: Yellow-600 (#ca8a04)

### Gradientes
- **Anuncios**: `from-purple-50 to-blue-50`
- **Botones**: `from-purple-600 to-blue-600`
- **Header**: `from-purple-500 to-blue-500`

## 📱 Responsive Design

### Breakpoints
- **Móvil**: < 768px (1 columna)
- **Tablet**: 768px - 1024px (2 columnas)
- **Desktop**: > 1024px (3-4 columnas)

### Componentes Adaptativos
- Grid responsivo con Tailwind
- Modales centrados en móvil
- Botones apilados en pantallas pequeñas

## 🧪 Scripts de Prueba

### 1. Verificar API
```bash
curl http://localhost:3001/api/v1/ads/active
```

### 2. Crear Anuncio de Prueba
```javascript
// En la consola del navegador
const response = await fetch('http://localhost:3001/api/v1/ads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({
    titulo: 'Anuncio de Prueba',
    descripcion: 'Descripción del anuncio',
    enlace_destino: 'https://example.com',
    categoria: 'general',
    prioridad: 5,
    activo: true,
    impresiones_maximas: 1000
  })
});
```

## 📞 Contacto y Soporte

### Para el Desarrollador Frontend

1. **Verificar Configuración**:
   - Backend en puerto 3001
   - Frontend en puerto 5173
   - Base de datos conectada

2. **Archivos Clave**:
   - `frontend/src/services/adsService.ts` - Configuración de API
   - `frontend/src/views/AdsDashboardView.vue` - Dashboard principal
   - `frontend/src/components/feed/FeedAdItem.vue` - Componente anuncio

3. **Comandos Útiles**:
   ```bash
   # Desarrollo
   npm run dev
   
   # Verificar tipos
   npm run type-check
   
   # Linting
   npm run lint
   ```

4. **URLs Importantes**:
   - Dashboard admin: `http://localhost:5173/publicidad`
   - API backend: `http://localhost:3001/api/v1/ads`
   - Feed con anuncios: `http://localhost:5173/`

### Problemas Comunes y Soluciones

1. **Error 404**: Verificar que el backend tenga las rutas de ads
2. **Error CORS**: Configurar backend para aceptar localhost:5173
3. **Error Auth**: Verificar token JWT en localStorage
4. **Anuncios no aparecen**: Verificar integración en FeedMain.vue

---

**✅ Sistema de Publicidad Completamente Implementado**  
**Versión**: 1.0.0  
**Última actualización**: Enero 2024  
**Desarrollado por**: Equipo CdelU 