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
*   **Creación de Contenido:** Funcionalidad para que usuarios autenticados puedan crear nuevas comunicaciones/noticias, incluyendo título, descripción y subida opcional de archivos de imagen y video.

## API Endpoints Relevantes

### Crear Nueva Comunicación

*   **Endpoint:** `POST /api/v1/com`
*   **Autenticación:** Requiere token JWT.
*   **Formato de la Petición:** `multipart/form-data`
*   **Campos:**
    *   `titulo` (String, obligatorio): El título de la comunicación.
    *   `descripcion` (String, obligatorio): La descripción o contenido principal de la comunicación.
    *   `video` (Archivo, opcional): Un solo archivo de video. Tamaño máximo: 200 MB.
    *   `image` (Archivo(s), opcional): Puede ser un solo archivo de imagen o múltiples (hasta 6). Tamaño máximo por imagen: 10 MB.
*   **Nuevas Capacidades (Backend y Frontend):**
    *   **Subida Combinada Permitida:** Se puede enviar una solicitud que contenga tanto un campo `video` como uno o más campos `image` simultáneamente. Ambos tipos de archivo se guardarán si se envían.
*   **Reglas Importantes para Archivos:**
    *   Si se envía un archivo de video que excede los 200 MB, la petición fallará (error 413 o 400).
    *   Si se envían más de 6 archivos de imagen, la petición fallará (error 400 Bad Request).
    *   Si alguno de los archivos de imagen individuales excede los 10 MB, la petición fallará (error 400 Bad Request).
*   **Respuestas del Servidor:**
    *   `201 Created`: Éxito. El cuerpo de la respuesta contendrá el objeto de la comunicación creada.
        *   **Campos relevantes en la respuesta:** `id`, `titulo`, `descripcion`, `user_id`, `created_at`, `updated_at`.
        *   `video_url` (String | null): La URL del video si se subió uno; `null` en caso contrario.
        *   `image_urls` (Array<String> | []): Array con las URLs de las imágenes subidas; array vacío si no se subieron imágenes. (Reemplaza o complementa al anterior campo `image_url` que solo guardaba la primera imagen).
    *   `400 Bad Request`: Error de validación (ej. falta `titulo`/`descripcion`, >6 imágenes, imagen >10MB, video >200MB). Respuesta: `{ "error": "Mensaje descriptivo", "details": "..." }`.
    *   `401 Unauthorized`: Token JWT no válido o ausente.
    *   `413 Payload Too Large`: Archivo excede el límite global del servidor (configurado en 200MB en Fastify para la petición completa).
    *   `500 Internal Server Error`: Error inesperado en el servidor.

## Actualizaciones Recientes

- **Configuración de Entornos y Build (Noviembre 2023 - Mayo 2024):**
    - Resueltos errores de build (`TS6305`, `TS2322`) relacionados con tipos en componentes y Vue Router.
    - Implementada la configuración de variables de entorno (`.env.development`, `.env.production`) para gestionar dinámicamente la `BASE_URL` del servicio API.
    - Asegurada la correcta sustitución de la URL de la API en el build de producción.
    - Verificación del bundle de producción para confirmar el uso de la URL correcta.
    - El proyecto ahora está listo para despliegue en `https://trigamer.xyz/` (o la URL de producción configurada).

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
│   ├── com/              # Componentes específicos para "comunicaciones" (ej. CreateComForm.vue)
│   ├── layout/           # Componentes de estructura (Header, Footer de instalación)
│   ├── news/             # Componentes relacionados con noticias (NewsItem, NewsDetail, Comments)
│   └── ui/               # Componentes UI genéricos (botones, inputs - si se crean)
├── router/               # Configuración de Vue Router (index.ts)
├── services/             # Lógica para interactuar con APIs externas (apiService.ts)
├── stores/               # Módulos de Pinia para gestión de estado (si se usa)
├── types/                # Definiciones de tipos e interfaces globales (vite-env.d.ts)
├── views/
│   ├── com/              # Vistas específicas para "comunicaciones" (ej. CreateComView.vue)
│   ├── HomeView.vue
│   ├── NewsDetailView.vue
│   ├── LoginView.vue
│   └── ui/               # Componentes UI genéricos (botones, inputs - si se crean)
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