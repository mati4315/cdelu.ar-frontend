# 📋 Guía para Desarrollador Backend - Frontend Vue.js

## 🎯 Información General del Frontend

### Stack Tecnológico
- **Framework**: Vue 3 + TypeScript
- **Estado Global**: Pinia
- **Router**: Vue Router 4
- **Build Tool**: Vite
- **CSS**: Tailwind CSS
- **HTTP Client**: Axios
- **PWA**: Vite PWA Plugin
- **Desarrollo**: Hot Module Replacement (HMR)

### Estructura de Carpetas
```
src/
├── components/          # Componentes reutilizables
│   ├── auth/           # Autenticación
│   ├── news/           # Noticias
│   ├── com/            # Comunicaciones
│   └── debug/          # Herramientas de debug
├── composables/        # Lógica reutilizable
├── services/           # Servicios API
├── store/             # Estado global (Pinia)
├── types/             # Tipos TypeScript
├── router/            # Configuración de rutas
└── styles/            # Estilos globales
```

## 🌐 Configuración de CORS y Servidor

### CORS Headers Requeridos
```javascript
// Headers que necesita el frontend
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

### URLs del Frontend
- **Desarrollo**: `http://localhost:5173`
- **Producción**: (configurar según tu dominio)

## 📡 API Contract - Noticias

### Base URL Esperada
```
Desarrollo: http://localhost:3001/api/v1
Producción: https://tu-dominio.com/api/v1
```

### Endpoints Implementados en Frontend

#### 1. GET /news - Listar Noticias
**Parámetros de consulta**:
```typescript
{
  page?: number;     // Página (default: 1)
  limit?: number;    // Límite por página (default: 10, max: 100)
  sort?: string;     // Campo de ordenación
  order?: 'asc' | 'desc'; // Dirección de ordenación
}
```

**Respuesta esperada**:
```typescript
{
  data: News[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

#### 2. GET /news/:id - Noticia Individual
**Respuesta esperada**:
```typescript
{
  id: number;
  titulo: string;
  descripcion: string;
  resumen?: string;
  image_url?: string;
  original_url?: string;
  published_at: string;
  is_oficial: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  autor: string;
  likes_count?: number;
  comments_count?: number;
}
```

#### 3. POST /news - Crear Noticia
**Headers requeridos**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body esperado**:
```typescript
{
  titulo: string;        // Requerido
  descripcion: string;   // Requerido
  image_url?: string;    // Opcional
  original_url?: string; // Opcional
  is_oficial: boolean;   // Requerido
}
```

#### 4. POST /news/:id/like - Dar Like
**Headers requeridos**:
```
Authorization: Bearer <token>
```

#### 5. DELETE /news/:id/like - Quitar Like
**Headers requeridos**:
```
Authorization: Bearer <token>
```

#### 6. GET /news/:id/comments - Comentarios
**Respuesta esperada**:
```typescript
Comment[] = {
  id: number;
  content: string;
  author: string;
  created_at: string;
  // ... otros campos
}
```

#### 7. POST /news/:id/comments - Crear Comentario
**Body esperado**:
```typescript
{
  content: string; // Requerido
}
```

## 🔐 Autenticación

### Sistema de Tokens
El frontend espera **JWT tokens** con:
- **Access Token**: Para autenticación de requests
- **Refresh Token**: Para renovar tokens expirados
- **Expiración**: Manejada automáticamente

### Headers de Autenticación
```
Authorization: Bearer <access_token>
```

### Roles de Usuario
```typescript
type UserRole = 'administrador' | 'colaborador' | 'usuario';
```

## 📊 Formato de Respuestas de Error

### Estructura Esperada
```typescript
// Error 400/422 - Validación
{
  message: string;
  errors?: {
    field: string[];
  };
}

// Error 401 - No autorizado
{
  message: "No autorizado";
}

// Error 403 - Sin permisos
{
  message: "Sin permisos para esta operación";
}

// Error 404 - No encontrado
{
  message: "Recurso no encontrado";
}

// Error 500 - Error del servidor
{
  message: "Error interno del servidor";
}
```

## 🚀 Features Especiales del Frontend

### 1. Infinite Scroll
- **Implementación**: Intersection Observer
- **Trigger**: 150px antes del final
- **Batch size**: 10-12 noticias por carga
- **Performance**: Optimizado para 60fps

### 2. Sistema de Notificaciones
- **Tipos**: success, error, warning, info
- **Auto-dismiss**: Configurable
- **Posición**: Top-right
- **Accesibilidad**: Soporte para screen readers

### 3. PWA (Progressive Web App)
- **Service Worker**: Automático
- **Offline**: Cache de recursos estáticos
- **Installable**: En dispositivos móviles

### 4. Real-time Features (Futuro)
- **WebSockets**: Para notificaciones en tiempo real
- **Server-Sent Events**: Para actualizaciones de noticias

## 🔧 Configuración del Servicio API

### Variables de Entorno Backend
```env
# CORS
FRONTEND_URL=http://localhost:5173
CORS_ENABLED=true

# API
API_VERSION=v1
BASE_PATH=/api

