<template>
  <div v-if="liveStore.isLiveVisible" class="fixed z-[100] inset-0 pointer-events-none">
    <!-- Minimizado: botón flotante circular, draggable, lado izquierdo -->
    <div
      v-if="liveStore.player.isMinimized"
      class="pointer-events-auto fixed"
      :style="minimizedStyle"
    >
      <div class="relative flex items-center gap-2 select-none" @pointerdown.prevent="startDrag('min', $event)">
        <span class="absolute -left-1 -top-1 inline-flex h-4 w-4">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
        </span>
        <button
          class="h-14 w-14 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          @click.stop="maximize"
          aria-label="Abrir Live"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-7 w-7">
            <path d="M12 6v12m6-6H6" />
          </svg>
        </button>
        <span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 shadow">EN VIVO</span>
        <!-- Elemento oculto para audio de fondo cuando hay HLS -->
        <video v-if="hlsUrl" ref="bgAudioEl" class="hidden" playsinline preload="auto"></video>
      </div>
    </div>

    <!-- Maximizado: panel con video o audio -->
    <div
      v-else
      class="pointer-events-auto fixed rounded-xl bg-white dark:bg-gray-800 shadow-2xl overflow-hidden"
      :style="maximizedStyle"
      @pointerdown.prevent="startDrag('max', $event)"
    >
      <div class="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 cursor-move" :style="{ height: headerBarPx + 'px' }">
        <div class="flex items-center gap-2">
          <span class="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <p class="text-sm font-medium">En vivo{{ liveTitle ? `: ${liveTitle}` : '' }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="toggleMute" class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" :aria-label="liveStore.player.isMuted ? 'Activar sonido' : 'Silenciar'">
            <span v-if="liveStore.player.isMuted">🔇</span>
            <span v-else>🔊</span>
          </button>
          <button @click="minimize" class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Minimizar">—</button>
          <button @click="dismiss" class="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-300" aria-label="Cerrar">✕</button>
        </div>
      </div>

      <div class="bg-black" :style="{ height: `calc(100% - ${headerBarPx}px)` }">
        <!-- Si tenemos HLS, usamos <video> propio con hls.js -->
        <video
          v-if="hlsUrl"
          ref="videoEl"
          class="w-full h-full"
          playsinline
          :muted="liveStore.player.isMuted"
          controls
          @ended="onEnded"
          @loadeddata="onLoaded"
          @play="onPlay"
          @pause="onPause"
        />

        <!-- Fallback: iframe oficial de Facebook -->
        <iframe
          v-else-if="embedUrl"
          class="w-full h-full"
          :src="computedEmbedUrl"
          style="border:none;overflow:hidden"
          scrolling="no"
          frameborder="0"
          allowfullscreen="true"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          @load="onIframeLoad"
        />

        <div v-else class="w-full h-full flex items-center justify-center text-sm text-gray-400">No hay transmisión disponible</div>
      </div>

      <!-- Handle de resize -->
      <div
        class="absolute right-1 bottom-1 h-4 w-4 cursor-nwse-resize opacity-70"
        @pointerdown.stop.prevent="startResize($event)"
        title="Redimensionar"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 text-gray-400">
          <path d="M3 21h18v-2H5V3H3v18z" transform="rotate(45 12 12)" />
        </svg>
      </div>
    </div>
  </div>
  
  
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import Hls from 'hls.js';
import { useLiveStore } from '@/store/live';
import { useLiveStatus } from '@/composables/useLiveStatus';

const liveStore = useLiveStore();
useLiveStatus(30_000); // polling cada 30s

const videoEl = ref<HTMLVideoElement | null>(null);
let hls: Hls | null = null;
const bgAudioEl = ref<HTMLVideoElement | null>(null);

const hlsUrl = computed(() => liveStore.status.hlsUrl ?? '');
const embedUrl = computed(() => liveStore.status.embedUrl ?? '');
const liveTitle = computed(() => liveStore.status.title ?? '');
const headerBarPx = 40;

const computedEmbedUrl = computed(() => {
  if (!embedUrl.value) return '';
  const url = new URL(embedUrl.value);
  // Asegurar autoplay posible (silenciado) donde aplique; Facebook puede ignorar algunos params
  url.searchParams.set('autoplay', 'true');
  url.searchParams.set('mute', liveStore.player.isMuted ? 'true' : 'false');
  url.searchParams.set('allowfullscreen', 'true');
  return url.toString();
});

