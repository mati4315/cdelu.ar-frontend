# Changelog
Todas las notas de cambios significativos en este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (aunque para este ejemplo, empezaremos con una versión inicial).

## [Unreleased] - YYYY-MM-DD

### Added
- Inicialización del proyecto con Vite, Vue 3 y TypeScript.
- Configuración básica de Tailwind CSS.
- Componentes de layout iniciales: `AppHeader`.
- Vistas iniciales: `HomeView`, `NewsDetailView`, `LoginView`, `RegisterView`.
- Enrutamiento básico con Vue Router.
- Implementación de funcionalidad de modo oscuro (Dark Mode) con `useDark` de VueUse y persistencia en `localStorage`.
- Botón para alternar tema en `AppHeader`.
- Aplicación de estilos de modo oscuro a componentes principales: `App.vue`, `NewsItem.vue`, `NewsDetail.vue`, `CommentSection.vue`, `LoginView.vue`, `RegisterView.vue`.
- Configuración de Progressive Web App (PWA) usando `vite-plugin-pwa`:
    - Generación de Service Worker y Manifiesto Web.
    - Definición de iconos y assets para PWA.
    - Actualización de `index.html` para PWA.
- Creación del componente `AppInstallFooter.vue` para invitar a la instalación de la PWA, con lógica de aparición basada en scroll y disponibilidad de instalación.
- Integración de `AppInstallFooter` en `App.vue`.
- Creación de `README.md` y `CHANGELOG.md`.

### Changed
- Mejoras de contraste y diseño en modo oscuro para varios componentes.
- Actualización de `vite.config.ts` para mejorar el manejo de rutas SPA por el Service Worker (`navigateFallback`) y habilitar `devOptions` para PWA.
- Actualización de `index.html` con metaetiqueta `mobile-web-app-capable`.
- Mejoradas las reglas de validación y manejo de archivos en el backend para la creación de comunicaciones (`POST /api/v1/com`):
  - Se permite subir un video (máx. 200MB) O hasta 6 imágenes (cada una máx. 10MB).
  - No se pueden subir videos e imágenes simultáneamente.
  - Ajustados los límites de tamaño de archivo en la configuración de Fastify.
  - La API ahora devuelve errores 400 más específicos para fallos de validación de archivos (ej. tamaño excedido, cantidad excedida, combinación inválida).
  - (Frontend) Se adaptó la lógica para interactuar con estas nuevas reglas, aunque no se implementaron validaciones de frontend exhaustivas para estos nuevos límites (se delega principalmente al backend).

### Deprecated
- (Nada por ahora)

### Removed
- (Nada por ahora)

### Fixed
- Corrección de error PostCSS en `AppHeader.vue` simplificando los estilos.
- Creación de `vite-env.d.ts` para solucionar error de tipado con `import.meta.env`.
- Intentos de corrección para errores de `manifest.json` y `favicon.ico` (500 y SyntaxError) mediante ajustes en `vite.config.ts` y limpieza de caché (a verificar).
- Se resolvieron problemas que impedían la correcta creación de comunicaciones desde el frontend. La causa principal del "Error de validación" (400 Bad Request) estaba relacionada con cómo el backend (Fastify con `@fastify/multipart`) procesaba los campos de texto cuando `attachFieldsToBody` era `true`, y cómo el controlador accedía a `request.body.titulo.value` y `request.body.descripcion.value`. Adicionalmente, se clarificaron y ajustaron las reglas de validación para la subida de archivos.

### Security
- (Nada por ahora)

---

## [0.1.0] - (Fecha de inicio del proyecto o primer hito significativo) - Ejemplo

### Added
- Primera versión funcional con listado de noticias y detalle.

## [0.2.0] - 2024-05-17 

### Added
- Funcionalidad para crear nuevas comunicaciones/noticias por usuarios autenticados:
  - Formulario para ingresar título, descripción y subir opcionalmente archivos de imagen y video.
  - Componente `CreateComForm.vue` (en `src/components/com/`) con inputs separados para video e imágenes, pero ahora permitiendo la selección y envío de ambos tipos de archivo simultáneamente.
  - Vista `CreateComView.vue` (en `src/views/com/`) para mostrar el formulario.
  - Acción `crearComunicacion` en el store `news.ts` (Pinia) para manejar la lógica de estado y la llamada a la API.
  - Función `crearComunicacion` en `apiService.ts` para realizar la petición POST al backend, manejando `FormData` para la subida de archivos.
  - Nueva ruta `/comunicaciones/crear` configurada en Vue Router para acceder al formulario.

### Changed
- Se actualizó la lógica del frontend (`CreateComForm.vue`) para permitir la selección y envío simultáneo de un video y múltiples imágenes (hasta 6).
- El backend fue ajustado para aceptar, procesar y guardar tanto video como imágenes en la misma solicitud (`POST /api/v1/com`).
- La respuesta de la API para la creación de comunicación ahora incluye un campo `image_urls` (array de strings) para las URLs de las imágenes, además de `video_url`.
- Se eliminaron las validaciones de frontend que impedían seleccionar un tipo de archivo si el otro ya estaba seleccionado.

### Fixed
- Se resolvieron problemas que impedían la correcta creación de comunicaciones desde el frontend. La causa principal del "Error de validación" (400 Bad Request) estaba relacionada con cómo el backend (Fastify con `@fastify/multipart`) procesaba los campos de texto y la lógica de manejo de archivos. Con los ajustes en el backend y frontend, la subida (incluida la combinada) ahora funciona correctamente.
 