# Rate Limiting (recomendado)
RATE_LIMIT_WINDOW=900000  # 15 minutos
RATE_LIMIT_MAX=100        # 100 requests por ventana
```

### Configuración de Rate Limiting
```javascript
// Sugerencia para Express.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: {
    message: 'Demasiadas peticiones, intenta de nuevo más tarde'
  }
});
```

## 📱 Responsive Design

### Breakpoints Utilizados
```css
/* Tailwind CSS breakpoints */
sm: 640px    /* Móvil grande */
md: 768px    /* Tablet */
lg: 1024px   /* Desktop */
xl: 1280px   /* Desktop grande */
2xl: 1536px  /* Desktop XL */
```

### Consideraciones Mobile-First
- **Touch targets**: Mínimo 44px
- **Viewport**: Responsive design
- **Performance**: Lazy loading de imágenes
- **Accessibility**: ARIA labels y semantic HTML

## 🧪 Testing y Debug

### Entornos de Testing
```typescript
// Headers para identificar entorno
X-Environment: development | production | testing
X-Debug-Mode: true | false
```

### Debug Features (Solo Desarrollo)
- **Panel de debug**: Infinite scroll monitoring
- **Console logging**: Detallado con prefijos
- **Error boundaries**: Captura de errores React-style
- **Performance monitoring**: Métricas en tiempo real

## 📈 Métricas y Analytics

### Eventos que el Frontend Puede Enviar
```typescript
// Eventos de usuario
{
  event: 'news_view' | 'news_like' | 'news_share' | 'comment_create';
  data: {
    news_id: number;
    user_id: number;
    timestamp: string;
  };
}
```

### Performance Metrics
- **Time to First Byte (TTFB)**
- **Largest Contentful Paint (LCP)**
- **First Input Delay (FID)**
- **Cumulative Layout Shift (CLS)**

## 🔄 Estados de Carga

### Loading States que Maneja el Frontend
```typescript
interface LoadingStates {
  isLoading: boolean;        // Carga general
  isInfiniteLoading: boolean; // Infinite scroll
  isSubmitting: boolean;     // Formularios
  isUploading: boolean;      // Subida de archivos
  uploadProgress: number;    // Progreso 0-100
}
```

## 📁 Upload de Archivos

### Formato Esperado para Imágenes
```typescript
// Multipart/form-data
FormData {
  file: File;              // Archivo de imagen
  titulo?: string;         // Título opcional
  descripcion?: string;    // Descripción opcional
}

// Callback de progreso
onUploadProgress: (progressEvent) => {
  const progress = (progressEvent.loaded / progressEvent.total) * 100;
  // Frontend actualiza barra de progreso
}
```

### Validaciones de Archivo
- **Tamaño máximo**: 5MB
- **Formatos**: JPG, PNG, WEBP, GIF
- **Dimensiones**: Recomendado 1200x630px para noticias

## 🛡️ Seguridad

### Headers de Seguridad Recomendados
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Sanitización de Datos
- **HTML**: El frontend NO sanitiza HTML, debe hacerse en backend
- **SQL Injection**: Usar prepared statements
- **XSS**: Sanitizar todos los inputs de usuario

## 🚨 Manejo de Errores

### Códigos de Estado HTTP
```typescript
// El frontend maneja estos códigos específicamente
200: 'Éxito'
201: 'Creado'
400: 'Datos inválidos'
401: 'No autorizado' → Redirect a login
403: 'Sin permisos' → Mostrar mensaje
404: 'No encontrado'
409: 'Conflicto'
422: 'Error de validación'
429: 'Rate limit excedido'
500: 'Error del servidor'
503: 'Servicio no disponible'
```

### Retry Logic
- **Network errors**: 3 reintentos automáticos
- **Rate limiting**: Exponential backoff
- **Server errors**: 1 reintento después de 2 segundos

## 📞 Comunicación y Colaboración

### Proceso de Desarrollo
1. **Frontend** implementa según contract API
2. **Backend** implementa endpoints según especificación
3. **Testing** conjunto en ambiente de desarrollo
4. **Deploy** coordinado

### Herramientas de Comunicación
- **API Documentation**: Swagger/OpenAPI
- **Postman Collection**: Para testing manual
- **TypeScript Types**: Compartidos entre frontend/backend

### Reportar Issues
Cuando reportes problemas, incluye:
- **URL del endpoint**
- **Método HTTP**
- **Headers enviados**
- **Body de la request**
- **Respuesta recibida**
- **Comportamiento esperado vs actual**

## 🎉 Conclusión

El frontend está diseñado para ser:
- **Robusto**: Manejo de errores y edge cases
- **Performante**: Optimizaciones de carga y renderizado
- **Escalable**: Arquitectura modular y componible
- **Accesible**: Cumple estándares WCAG
- **Mobile-first**: Diseño responsive

Tu backend debe enfocarse en:
- **APIs RESTful** consistentes
- **Respuestas rápidas** (< 200ms promedio)
- **Manejo de errores** claro y descriptivo
- **Seguridad** robusta
- **Documentación** actualizada

¡Estamos listos para trabajar juntos! 🚀 