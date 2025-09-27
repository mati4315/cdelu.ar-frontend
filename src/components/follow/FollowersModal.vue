<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] border border-gray-200 dark:border-gray-700">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Seguidores
        </h3>
        <button 
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="overflow-y-auto max-h-[60vh]">
        <!-- Loading state -->
        <div v-if="followers.loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <!-- Followers list -->
        <div v-else-if="hasFollowers" class="divide-y divide-gray-200 dark:divide-gray-700">
          <div 
            v-for="follower in followers.data"
            :key="follower.id"
            class="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <!-- User info -->
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <router-link 
                :to="getUserProfileLink(follower)"
                @click="$emit('close')"
                class="flex-shrink-0"
              >
                <img 
                  :src="getUserAvatar(follower.profile_picture_url)"
                  :alt="follower.nombre"
                  class="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-colors"
                  @error="handleAvatarError"
                />
              </router-link>
              
              <div class="min-w-0 flex-1">
                <router-link 
                  :to="getUserProfileLink(follower)"
                  @click="$emit('close')"
                  class="block hover:underline"
                >
                  <h4 class="font-medium text-gray-900 dark:text-white truncate">
                    {{ follower.nombre }}
                  </h4>
                  <p v-if="follower.username" class="text-sm text-gray-500 dark:text-gray-400 truncate">
                    @{{ follower.username }}
                  </p>
                </router-link>
                <p v-if="follower.bio" class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                  {{ follower.bio }}
                </p>
              </div>
            </div>

            <!-- Follow button -->
            <div v-if="!isOwnFollower(follower)" class="ml-3">
              <FollowButton
                :user-id="follower.id"
                :is-following="false"
                variant="outline"
                size="sm"
                @follow="handleFollow(follower)"
                @unfollow="handleUnfollow(follower)"
              />
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-12">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Sin seguidores
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            Este usuario aún no tiene seguidores.
          </p>
        </div>

        <!-- Load more button -->
        <div v-if="canLoadMore" class="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="loadMore"
            :disabled="followers.loading"
            class="w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
          >
            {{ followers.loading ? 'Cargando...' : 'Ver más' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useFollowStore } from '@/store/followStore';
import { useAuth } from '@/composables/useAuth';
import { storeToRefs } from 'pinia';
import type { FollowUser } from '@/types/api';
import { followService } from '@/services/followService';
import FollowButton from './FollowButton.vue';

interface Props {
  username: string;
}

interface Emits {
  close: [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const followStore = useFollowStore();
const { user } = useAuth();

// Estado del store
const { followers, hasFollowers } = storeToRefs(followStore);

// Computed
const canLoadMore = computed(() => 
  followers.value.page < followers.value.totalPages && !followers.value.loading
);

// Funciones
const loadFollowers = async () => {
  await followStore.loadFollowers(props.username, 1);
};

const loadMore = async () => {
  if (canLoadMore.value) {
    await followStore.loadFollowers(props.username, followers.value.page + 1);
  }
};

const getUserAvatar = (avatarUrl?: string | null): string => {
  return followService.getFullImageUrl(avatarUrl);
};

const getUserProfileLink = (follower: FollowUser): string => {
  return follower.username ? `/user/${follower.username}` : `/user/${follower.id}`;
};

const isOwnFollower = (follower: FollowUser): boolean => {
  return user.value?.id === follower.id;
};

const handleFollow = async (follower: FollowUser) => {
  await followStore.toggleFollow(follower.id);
};

const handleUnfollow = async (follower: FollowUser) => {
  await followStore.toggleFollow(follower.id);
};

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/default-avatar.png';
};

// Lifecycle
onMounted(() => {
  loadFollowers();
});
</script>

<style scoped>
/* Animación del modal */
.fixed {
  animation: modalFadeIn 0.2s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Línea de texto truncada */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Scroll personalizado */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #4a5568;
}

/* Transiciones */
.transition-colors {
  transition: all 0.2s ease;
}

/* Responsive */
@media (max-width: 640px) {
  .max-w-md {
    max-width: calc(100vw - 2rem);
  }
}
</style>
