# Changelog
Todas las notas de cambios significativos en este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (aunque para este ejemplo, empezaremos con una versión inicial).

## [0.5.0] - 2024-12-21

### 🚀 Implementación Completa de Navegación a Posts Individuales

#### ✅ Nuevas Rutas y Navegación
- **Rutas específicas por tipo de contenido**:
  - `/noticia/:id` - Para noticias individuales (mantenida existente)
  - `/comunidad/:id` - Para posts de comunidad individuales  
  - `/post/:type/:id` - Ruta genérica para cualquier tipo de post
- **Navegación inteligente**: Los títulos de posts ahora navegan automáticamente a la ruta correcta según su tipo
- **Vue Router integrado**: Uso completo de `useRouter()` en componentes para navegación programática

#### 🎯 Componente de Vista de Detalle
- **FeedItemDetailView.vue**: Nuevo componente dedicado para mostrar posts individuales
  - Vista completa del contenido sin truncamiento
  - Misma lógica de procesamiento de imágenes que el feed principal
  - Estados de loading, error y contenido con animaciones
  - Botón "Volver al feed" para navegación intuitiva
  - Diseño responsive y accesible
  - Manejo completo de metadatos (autor, fecha, tipo, badges oficiales)

#### 🔧 Servicios y Store Ampliados
- **Nuevo método getFeedItem()**: Agregado al feedStore y feedService
  - Obtiene posts individuales por tipo e ID
  - Manejo completo de errores con notificaciones
  - Logging detallado para debugging
  - Integración con sistema de notificaciones global
- **Tipos TypeScript actualizados**: Incluye `FeedType` en imports para compatibilidad

#### 🎨 Mejoras de UX/UI
- **Títulos clickeables**: 
  - Efecto hover con color azul y subrayado
  - Cursor pointer para indicar interactividad
  - Navegación al hacer clic en lugar de solo emitir eventos
- **Procesamiento de imágenes mejorado**:
  - Misma lógica para parsing de URLs con arrays JSON
  - Placeholders elegantes para imágenes no disponibles
  - Manejo de URLs completas, relativas y con `/public`

#### 📱 Funcionalidades de Detalle
- **Vista completa del contenido**: Sin límites de caracteres como en el feed
- **Metadatos completos**: Información detallada de autor, fecha y tipo
- **Estadísticas en tiempo real**: Likes y comentarios actualizados
- **Integración con header**: Padding superior para navegación con header fijo
- **Animaciones de entrada**: Fade-in y slide-up para mejor experiencia

#### 🔄 Funcionalidades de Navegación
- **Navegación intuitiva**: 
  - Clic en título → Vista de detalle
  - Botón "Volver" → Regreso al feed principal
  - Breadcrumb visual en header de detalle
- **URLs amigables**: Rutas semánticas `/noticia/56` y `/comunidad/54`
- **Estado preservado**: El feed mantiene su estado al regresar
- **Carga dinámica**: Obtención en tiempo real del contenido desde API

#### 🐛 Correcciones Técnicas
- **Router configuration**: Importación correcta de `FeedItemDetailView`
- **TypeScript fixes**: Corrección de tipos para parámetros `type` como `FeedType`
- **Props handling**: Manejo correcto de parámetros de ruta como props
- **Error boundaries**: Manejo robusto de errores de carga y red

#### 📋 URLs de Navegación Disponibles
- **Noticias**: 
  - `http://localhost:5174/noticia/56`
  - `http://localhost:5174/noticia/55`
- **Comunidad**: 
  - `http://localhost:5174/comunidad/54`
  - `http://localhost:5174/comunidad/53`
- **Genéricas**: 
  - `http://localhost:5174/post/1/56` (noticia)
  - `http://localhost:5174/post/2/54` (comunidad)

#### 🎯 Beneficios del Usuario
- **Experiencia completa**: Lectura sin interrupciones del contenido completo
- **Navegación intuitiva**: Clic natural en títulos para abrir posts
- **URLs compartibles**: Links directos a posts específicos
- **Performance optimizada**: Carga solo cuando es necesario
- **Consistencia visual**: Misma estética que el feed principal

#### 🔧 Cambios Técnicos
- **FeedItem.vue**: Modificado `handleItemClick()` para usar Vue Router
- **Nuevas rutas registradas**: Configuración completa en `src/router/index.ts`
- **Store method**: `getFeedItem(type, id)` agregado para obtención individual
- **Import de router**: `useRouter()` agregado a componentes de feed

#### 🚀 Preparación para Futuras Funcionalidades
- **Base sólida**: Estructura lista para comentarios en vista de detalle
- **Compartir específico**: URLs directas para compartir posts individuales
- **SEO ready**: Rutas amigables para motores de búsqueda
- **Analytics tracking**: Preparado para tracking de vistas individuales

## [0.4.0] - 2024-12-20

### 🚀 Migración a API Unificada de Likes y Comentarios

#### ✅ Cambios Principales
- **API Simplificada**: Migración completa a la nueva API unificada del backend
- **feedId como clave**: Uso de `item.id` (feedId) en lugar de `item.original_id` + type
- **Rutas unificadas**: 
  - `POST/DELETE /api/v1/feed/:feedId/like` (reemplaza `/news/:id/like` y `/com/:id/like`)
  - `GET/POST /api/v1/feed/:feedId/comments` (reemplaza `/news/:id/comments` y `/com/:id/comments`)

