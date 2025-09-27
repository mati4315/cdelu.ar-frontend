import { apiService } from './apiService';
import type { LiveStatus, LiveCommentsPage } from '@/types/live';

const LIVE_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';
const FB_LIVE_QUERY = import.meta.env.VITE_FB_LIVE_QUERY as string | undefined;
const FB_MOCK_PERMALINK = import.meta.env.VITE_FB_MOCK_PERMALINK as string | undefined;
const FB_COMMENTS_QUERY = import.meta.env.VITE_FB_COMMENTS_QUERY as string | undefined;

export async function fetchLiveStatus(): Promise<LiveStatus> {
  // Preferimos usar el mismo cliente base para heredar headers/token
  try {
    const url = new URL(`${LIVE_BASE_URL}/facebook/live-status`);
    if (FB_LIVE_QUERY && FB_LIVE_QUERY.trim().length > 0) {
      // Permite pasar querystring completo, ej: mock=true&permalink=...
      const params = new URLSearchParams(FB_LIVE_QUERY);
      // Normalizar si enviaron un permalink que ya es un embed (plugins/video.php)
      const rawPermalink = params.get('permalink');
      if (rawPermalink && rawPermalink.includes('/plugins/video.php')) {
        try {
          const embed = new URL(rawPermalink);
          const innerHref = embed.searchParams.get('href');
          if (innerHref) params.set('permalink', innerHref);
        } catch {
          // ignorar si no es URL válida
        }
      }
      params.forEach((value, key) => url.searchParams.set(key, value));
    } else if (FB_MOCK_PERMALINK && FB_MOCK_PERMALINK.trim().length > 0) {
      url.searchParams.set('mock', 'true');
      url.searchParams.set('permalink', FB_MOCK_PERMALINK);
    }

    const response = await fetch(url.toString(), {
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Estado HTTP ${response.status}`);
    }
    const data = (await response.json()) as LiveStatus;
    // Si el backend no retorna hlsUrl pero el env contiene hls en la query, forzar fallback en frontend
    if ((!data.hlsUrl || data.hlsUrl.length === 0) && FB_LIVE_QUERY) {
      const q = new URLSearchParams(FB_LIVE_QUERY);
      const hls = q.get('hls');
      if (hls) {
        data.hlsUrl = hls;
      }
    }
    return data;
  } catch (error: any) {
    // fallback consistente
    return { isLive: false };
  }
}

export async function fetchLiveComments(videoId?: string, after?: string): Promise<LiveCommentsPage> {
  const url = new URL(`${LIVE_BASE_URL}/facebook/live-comments`);
  // Modo mock configurable
  if (FB_COMMENTS_QUERY && FB_COMMENTS_QUERY.trim().length > 0) {
    const params = new URLSearchParams(FB_COMMENTS_QUERY);
    params.forEach((value, key) => url.searchParams.set(key, value));
  }
  if (videoId) url.searchParams.set('videoId', videoId);
  if (after) url.searchParams.set('after', after);

  try {
    const response = await fetch(url.toString(), { credentials: 'omit' });
    if (!response.ok) {
      // Fallback mock en cliente si está habilitado
      if ((FB_COMMENTS_QUERY || '').includes('mock=true')) {
        return generateClientMockComments();
      }
      throw new Error(`HTTP ${response.status}`);
    }
    const data = (await response.json()) as LiveCommentsPage;
    // Si backend devuelve vacío y estamos en mock, generar data
    if ((!data.items || data.items.length === 0) && (FB_COMMENTS_QUERY || '').includes('mock=true')) {
      return generateClientMockComments();
    }
    return data;
  } catch {
    // Fallback mock si falla y mock habilitado
    if ((FB_COMMENTS_QUERY || '').includes('mock=true')) {
      return generateClientMockComments();
    }
    return { items: [] };
  }
}

function generateClientMockComments(): LiveCommentsPage {
  const now = Date.now();
  const authors = [
    { name: 'Ana Pérez' },
    { name: 'Carlos Gómez' },
    { name: 'Lucía Fernández' },
    { name: 'Marcos Díaz' },
    { name: 'Sofía López' },
  ];
  const messages = [
    '¡Excelente transmisión!',
    'Saludos desde CdelU 👋',
    'Se escucha perfecto 👍',
    '¿A qué hora empieza la entrevista?',
    'Muy buena producción 👏',
  ];
  const items = Array.from({ length: 5 }).map((_, i) => ({
    id: `mock-${now - i}`,
    author: { name: authors[i % authors.length].name },
    message: messages[i % messages.length],
    createdAt: new Date(now - i * 45_000).toISOString(),
    likeCount: Math.floor(Math.random() * 10),
    replyCount: Math.floor(Math.random() * 3),
  }));
  return { items };
}


