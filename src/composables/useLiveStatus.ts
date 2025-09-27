import { ref, onMounted, onBeforeUnmount } from 'vue';
import { fetchLiveStatus } from '@/services/liveService';
import { useLiveStore } from '@/store/live';

const DEFAULT_POLL_MS = 30_000; // 30s

export function useLiveStatus(pollMs: number = DEFAULT_POLL_MS) {
  const isLoading = ref(false);
  const errorMessage = ref<string | null>(null);
  const intervalId = ref<number | null>(null);
  const liveStore = useLiveStore();

  async function pollOnce(): Promise<void> {
    try {
      isLoading.value = true;
      const status = await fetchLiveStatus();
      liveStore.setStatus(status);
      errorMessage.value = null;
    } catch (error: any) {
      errorMessage.value = error?.message ?? 'Error verificando estado del live';
      // Backoff si el mensaje parece ser por rate limit
      if (typeof error?.message === 'string' && (
        error.message.includes('429') ||
        error.message.includes('límite de solicitudes') ||
        error.message.includes('Too Many')
      )) {
        // Pausar polling por 60 segundos
        stopPolling();
        setTimeout(() => startPolling(), 60_000);
      }
    } finally {
      isLoading.value = false;
    }
  }

  function startPolling(): void {
    if (intervalId.value != null) return;
    intervalId.value = window.setInterval(pollOnce, pollMs);
  }

  function stopPolling(): void {
    if (intervalId.value != null) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
  }

  onMounted(() => {
    pollOnce();
    startPolling();
  });

  onBeforeUnmount(() => {
    stopPolling();
  });

  return { isLoading, errorMessage, pollOnce, startPolling, stopPolling };
}


