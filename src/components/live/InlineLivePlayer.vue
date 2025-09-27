<template>
  <div v-if="isLive" class="inline-live-player my-4">
    <div class="rounded-xl overflow-hidden shadow bg-white dark:bg-gray-900">
      <div class="px-3 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span class="text-sm font-semibold">En vivo{{ title ? `: ${title}` : '' }}</span>
        </div>
        <div class="flex items-center gap-3">
          <a v-if="permalink" :href="permalink" target="_blank" rel="noopener" class="text-xs text-blue-600 hover:underline">Ver en Facebook</a>
          <span class="text-xs text-gray-500">Reproductor fijo</span>
        </div>
      </div>
      <div class="bg-black aspect-video relative">
        <video
          v-if="hlsUrl"
          ref="videoEl"
          class="w-full h-full"
          playsinline
          :muted="muted"
          :controls="false"
          @loadeddata="tryPlay"
          @play="onPlay"
          @pause="onPause"
          @volumechange="onVolumeEvt"
          @ratechange="onRateEvt"
        />
        <iframe
          v-else-if="embedUrl"
          class="w-full h-full"
          :src="computedEmbedUrl"
          style="border:none;overflow:hidden"
          scrolling="no"
          frameborder="0"
          allowfullscreen="true"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-sm text-gray-400">No hay transmisión disponible</div>
        <!-- Controles personalizados para HLS -->
        <div v-if="hlsUrl" class="absolute inset-x-0 bottom-0 bg-black/60 text-white p-2 flex items-center gap-2">
          <button @click="togglePlay" class="px-2 py-1 rounded hover:bg-white/10">
            <span v-if="!isPlaying">▶</span>
            <span v-else>⏸</span>
          </button>
          <button @click="toggleMute" class="px-2 py-1 rounded hover:bg-white/10">
            <span v-if="muted">🔇</span>
            <span v-else>🔊</span>
          </button>
          <input type="range" min="0" max="1" step="0.01" :value="volume" @input="onVolumeInput" class="w-24">
          <label class="text-xs ml-2">Vel:</label>
          <select :value="rate" @change="onRateChange" class="bg-transparent border border-white/30 rounded px-1 py-0.5 text-xs">
            <option v-for="r in rates" :key="r" :value="r">{{ r }}x</option>
          </select>
          <button v-if="canPiP" @click="togglePiP" class="ml-auto px-2 py-1 rounded hover:bg-white/10">PiP</button>
          <button @click="toggleFullscreen" class="px-2 py-1 rounded hover:bg-white/10">⛶</button>
        </div>
      </div>
      <div v-if="permalink" class="px-3 py-3 border-t border-gray-200 dark:border-gray-800">
        <a :href="permalink" target="_blank" rel="noopener"
           class="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
            <path d="M7 8h10v2H7V8zm0 4h7v2H7v-2z" />
          </svg>
          <span>Comentar en Facebook</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Hls from 'hls.js';
import { useLiveStore } from '@/store/live';
import { useLiveStatus } from '@/composables/useLiveStatus';

const liveStore = useLiveStore();
useLiveStatus(30_000);

const isLive = computed(() => liveStore.status.isLive);
const embedUrl = computed(() => liveStore.status.embedUrl ?? '');
const hlsUrl = computed(() => liveStore.status.hlsUrl ?? '');
const title = computed(() => liveStore.status.title ?? '');

const computedEmbedUrl = computed(() => {
  if (!embedUrl.value) return '';
  const url = new URL(embedUrl.value);
  url.searchParams.set('autoplay', 'true');
  url.searchParams.set('mute', 'true');
  return url.toString();
});

const permalink = computed(() => {
  if (!embedUrl.value) return '';
  try {
    const url = new URL(embedUrl.value);
    const href = url.searchParams.get('href');
    return href || '';
  } catch { return ''; }
});

const videoEl = ref<HTMLVideoElement | null>(null);
let hls: Hls | null = null;
const isPlaying = ref(false);
const muted = ref(true);
const volume = ref(1);
const rate = ref(1);
const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
const canPiP = document.pictureInPictureEnabled === true;

function attachHls(): void {
  if (!videoEl.value || !hlsUrl.value) return;
  if (Hls.isSupported()) {
    hls = new Hls({ autoStartLoad: true });
    hls.loadSource(hlsUrl.value);
    hls.attachMedia(videoEl.value);
    hls.on(Hls.Events.MANIFEST_PARSED, tryPlay);
  } else if (videoEl.value.canPlayType('application/vnd.apple.mpegurl')) {
    videoEl.value.src = hlsUrl.value;
    tryPlay();
  }
}

function tryPlay(): void {
  if (!videoEl.value) return;
  videoEl.value.play().then(() => { isPlaying.value = true; }).catch(() => {});
}

function togglePlay(): void {
  if (!videoEl.value) return;
  if (videoEl.value.paused) { videoEl.value.play(); } else { videoEl.value.pause(); }
}
function onPlay(): void { isPlaying.value = true; }
function onPause(): void { isPlaying.value = false; }
function toggleMute(): void {
  muted.value = !muted.value;
  if (videoEl.value) videoEl.value.muted = muted.value;
}
function onVolumeInput(e: Event): void {
  const v = Number((e.target as HTMLInputElement).value);
  volume.value = v;
  if (videoEl.value) videoEl.value.volume = v;
  if (v > 0) { muted.value = false; if (videoEl.value) videoEl.value.muted = false; }
}
function onVolumeEvt(): void {
  if (!videoEl.value) return;
  volume.value = videoEl.value.volume;
  muted.value = videoEl.value.muted;
}
function onRateChange(e: Event): void {
  const r = Number((e.target as HTMLSelectElement).value);
  rate.value = r;
  if (videoEl.value) videoEl.value.playbackRate = r;
}
function onRateEvt(): void {
  if (!videoEl.value) return;
  rate.value = videoEl.value.playbackRate;
}
async function togglePiP(): Promise<void> {
  if (!videoEl.value || !canPiP) return;
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await videoEl.value.requestPictureInPicture();
    }
  } catch { /* noop */ }
}
function toggleFullscreen(): void {
  const el = videoEl.value as any;
  if (!el) return;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else el.requestFullscreen?.();
}

onMounted(() => {
  if (hlsUrl.value) attachHls();
  // Inicializar estado al montar
  if (videoEl.value) {
    videoEl.value.muted = muted.value;
    videoEl.value.volume = volume.value;
    videoEl.value.playbackRate = rate.value;
  }
});
</script>

<style scoped>
.aspect-video { aspect-ratio: 16 / 9; }
</style>


