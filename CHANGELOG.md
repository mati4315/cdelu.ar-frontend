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

### Deprecated
- (Nada por ahora)

### Removed
- (Nada por ahora)

### Fixed
- Corrección de error PostCSS en `AppHeader.vue` simplificando los estilos.
- Creación de `vite-env.d.ts` para solucionar error de tipado con `import.meta.env`.
- Intentos de corrección para errores de `manifest.json` y `favicon.ico` (500 y SyntaxError) mediante ajustes en `vite.config.ts` y limpieza de caché (a verificar).

### Security
- (Nada por ahora)

---

## [0.1.0] - (Fecha de inicio del proyecto o primer hito significativo) - Ejemplo

### Added
- Primera versión funcional con listado de noticias y detalle. 