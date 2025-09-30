<template>
  <div 
    class="user-avatar" 
    :class="avatarClasses"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <img 
      :src="getOptimizedImageUrl(imageUrl, 'small')" 
      :srcset="generateSrcSet(imageUrl)"
      :sizes="generateSizes('avatar')"
      :alt="user?.nombre || 'Usuario'"
      class="avatar-image"
      loading="lazy"
      decoding="async"
      @error="handleImageError"
      @load="handleImageLoad"
    />
    <div v-if="showName && user?.nombre" class="avatar-name">
      {{ user.nombre }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { User } from '../../types/api';
import { profileService } from '../../services/profileService';
import { getOptimizedImageUrl, generateSrcSet, generateSizes } from '@/utils/imageOptimization';

interface Props {
  user?: User | null;
  size?: number;
  showName?: boolean;
  rounded?: boolean;
  bordered?: boolean;
  clickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
  showName: false,
  rounded: true,
  bordered: false,
  clickable: false
});

const emit = defineEmits<{
  click: [user: User | null | undefined];
}>();

const imageError = ref(false);
const imageLoaded = ref(false);

const imageUrl = computed(() => {
  if (imageError.value || !props.user?.profile_picture_url) {
    return '/default-avatar.png';
  }
  return profileService.getFullImageUrl(props.user.profile_picture_url);
});

const avatarClasses = computed(() => {
  return {
    'avatar-rounded': props.rounded,
    'avatar-bordered': props.bordered,
    'avatar-clickable': props.clickable,
    'avatar-with-name': props.showName,
    'avatar-loading': !imageLoaded.value,
    'avatar-error': imageError.value
  };
});

const handleImageError = () => {
  imageError.value = true;
  imageLoaded.value = true;
};

const handleImageLoad = () => {
  imageError.value = false;
  imageLoaded.value = true;
};

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.user);
  }
};
</script>

<style scoped>
.user-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.2s ease;
  background-color: #f3f4f6;
}

.avatar-rounded .avatar-image {
  border-radius: 50%;
}

.avatar-bordered .avatar-image {
  border: 2px solid #e5e7eb;
}

.avatar-clickable {
  cursor: pointer;
}

.avatar-clickable:hover .avatar-image {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-loading .avatar-image {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.avatar-error .avatar-image {
  background-color: #fef2f2;
  border-color: #fecaca;
}

.avatar-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.avatar-with-name {
  flex-direction: row;
}

/* Tamaños específicos para nombres */
.user-avatar[style*="16px"] .avatar-name {
  font-size: 10px;
  max-width: 60px;
}

.user-avatar[style*="24px"] .avatar-name {
  font-size: 11px;
  max-width: 80px;
}

.user-avatar[style*="32px"] .avatar-name {
  font-size: 12px;
  max-width: 100px;
}

.user-avatar[style*="48px"] .avatar-name {
  font-size: 14px;
  max-width: 120px;
}

.user-avatar[style*="64px"] .avatar-name,
.user-avatar[style*="80px"] .avatar-name,
.user-avatar[style*="96px"] .avatar-name,
.user-avatar[style*="120px"] .avatar-name {
  font-size: 16px;
  max-width: 150px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Tema oscuro */
@media (prefers-color-scheme: dark) {
  .avatar-image {
    background-color: #374151;
  }
  
  .avatar-bordered .avatar-image {
    border-color: #4b5563;
  }
  
  .avatar-name {
    color: #d1d5db;
  }
  
  .avatar-error .avatar-image {
    background-color: #451a1a;
    border-color: #dc2626;
  }
  
  .avatar-loading .avatar-image {
    background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
    background-size: 200% 100%;
  }
}
</style> 