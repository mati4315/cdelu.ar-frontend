<template>
  <div class="inline-live-comments mt-2">
    <div class="flex items-center justify-between mb-2">
      <h4 class="text-sm font-semibold">Comentarios en vivo</h4>
      <button @click="refresh" class="text-xs text-blue-600 hover:underline" :disabled="loading">Actualizar</button>
    </div>
    <div v-if="loading && comments.length === 0" class="text-sm text-gray-500">Cargando comentarios…</div>
    <div v-else-if="!loading && comments.length === 0" class="text-sm text-gray-400">Aún no hay comentarios. ¡Sé el primero en comentar!</div>
    <ul class="space-y-3">
      <li v-for="c in comments" :key="c.id" class="flex gap-3">
        <img v-if="c.author.pictureUrl" :src="c.author.pictureUrl" class="h-8 w-8 rounded-full object-cover" alt="" />
        <div class="flex-1">
          <div class="text-sm"><span class="font-semibold">{{ c.author.name }}</span> <span class="text-gray-500 text-xs">· {{ formatTime(c.createdAt) }}</span></div>
          <div class="text-sm whitespace-pre-line">{{ c.message }}</div>
        </div>
      </li>
    </ul>
    <div class="mt-3 flex items-center justify-between">
      <button v-if="paging?.previousCursor" @click="loadPrev" class="text-xs text-blue-600 hover:underline">Anteriores</button>
      <button v-if="paging?.nextCursor" @click="loadMore" class="text-xs text-blue-600 hover:underline ml-auto">Cargar más</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useLiveStore } from '@/store/live';
import { fetchLiveComments } from '@/services/liveService';
import type { LiveCommentItem, LiveCommentsPage } from '@/types/live';

const liveStore = useLiveStore();
const videoId = computed(() => liveStore.status.videoId);

const comments = ref<LiveCommentItem[]>([]);
const paging = ref<LiveCommentsPage['paging']>();
const loading = ref(false);

async function refresh() {
  await loadPage();
}

async function loadPage(after?: string) {
  if (!videoId.value) return;
  loading.value = true;
  try {
    const page = await fetchLiveComments(videoId.value, after);
    comments.value = page.items;
    paging.value = page.paging;
  } finally {
    loading.value = false;
  }
}

async function loadMore() {
  if (!videoId.value || !paging.value?.nextCursor) return;
  loading.value = true;
  try {
    const page = await fetchLiveComments(videoId.value, paging.value.nextCursor);
    comments.value = comments.value.concat(page.items);
    paging.value = page.paging;
  } finally {
    loading.value = false;
  }
}

function loadPrev() {
  // opcional implementar navegación hacia atrás
}

function formatTime(iso: string): string {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

onMounted(() => {
  loadPage();
  // Polling básico cada 10s
  setInterval(() => loadPage(), 10000);
});
</script>

<style scoped>
</style>


