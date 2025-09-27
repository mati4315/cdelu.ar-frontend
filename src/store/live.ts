import { defineStore } from 'pinia';
import type { LiveStatus, LivePlayerState } from '@/types/live';

interface LiveStoreState {
  status: LiveStatus;
  player: LivePlayerState;
}

const STORAGE_KEY = 'live_player_state_v1';

function loadPersistedState(): LivePlayerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isVisible: false, isMinimized: true, isMuted: true, userDismissed: false };
    const parsed = JSON.parse(raw) as LivePlayerState;
    return {
      isVisible: parsed.isVisible ?? false,
      isMinimized: parsed.isMinimized ?? true,
      isMuted: parsed.isMuted ?? true,
      userDismissed: parsed.userDismissed ?? false,
    };
  } catch {
    return { isVisible: false, isMinimized: true, isMuted: true, userDismissed: false };
  }
}

function persistState(state: LivePlayerState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const useLiveStore = defineStore('live', {
  state: (): LiveStoreState => ({
    status: { isLive: false },
    player: loadPersistedState(),
  }),
  getters: {
    isLiveVisible: (s) => s.player.isVisible && s.status.isLive && !s.player.userDismissed,
  },
  actions: {
    setStatus(status: LiveStatus) {
      this.status = status;
      if (status.isLive) {
        // Si hay live, mostrar minimizado si no fue descartado por el usuario
        if (!this.player.userDismissed) {
          this.player.isVisible = true;
        }
      } else {
        // Si terminó, ocultar y resetear estados efímeros
        this.player.isVisible = false;
        this.player.isMinimized = true;
      }
      persistState(this.player);
    },
    setMuted(muted: boolean) {
      this.player.isMuted = muted;
      persistState(this.player);
    },
    minimize() {
      this.player.isMinimized = true;
      persistState(this.player);
    },
    maximize() {
      this.player.isMinimized = false;
      // Generalmente comenzamos silenciado; el usuario puede activar audio
      persistState(this.player);
    },
    toggleMute() {
      this.player.isMuted = !this.player.isMuted;
      persistState(this.player);
    },
    show() {
      this.player.isVisible = true;
      persistState(this.player);
    },
    hide() {
      this.player.isVisible = false;
      persistState(this.player);
    },
    dismissUntilNextLive() {
      this.player.userDismissed = true;
      this.player.isVisible = false;
      persistState(this.player);
    },
    resetDismiss() {
      this.player.userDismissed = false;
      persistState(this.player);
    },
  },
});


