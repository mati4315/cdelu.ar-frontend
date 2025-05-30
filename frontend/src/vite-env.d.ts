/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string;
  // más variables de entorno aquí
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 