function attachHls(): void {
  if (!videoEl.value || !hlsUrl.value) return;
  if (Hls.isSupported()) {
    hls = new Hls({ autoStartLoad: true });
    hls.loadSource(hlsUrl.value);
    hls.attachMedia(videoEl.value);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      tryPlay();
    });
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        destroyHls();
      }
    });
  } else if (videoEl.value.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari soporta HLS nativo
    videoEl.value.src = hlsUrl.value;
    tryPlay();
  }
}

// Reproducción en segundo plano (minimizado) cuando hay HLS
function attachBackgroundAudio(): void {
  if (!bgAudioEl.value || !hlsUrl.value) return;
  try {
    if (Hls.isSupported()) {
      const h = new Hls({ autoStartLoad: true });
      h.loadSource(hlsUrl.value);
      h.attachMedia(bgAudioEl.value);
      h.on(Hls.Events.MANIFEST_PARSED, () => {
        tryBgPlay();
      });
      h.on(Hls.Events.ERROR, () => { /* noop bg */ });
    } else if (bgAudioEl.value.canPlayType('application/vnd.apple.mpegurl')) {
      bgAudioEl.value.src = hlsUrl.value;
      tryBgPlay();
    }
  } catch { /* noop */ }
}

function tryBgPlay(): void {
  if (!bgAudioEl.value) return;
  // Por políticas de autoplay, iniciamos en mute
  bgAudioEl.value.muted = true;
  bgAudioEl.value.play().catch(() => {/* ignorar bloqueo de autoplay */});
}

function destroyHls(): void {
  if (hls) {
    hls.destroy();
    hls = null;
  }
}

function tryPlay(): void {
  if (!videoEl.value) return;
  // Autoplay suele requerir mute
  videoEl.value.muted = liveStore.player.isMuted;
  videoEl.value.play().catch(() => {/* ignorar bloqueo de autoplay */});
}

function onEnded(): void {
  // si terminó, ocultamos
  liveStore.setStatus({ isLive: false });
}

function onLoaded(): void {
  tryPlay();
}

function onPlay(): void {
  // noop para métricas si se quiere
}

function onPause(): void {
  // noop
}

function onIframeLoad(): void {
  // No tenemos acceso al contenido por cross-origin; confiamos en el backend para estado
}

function maximize(): void {
  liveStore.maximize();
}

function minimize(): void {
  liveStore.minimize();
}

function toggleMute(): void {
  liveStore.toggleMute();
  if (videoEl.value) {
    videoEl.value.muted = liveStore.player.isMuted;
    if (!liveStore.player.isMuted) tryPlay();
  }
    if (bgAudioEl.value) {
      bgAudioEl.value.muted = liveStore.player.isMuted;
      if (!liveStore.player.isMuted) tryBgPlay();
    }
}

function dismiss(): void {
  liveStore.dismissUntilNextLive();
}

function reopen(): void {
  liveStore.resetDismiss();
  liveStore.show();
  liveStore.minimize();
}

watch(hlsUrl, (newUrl, oldUrl) => {
  if (newUrl && newUrl !== oldUrl) {
    destroyHls();
    attachHls();
  }
});

watch(() => liveStore.player.isMinimized, (isMin) => {
  if (!isMin && hlsUrl.value) {
    // al maximizar, asegurar que el video intente reproducir
    setTimeout(tryPlay, 0);
  }
});

