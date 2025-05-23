/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // más variables de entorno aquí
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 