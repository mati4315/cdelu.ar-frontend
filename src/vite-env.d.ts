/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string;
  readonly VITE_FB_MOCK_PERMALINK?: string;
  readonly VITE_FB_LIVE_QUERY?: string; // e.g. "mock=true&permalink=...&hls=..."
  readonly VITE_FB_COMMENTS_QUERY?: string; // e.g. "mock=true"
  // más variables de entorno aquí
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 