onMounted(() => {
  // Siempre arrancar minimizado para simular PiP/pantalla partida
  liveStore.minimize();
  if (hlsUrl.value) attachHls();
  if (hlsUrl.value) attachBackgroundAudio();
  // Desbloquear sonido al primer gesto del usuario
  const unlock = () => {
    liveStore.setMuted(false);
    if (bgAudioEl.value) { bgAudioEl.value.muted = false; tryBgPlay(); }
    if (videoEl.value && !liveStore.player.isMinimized) { videoEl.value.muted = false; tryPlay(); }
    window.removeEventListener('click', unlock);
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('scroll', unlock, true);
  };
  window.addEventListener('click', unlock, { once: true });
  window.addEventListener('touchstart', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
  window.addEventListener('scroll', unlock, { once: true, capture: true });
});

onBeforeUnmount(() => {
  destroyHls();
});

// Drag logic (minimized and maximized)
type DragTarget = 'min' | 'max';
const dragging = ref<DragTarget | null>(null);
const pointerStart = ref<{ x: number; y: number } | null>(null);
const minPos = ref<{ x: number; y: number }>(loadPos('min') ?? { x: 16, y: 16 });
const maxPos = ref<{ x: number; y: number }>(loadPos('max') ?? { x: 16, y: 100 });

function startDrag(target: DragTarget, ev?: PointerEvent): void {
  dragging.value = target;
  pointerStart.value = { x: ev?.clientX ?? 0, y: ev?.clientY ?? 0 };
  window.addEventListener('pointermove', onDrag);
  window.addEventListener('pointerup', endDrag);
}

function onDrag(ev: PointerEvent): void {
  if (!dragging.value || !pointerStart.value) return;
  const dx = ev.clientX - pointerStart.value.x;
  const dy = ev.clientY - pointerStart.value.y;
  const pos = dragging.value === 'min' ? minPos.value : maxPos.value;
  const next = { x: clamp(pos.x + dx, 8, window.innerWidth - 80), y: clamp(pos.y + dy, 8, window.innerHeight - 80) };
  if (dragging.value === 'min') minPos.value = next; else maxPos.value = next;
  pointerStart.value = { x: ev.clientX, y: ev.clientY };
}

function endDrag(): void {
  window.removeEventListener('pointermove', onDrag);
  window.removeEventListener('pointerup', endDrag);
  if (dragging.value === 'min') savePos('min', minPos.value); else if (dragging.value === 'max') savePos('max', maxPos.value);
  dragging.value = null;
}

function clamp(v: number, min: number, max: number): number { return Math.max(min, Math.min(max, v)); }
function savePos(key: 'min'|'max', pos: { x: number; y: number }): void { localStorage.setItem(`live_pos_${key}`, JSON.stringify(pos)); }
function loadPos(key: 'min'|'max'): { x: number; y: number } | null {
  try { const v = localStorage.getItem(`live_pos_${key}`); return v ? JSON.parse(v) : null; } catch { return null; }
}

function saveSize(size: { w: number; h: number }): void { localStorage.setItem('live_panel_size', JSON.stringify(size)); }
function loadSize(): { w: number; h: number } | null {
  try { const v = localStorage.getItem('live_panel_size'); return v ? JSON.parse(v) : null; } catch { return null; }
}

const headerOffset = 64; // altura aproximada del header para evitar superposición
const minimizedStyle = computed(() => ({ left: `${minPos.value.x}px`, bottom: `${minPos.value.y}px` }));
const maximizedStyle = computed(() => ({ left: `${maxPos.value.x}px`, bottom: `${Math.max(maxPos.value.y, headerOffset)}px`, width: `${panelSize.value.w}px`, height: `${panelSize.value.h}px` }));

// Tamaño y resize del panel
const panelSize = ref<{ w: number; h: number }>(loadSize() ?? { w: 720, h: 405 + headerBarPx });
const aspect = 16 / 9;
function startResize(ev: PointerEvent): void {
  resizing.value = true;
  resizeStart.value = { x: ev.clientX, y: ev.clientY, w: panelSize.value.w, h: panelSize.value.h };
  window.addEventListener('pointermove', onResize);
  window.addEventListener('pointerup', endResize);
}
const resizing = ref(false);
const resizeStart = ref<{ x: number; y: number; w: number; h: number } | null>(null);
function onResize(ev: PointerEvent): void {
  if (!resizing.value || !resizeStart.value) return;
  const dx = ev.clientX - resizeStart.value.x;
  const dy = ev.clientY - resizeStart.value.y;
  let newW = clamp(resizeStart.value.w + dx, 280, Math.min(window.innerWidth - 32, 1024));
  let newH = Math.max(resizeStart.value.h + dy, 200);
  // Mantener aspecto 16:9 para el área de video (altura = headerBar + video)
  const videoH = newW / aspect;
  newH = headerBarPx + videoH;
  panelSize.value = { w: newW, h: newH };
}
function endResize(): void {
  window.removeEventListener('pointermove', onResize);
  window.removeEventListener('pointerup', endResize);
  saveSize(panelSize.value);
  resizing.value = false;
}
</script>

<style scoped>
.aspect-video { aspect-ratio: 16 / 9; }
</style>


