<template>
  <article class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
    <!-- Header del post -->
    <header class="flex items-center gap-3 mb-4">
      <img 
        :src="getUserAvatar(author?.profile_picture_url)"
        :alt="author?.nombre"
        class="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
        @error="handleAvatarError"
      />
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <h3 class="font-medium text-gray-900 dark:text-white">
            {{ author?.nombre }}
          </h3>
          <span v-if="author?.username" class="text-sm text-gray-500 dark:text-gray-400">
            @{{ author.username }}
          </span>
        </div>
        <time class="text-sm text-gray-500 dark:text-gray-400" :datetime="post.created_at">
          {{ formatDate(post.created_at) }}
        </time>
      </div>
    </header>

    <!-- Contenido del post -->
    <div class="mb-4">
      <h4 v-if="post.titulo" class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {{ post.titulo }}
      </h4>
      <p v-if="post.descripcion" class="text-gray-700 dark:text-gray-300 leading-relaxed">
        {{ post.descripcion }}
      </p>
    </div>

    <!-- Media del post -->
    <div v-if="hasMedia" class="mb-4">
      <!-- Imágenes -->
      <div v-if="hasImages" class="mb-4">
        <div v-if="post.image_urls.length === 1" class="relative">
          <img 
            :src="getFullImageUrl(post.image_urls[0])"
            :alt="post.titulo"
            class="w-full max-h-96 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            @click="openImageModal"
            @error="handleImageError"
          />
        </div>
        <div v-else-if="post.image_urls.length <= 4" class="grid gap-2" :class="imageGridClass">
          <img 
            v-for="(imageUrl, index) in post.image_urls"
            :key="index"
            :src="getFullImageUrl(imageUrl)"
            :alt="`${post.titulo} - imagen ${index + 1}`"
            class="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            @click="openImageModal(index)"
            @error="handleImageError"
          />
        </div>
        <div v-else class="relative">
          <div class="grid grid-cols-3 gap-2">
            <img 
              v-for="(imageUrl, index) in post.image_urls.slice(0, 3)"
              :key="index"
              :src="getFullImageUrl(imageUrl)"
              :alt="`${post.titulo} - imagen ${index + 1}`"
              :class="[
                'w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity',
                index === 2 && post.image_urls.length > 3 ? 'relative' : ''
              ]"
              @click="openImageModal(index)"
              @error="handleImageError"
            />
          </div>
          <!-- Overlay para más imágenes -->
          <div 
            v-if="post.image_urls.length > 3"
            class="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded-lg"
          >
            +{{ post.image_urls.length - 3 }}
          </div>
        </div>
      </div>

      <!-- Video -->
      <div v-if="hasVideo" class="relative">
        <video 
          :src="getFullImageUrl(post.video_url!)"
          class="w-full max-h-96 rounded-lg"
          controls
          @error="handleVideoError"
        >
          Tu navegador no soporta el elemento video.
        </video>
      </div>
    </div>

    <!-- Estadísticas y acciones del post -->
    <footer class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
      <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span v-if="post.likes_count !== undefined" class="flex items-center gap-1">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          {{ formatNumber(post.likes_count) }}
        </span>
        <span v-if="post.comments_count !== undefined" class="flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          {{ formatNumber(post.comments_count) }}
        </span>
      </div>

      <!-- Fecha de actualización -->
      <div v-if="post.updated_at !== post.created_at" class="text-xs text-gray-400 dark:text-gray-500">
        Editado {{ formatDate(post.updated_at) }}
      </div>
    </footer>

    <!-- Modal de imágenes -->
    <Teleport to="body">
      <ImageViewerModal 
        v-if="showImageModal"
        :images="fullImageUrls"
        :initial-index="currentImageIndex"
        @close="closeImageModal"
      />
    </Teleport>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { UserPost, PublicUser } from '@/types/api';
import { followService } from '@/services/followService';
import ImageViewerModal from '@/components/ui/ImageViewerModal.vue';

interface Props {
  post: UserPost;
  author?: PublicUser | null;
}

const props = defineProps<Props>();

// Estado local
const showImageModal = ref(false);
const currentImageIndex = ref(0);

// Computed properties
const hasImages = computed(() => 
  Array.isArray(props.post.image_urls) && props.post.image_urls.length > 0
);

const hasVideo = computed(() => 
  Boolean(props.post.video_url)
);

const hasMedia = computed(() => hasImages.value || hasVideo.value);

const imageGridClass = computed(() => {
  const count = props.post.image_urls?.length || 0;
  if (count === 2) return 'grid-cols-2';
  if (count === 3) return 'grid-cols-3';
  if (count === 4) return 'grid-cols-2';
  return 'grid-cols-1';
});

const fullImageUrls = computed(() => {
  if (!hasImages.value) return [];
  return props.post.image_urls.map(url => getFullImageUrl(url));
});

// Funciones
const getFullImageUrl = (url: string): string => {
  return followService.getFullImageUrl(url);
};

const getUserAvatar = (avatarUrl?: string | null): string => {
  return followService.getFullImageUrl(avatarUrl);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'Sin fecha';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return 'Hoy';
  } else if (diffDays === 2) {
    return 'Ayer';
  } else if (diffDays <= 7) {
    return `Hace ${diffDays - 1} días`;
  } else {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

const formatNumber = (num: number): string => {
  const safeNum = typeof num === 'number' && !isNaN(num) ? num : 0;
  if (safeNum >= 1000000) {
    return `${(safeNum / 1000000).toFixed(1)}M`;
  } else if (safeNum >= 1000) {
    return `${(safeNum / 1000).toFixed(1)}k`;
  }
  return safeNum.toString();
};

const openImageModal = (index: number = 0) => {
  if (hasImages.value) {
    currentImageIndex.value = index;
    showImageModal.value = true;
  }
};

const closeImageModal = () => {
  showImageModal.value = false;
};

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/default-avatar.png';
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.style.display = 'none';
  console.warn('Error cargando imagen:', target.src);
};

const handleVideoError = (event: Event) => {
  const target = event.target as HTMLVideoElement;
  console.warn('Error cargando video:', target.src);
  
  // Mostrar mensaje de error
  const errorDiv = document.createElement('div');
  errorDiv.className = 'flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded-lg';
  errorDiv.innerHTML = `
    <div class="text-center text-gray-500 dark:text-gray-400">
      <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
      </svg>
      <p>Error al cargar el video</p>
    </div>
  `;
  
  target.parentNode?.replaceChild(errorDiv, target);
};
</script>

<style scoped>
/* Animaciones */
article {
  transition: all 0.3s ease;
}

article:hover {
  transform: translateY(-2px);
}

/* Grid responsivo para imágenes */
@media (max-width: 768px) {
  .grid-cols-3 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Efectos de hover en imágenes */
img {
  transition: opacity 0.2s ease;
}

/* Estilos para video */
video {
  max-width: 100%;
  height: auto;
}

/* Overlay para contador de imágenes */
.absolute {
  pointer-events: none;
}
</style>