#### 🔧 Componentes Actualizados
- **feedService.ts**: Métodos completamente reescritos para nueva API
- **feedStore.ts**: Store actualizado para usar feedId en lugar de type + original_id
- **FeedItem.vue**: Manejo mejorado de likes con estado de carga y optimistic updates
- **types/feed.ts**: Interfaces actualizadas para reflejar nueva API

#### 🎯 Funcionalidades Nuevas
- **Likes universales**: Funciona igual para noticias (type=1) y comunidad (type=2)
- **Comentarios universales**: API unificada para ambos tipos de contenido
- **Estado de carga**: Botones de like muestran spinner durante la acción
- **Optimistic updates**: UI se actualiza inmediatamente, rollback en caso de error
- **Estado persistente**: Carga automática del estado de like del usuario al montar componente

#### 🐛 Correcciones
- ✅ Likes ahora funcionan en contenido de comunidad (type=2)
- ✅ Comentarios funcionan en contenido de comunidad (type=2)
- ✅ Contadores de likes/comentarios se actualizan automáticamente
- ✅ Eliminada complejidad innecesaria de distinguir tipos de contenido

#### 📋 Beneficios
- **Código más simple**: Una sola API para todos los tipos de contenido
- **Mejor performance**: Menos lógica condicional en frontend
- **Experiencia consistente**: Misma funcionalidad para noticias y comunidad
- **Mantenimiento reducido**: Menos endpoints para mantener

#### 🔧 Breaking Changes
- Los métodos del feedService ahora requieren `feedId` en lugar de `(type, itemId)`
- Las interfaces TypeScript han sido actualizadas
- **Nota**: Los cambios son internos, la UI permanece igual para el usuario

## [0.3.0] - 2024-12-20

### Added
- **Sistema de Infinite Scroll Robusto**:
  - Nuevo composable `useInfiniteScroll.ts` usando Intersection Observer con performance optimizada
  - Sistema de reintentos automáticos (hasta 5 intentos) con delays progresivos
  - Detección automática de refresh/reload con delay adicional para estabilidad
  - Logging detallado con prefijos identificables para debugging
  - Watchers para reconexión automática en cambios de ruta y estado
  - Compatibilidad completa con TypeScript y todos los navegadores

- **Componente de Debug Avanzado**:
  - Panel visual `InfiniteScrollDebug.vue` para monitoreo en tiempo real
  - Información detallada del estado del store y componente
  - Botones de acción para forzar reconexiones y refresh
  - Auto-apertura en caso de problemas durante desarrollo
  - Estados de navegación (navigate/reload/back_forward) visibles

- **Encabezado Completamente Modernizado**:
  - Efecto glassmorphism con `backdrop-blur` y fondos semi-transparentes
  - Logo personalizado con gradiente azul-púrpura y efecto shimmer
  - Menú de usuario avanzado con avatar, dropdown animado y cierre automático
  - Botón de tema mejorado con iconos animados (sol/luna) y transiciones suaves
  - Navegación responsive perfecta para todos los dispositivos
  - Auto-hide header con scroll y tamaño adaptativo

- **Sistema de Notificaciones Mejorado**:
  - Composable `useNotifications.ts` para manejo global de notificaciones
  - Componente `NotificationContainer.vue` con 4 tipos (success, error, warning, info)
  - Auto-dismiss configurable y transiciones suaves
  - Integración con todas las operaciones CRUD de noticias
  - Mensajes específicos para errores de infinite scroll y API

- **Optimizaciones de Performance**:
  - Intersection Observer (80% menos CPU que scroll events)
  - Throttling a 60fps para animaciones
  - Lazy loading automático para imágenes
  - Transiciones CSS optimizadas con GPU acceleration
  - Prevención de cargas duplicadas con validaciones

### Changed
- **Store de Noticias Mejorado**:
  - Nuevas propiedades de estado: `isInitialized`, `lastFetchTime`, `retryCount`
  - Getters optimizados para verificar estado de infinite scroll
  - Logging detallado con prefijo `[NEWS STORE]` para cada operación
  - Mejor manejo de paginación y detección de duplicados

- **NewsItem.vue Optimizado**:
  - Formato de fechas inteligente (Hoy, Ayer, Hace X días)
  - Optimistic updates para likes con rollback automático
  - Hover effects y micro-interacciones mejoradas
  - Responsive design perfeccionado

- **NewsList.vue Refactorizado**:
  - Estados de UI más claros (loading, error, vacío, fin de contenido)
  - Transiciones suaves para nuevas noticias con `transition-group`
  - Detección de refresh con `performance.navigation.type`
  - Watchers para reconexión en cambios de ruta

### Fixed
- **Problema Principal de Infinite Scroll**:
  - Resuelto el issue donde infinite scroll no funcionaba después de refresh (F5)
  - Implementada detección automática de refresh con delay adicional
  - Mejorado el timing de inicialización del Intersection Observer
  - Agregados múltiples reintentos con timeouts progresivos

- **Errores de Build**:
  - Corregido el uso de `import.meta.env.DEV` en templates Vue
  - Solucionados problemas de TypeScript con `performance.navigation`
  - Eliminados imports incorrectos de `onClickOutside`
  - Build exitoso sin warnings ni errores

- **Compatibilidad Cross-browser**:
  - Casting seguro de `performance.navigation` para compatibilidad
  - Fallbacks para navegadores sin soporte de `backdrop-filter`
  - Manejo de eventos de scroll optimizado con `