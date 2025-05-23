# Diario CdelU - Frontend

Frontend para el Diario Digital de Concepción del Uruguay, desarrollado con Vue.js, Vite, TypeScript y Tailwind CSS. Esta aplicación busca ofrecer una experiencia de usuario moderna, rápida y accesible, incluyendo funcionalidades de Progressive Web App (PWA) y modo oscuro.

## Características Principales

*   **Vue 3 Composition API:** Utilización de la última API de Vue para un código más organizado y reutilizable.
*   **Vite:** Entorno de desarrollo rápido y eficiente.
*   **TypeScript:** Tipado estático para mayor robustez y mantenibilidad del código.
*   **Vue Router:** Manejo de rutas de la aplicación.
*   **Tailwind CSS:** Framework CSS utility-first para un diseño rápido y personalizable.
*   **Modo Oscuro:** Soporte para tema claro y oscuro, con persistencia de la preferencia del usuario.
*   **Progressive Web App (PWA):**
    *   Instalable en dispositivos móviles y de escritorio.
    *   Capacidades offline básicas gracias al Service Worker.
    *   Manifiesto web para una mejor integración con el sistema operativo.
    *   Footer de invitación a la instalación.
*   **Componentes Reutilizables:** Diseño modular con componentes para noticias, comentarios, layout, etc.
*   **Integración con API Externa:** Conexión con la API del Diario Digital CdelU para obtener y enviar datos.

## Tecnologías Utilizadas

*   **Framework Principal:** [Vue.js 3](https://vuejs.org/)
*   **Bundler / Herramientas de Desarrollo:** [Vite](https://vitejs.dev/)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
*   **Enrutamiento:** [Vue Router](https://router.vuejs.org/)
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
*   **Gestión de Estado (Opcional, si se añade Pinia):** [Pinia](https://pinia.vuejs.org/)
*   **Utilidades Vue:** [VueUse](https://vueuse.org/) (para `useDark`, etc.)
*   **PWA:** [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)

## Estructura del Proyecto (Simplificada)

```
/public/                  # Assets estáticos (iconos, favicon)
/src/
├── assets/               # Assets procesados por Vite (CSS global, fuentes)
├── components/
│   ├── layout/           # Componentes de estructura (Header, Footer de instalación)
│   ├── news/             # Componentes relacionados con noticias (NewsItem, NewsDetail, Comments)
│   └── ui/               # Componentes UI genéricos (botones, inputs - si se crean)
├── router/               # Configuración de Vue Router (index.ts)
├── services/             # Lógica para interactuar con APIs externas (apiService.ts)
├── stores/               # Módulos de Pinia para gestión de estado (si se usa)
├── types/                # Definiciones de tipos e interfaces globales (vite-env.d.ts)
├── views/                # Componentes de página (HomeView, NewsDetailView, LoginView)
├── App.vue               # Componente raíz de la aplicación
├── main.ts               # Punto de entrada de la aplicación
└── vite-env.d.ts         # Tipos para variables de entorno de Vite
/index.html               # Plantilla HTML principal
/tailwind.config.js       # Configuración de Tailwind CSS
/vite.config.ts           # Configuración de Vite
/tsconfig.json            # Configuración de TypeScript
/README.md                # Este archivo
/CHANGELOG.md             # Historial de cambios
```

## Requisitos Previos

*   [Node.js](https://nodejs.org/) (versión LTS recomendada, ej: 18.x o superior)
*   [npm](https://www.npmjs.com/) (generalmente viene con Node.js) o [yarn](https://yarnpkg.com/)

## Instalación

1.  **Clonar el repositorio (si aplica):**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd <NOMBRE_DEL_DIRECTORIO_DEL_PROYECTO>
    ```

2.  **Instalar dependencias:**
    Usando npm:
    ```bash
    npm install
    ```
    O usando yarn:
    ```bash
    yarn install
    ```

## Uso

### Servidor de Desarrollo

Para iniciar el servidor de desarrollo con hot-reload (recarga en caliente):

Usando npm:
```bash
npm run dev
```
O usando yarn:
```bash
yarn dev
```
Esto generalmente levantará la aplicación en `http://localhost:5173`.

### Build para Producción

Para compilar y minificar la aplicación para producción:

Usando npm:
```bash
npm run build
```
O usando yarn:
```bash
yarn build
```
Los archivos optimizados se generarán en la carpeta `dist/`. Puedes servir esta carpeta con un servidor estático.

Para previsualizar el build de producción localmente (después de ejecutar `npm run build`):
Usando npm:
```bash
npm run preview
```
O usando yarn:
```bash
yarn preview
```

### Linting y Formateo (Si se configura ESLint/Prettier)

```bash
# npm run lint
# npm run format
```

## Pruebas PWA

1.  Asegúrate de tener los iconos necesarios en la carpeta `public/` (ej: `logo-192x192.png`, `logo-512x512.png`, `favicon.ico`, `apple-touch-icon.png`).
2.  Ejecuta `npm run build`.
3.  Sirve la carpeta `dist` (ej: `npm install -g serve && serve -s dist`).
4.  Abre la aplicación en un navegador compatible (Chrome, Edge) y busca la opción de "Instalar" o prueba el footer de instalación.

---

*Este README se actualizará a medida que el proyecto evolucione.* 