<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header de la página -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <router-link 
            to="/" 
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </router-link>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Perfil de {{ currentProfile?.nombre || username }}
          </h1>
        </div>
        <p class="text-gray-600 dark:text-gray-400">
          {{ isOwnProfile ? 'Este es tu perfil público' : 'Perfil público de usuario' }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="profileLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="profileError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div class="flex items-center">
          <svg class="w-6 h-6 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 class="text-red-800 dark:text-red-200 font-medium">Error al cargar el perfil</h3>
            <p class="text-red-600 dark:text-red-400 text-sm">{{ profileError }}</p>
          </div>
        </div>
        <button 
          @click="loadProfile"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>

      <!-- Profile Content -->
      <div v-else-if="currentProfile" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar con información del usuario -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="text-center">
              <!-- Avatar del usuario -->
              <div class="mb-6">
                <img 
                  v-if="currentProfile.profile_picture_url && !avatarError"
                  :src="getUserAvatar(currentProfile.profile_picture_url)"
                  :alt="currentProfile.nombre"
                  class="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-200 dark:border-gray-700"
                  @error="handleAvatarError"
                />
                <div 
                  v-else
                  class="w-32 h-32 rounded-full mx-auto border-4 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold"
                >
                  {{ currentProfile.nombre.charAt(0).toUpperCase() }}
                </div>
              </div>

              <!-- Información básica -->
              <div class="text-center mb-6">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                  {{ currentProfile.nombre }}
                </h2>
                <p v-if="currentProfile.username" class="text-gray-600 dark:text-gray-400">
                  @{{ currentProfile.username }}
                </p>
                <p v-if="currentProfile.bio" class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {{ currentProfile.bio }}
                </p>
                <div v-if="currentProfile.location || currentProfile.website" class="mt-3 space-y-1">
                  <p v-if="currentProfile.location" class="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    {{ currentProfile.location }}
                  </p>
                  <a v-if="currentProfile.website" 
                     :href="currentProfile.website" 
                     target="_blank"
                     class="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                    </svg>
                    Sitio web
                  </a>
                </div>
              </div>

              <!-- Botón de seguir/no seguir -->
              <div v-if="!isOwnProfile" class="mb-6">
                <FollowButton 
                  :user-id="currentProfile.id"
                  :is-following="isFollowingCurrentUser"
                  :loading="followActionLoading"
                  @follow="handleFollow"
                  @unfollow="handleUnfollow"
                />
              </div>

              <!-- Estadísticas detalladas (como en perfil privado) -->
              <div v-if="profileStats" class="grid grid-cols-2 gap-4 text-center">
                <div class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors" 
                     @click="showFollowersModal">
                  <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {{ formatNumber(profileStats.followers_count) }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Seguidores
                  </div>
                </div>
                <div class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                     @click="showFollowingModal">
                  <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                    {{ formatNumber(profileStats.following_count) }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Siguiendo
                  </div>
                </div>
                <div class="p-2">
                  <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {{ formatNumber(profileStats.posts_count) }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Publicaciones
                  </div>
                </div>
                <div class="p-2">
                  <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {{ calculateDaysActive(currentProfile.created_at || '') }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Días activo
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Información adicional -->
          <div class="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Información adicional
            </h3>
            <div class="space-y-3 text-sm">
              <div class="flex items-center text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                </svg>
                Se unió en {{ formatJoinDate(currentProfile.created_at || '') }}
              </div>
              <div v-if="currentProfile.location" class="flex items-center text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {{ currentProfile.location }}
              </div>
              <div v-if="currentProfile.website" class="flex items-center text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H6.9C4.29 7 2.2 9.09 2.2 11.7v.6c0 2.61 2.09 4.7 4.7 4.7H11v-1.9H6.9c-1.71 0-3.1-1.39-3.1-3.1H3.9zM8 13h8v-2H8v2zm9.1-6H13v1.9h4.1c1.71 0 3.1 1.39 3.1 3.1v.6c0 1.71-1.39 3.1-3.1 3.1H13V17h4.1c2.61 0 4.7-2.09 4.7-4.7v-.6C21.8 9.09 19.71 7 17.1 7z"/>
                </svg>
                <a :href="currentProfile.website" target="_blank" class="hover:text-blue-600 dark:hover:text-blue-400 break-all">
                  {{ formatWebsite(currentProfile.website) }}
                </a>
              </div>
              <div v-if="(currentProfile as any)?.is_verified === true" class="flex items-center text-blue-600 dark:text-blue-400">
                <svg class="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Usuario verificado
              </div>
            </div>
          </div>

          <!-- Acciones adicionales -->
          <div v-if="isOwnProfile" class="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Acciones
            </h3>
            <div class="space-y-3">
              <router-link 
                to="/perfil"
                class="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Editar perfil
              </router-link>
            </div>
          </div>
        </div>

        <!-- Contenido principal: Posts -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                Publicaciones
                <span v-if="profileStats" class="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  {{ profileStats.posts_count }}
                </span>
              </h2>
            </div>
            
            <!-- Loading posts -->
            <div v-if="publicPosts.loading" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>

            <!-- Posts content -->
            <div v-else-if="hasPublicPosts" class="space-y-6">
              <div 
                v-for="post in publicPosts.data"
                :key="post.id"
                class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
              >
                <!-- Post header -->
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {{ currentProfile?.nombre.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900 dark:text-white">{{ currentProfile?.nombre }}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(post.created_at) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Post content -->
                <div class="mb-4">
                  <h3 class="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    {{ post.titulo }}
                  </h3>
                  <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {{ getExpandedPostContent(post.id) ? post.descripcion : getTruncatedContent(post.descripcion) }}
                    <button 
                      v-if="needsReadMore(post.descripcion)" 
                      @click.stop="togglePostExpanded(post.id)"
                      class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium ml-1 transition-colors cursor-pointer"
                    >
                      {{ getExpandedPostContent(post.id) ? 'Ocultar' : 'Leer más' }}
                    </button>
                  </p>
                </div>

                <!-- Post media -->
                <div v-if="post.image_url" class="mb-4">
                  <img 
                    :src="profileService.getFullImageUrl(post.image_url)"
                    :alt="post.titulo"
                    class="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
                  />
                </div>

                <!-- Post stats -->
                <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div class="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <span class="flex items-center space-x-1">
                      <span>❤️</span>
                      <span>{{ post.likes_count || 0 }}</span>
                    </span>
                    <span class="flex items-center space-x-1">
                      <span>💬</span>
                      <span>{{ post.comments_count || 0 }}</span>
                    </span>
                  </div>
                  <span class="text-xs text-gray-400">
                    {{ post.updated_at !== post.created_at ? 'Editado' : '' }}
                  </span>
                </div>
              </div>
              
              <!-- Load more button -->
              <div v-if="canLoadMorePosts" class="text-center pt-6">
                <button
                  @click="loadMorePosts"
                  :disabled="publicPosts.infiniteLoading"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span v-if="publicPosts.infiniteLoading" class="flex items-center gap-2">
                    <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Cargando...
                  </span>
                  <span v-else>Ver más publicaciones</span>
                </button>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="text-center py-12">
              <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Sin publicaciones
              </h3>
              <p class="text-gray-500 dark:text-gray-400">
                {{ isOwnProfile ? 'Aún no has creado ninguna publicación.' : 'Este usuario no ha publicado nada aún.' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modales -->
      <!-- Modals serán implementados en el futuro -->
      <div v-if="showFollowersModalState" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showFollowersModalState = false">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
          <h3 class="text-lg font-semibold mb-4">Seguidores</h3>
          <p class="text-gray-600 dark:text-gray-400">Funcionalidad próximamente disponible</p>
          <button 
            @click="showFollowersModalState = false"
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </div>

      <div v-if="showFollowingModalState" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showFollowingModalState = false">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
          <h3 class="text-lg font-semibold mb-4">Siguiendo</h3>
          <p class="text-gray-600 dark:text-gray-400">Funcionalidad próximamente disponible</p>
          <button 
            @click="showFollowingModalState = false"
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useFollowStore } from '@/store/followStore';
import { useAuth } from '@/composables/useAuth';
import { useProfileStore } from '@/store/profileStore';
import { useFeedStore } from '@/store/feedStore';
import { storeToRefs } from 'pinia';
import { followService } from '@/services/followService';
import { profileService } from '@/services/profileService';
import FollowButton from '@/components/follow/FollowButton.vue';

// Props
interface Props {
  username: string;
}

const props = defineProps<Props>();

// Composables y stores
const route = useRoute();
const followStore = useFollowStore();
const profileStore = useProfileStore();
const feedStore = useFeedStore();
const { isAuthenticated, user } = useAuth();

// Estado del store
const {
  currentPublicProfile: currentProfile,
  currentProfileStats: profileStats,
  isFollowingCurrentUser,
  isOwnProfile,
  profileLoading,
  profileError,
  publicPosts,
  followActionLoading,
  hasPublicPosts,
  canLoadMorePosts
} = storeToRefs(followStore);

// Estado local
const showFollowersModalState = ref(false);
const showFollowingModalState = ref(false);
const avatarError = ref(false);
const expandedPosts = ref<Set<number>>(new Set()); // Posts expandidos

// Computed
const username = computed(() => props.username || route.params.username as string);

// Funciones para trabajar con usernames
const generateUsername = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '.') // Espacios por puntos
    .replace(/[^a-z0-9._-]/g, '') // Solo caracteres válidos
    .replace(/\.+/g, '.') // Múltiples puntos por uno solo
    .replace(/^\.+|\.+$/g, '') // Quitar puntos al inicio y final
    .substring(0, 30) || 'usuario'; // Máximo 30 caracteres con fallback
};

const findUserInFeed = (targetUsername: string) => {
  // Buscar en todos los contenidos del feed
  const allItems = [
    ...feedStore.allContent,
    ...feedStore.newsContent,
    ...feedStore.communityContent
  ];
  
  console.log(`🔍 [PUBLIC PROFILE] Buscando en ${allItems.length} items del feed`);
  
  // Buscar por username generado o por nombre
  for (const item of allItems) {
    if (item.user_name && item.user_id) {
      const itemUsername = generateUsername(item.user_name);
      console.log(`🔍 [PUBLIC PROFILE] Comparando: "${itemUsername}" vs "${targetUsername}" | Nombre: "${item.user_name}"`);
      
      if (itemUsername === targetUsername || 
          item.user_name.toLowerCase() === targetUsername.toLowerCase() ||
          item.user_name.toLowerCase().replace(/\s+/g, '.') === targetUsername.toLowerCase()) {
        
        console.log(`✅ [PUBLIC PROFILE] Usuario encontrado en el feed!`, {
          id: item.user_id,
          nombre: item.user_name,
          username: itemUsername
        });
        
        return {
          id: item.user_id,
          nombre: item.user_name,
          username: itemUsername,
          // Usar foto de perfil del feed si está disponible
          profile_picture_url: item.user_profile_picture || null
        };
      }
    }
  }
  
  console.log(`❌ [PUBLIC PROFILE] Usuario no encontrado en el feed para: ${targetUsername}`);
  return null;
};

const loadProfile = async () => {
  console.log(`👤 [PUBLIC PROFILE] Cargando perfil: ${username.value}`);
  
  // Estrategia híbrida: intentar diferentes métodos según el caso
  const isNumericId = /^\d+$/.test(username.value);
  
  // Verificar si es el usuario actual (por username generado o nombre)
  const currentUserUsername = user.value ? generateUsername(user.value.nombre) : null;
  const isCurrentUser = user.value && (
    username.value === user.value.id.toString() || 
    username.value === user.value.nombre.toLowerCase() ||
    username.value === currentUserUsername
  );
  
  try {
    if (isCurrentUser) {
      // Si es el usuario actual, usar el perfil privado
      console.log(`👤 [PUBLIC PROFILE] Es el usuario actual, cargando perfil privado`);
      await profileStore.loadProfile();
      
      // Mapear datos del perfil privado al formato público
      if (profileStore.currentProfile) {
        // Crear datos de perfil público desde el perfil privado
        const publicProfileData = {
          id: profileStore.currentProfile.user.id,
          nombre: profileStore.currentProfile.user.nombre,
          username: profileStore.currentProfile.user.nombre.toLowerCase().replace(/\s+/g, '.'),
          profile_picture_url: profileStore.currentProfile.user.profile_picture_url,
          created_at: profileStore.currentProfile.user.created_at || new Date().toISOString(),
          bio: `Usuario de ${import.meta.env.VITE_APP_NAME || 'Diario CdelU'}`,
          location: undefined,
          website: undefined
        };
        
        const publicStatsData = {
          followers_count: 0,
          following_count: 0,
          posts_count: profileStore.myPosts.length || 0
        };
        
        // Asignar usando las acciones del store
        followStore.$patch({
          currentPublicProfile: publicProfileData,
          currentProfileStats: publicStatsData,
          isOwnProfile: true,
          isFollowingCurrentUser: false,
          profileLoading: false,
          profileError: null
        });
      }
      
      // Cargar posts usando el store de perfil privado
      await profileStore.loadPosts();
      
      // Mapear posts al formato público
      const mappedPosts = profileStore.myPosts.map(post => ({
        id: post.id,
        titulo: post.titulo,
        descripcion: post.descripcion,
        image_url: post.image_url,
        image_urls: post.image_urls,
        video_url: post.video_url,
        created_at: post.created_at,
        updated_at: post.updated_at,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        autor: user.value?.nombre,
        user_id: user.value?.id
      }));
      
      followStore.$patch({
        publicPosts: {
          data: mappedPosts,
          total: mappedPosts.length,
          totalPages: 1,
          page: 1,
          loading: false,
          infiniteLoading: false
        }
      });
      
    } else {
      // Asegurar que el feed esté cargado antes de buscar
      if (feedStore.allContent.length === 0 && feedStore.newsContent.length === 0 && feedStore.communityContent.length === 0) {
        console.log(`📊 [PUBLIC PROFILE] Feed vacío, cargando contenido...`);
        try {
          await feedStore.loadFeed('todo', false);
        } catch (error) {
          console.warn(`⚠️ [PUBLIC PROFILE] No se pudo cargar el feed:`, error);
        }
      }
      
      // Buscar usuario en el feed
      console.log(`🔍 [PUBLIC PROFILE] Buscando usuario en el feed: ${username.value}`);
      const foundUser = findUserInFeed(username.value);
      
      if (foundUser) {
        console.log(`✅ [PUBLIC PROFILE] Usuario encontrado en el feed:`, foundUser);
        
        // Crear perfil basado en datos del feed
        const feedBasedProfile = {
          id: foundUser.id,
          nombre: foundUser.nombre,
          username: foundUser.username,
          profile_picture_url: null,
          created_at: new Date().toISOString(),
          bio: `Usuario del ${import.meta.env.VITE_APP_NAME || 'Diario CdelU'}`
        };
        
        // Buscar posts de este usuario en el feed
        const userPosts = [
          ...feedStore.allContent,
          ...feedStore.newsContent,
          ...feedStore.communityContent
        ].filter(item => item.user_id === foundUser.id);
        
        console.log(`📄 [PUBLIC PROFILE] Posts encontrados para ${foundUser.nombre}:`, userPosts.length);
        
        // Mapear posts del feed al formato público
        const mappedFeedPosts = userPosts.map(item => ({
          id: item.id,
          titulo: item.titulo,
          descripcion: item.descripcion,
          image_url: item.image_url || null,
          image_urls: item.image_url ? [item.image_url] : [],
          video_url: item.video_url || null,
          created_at: item.created_at,
          updated_at: item.updated_at,
          likes_count: item.likes_count || 0,
          comments_count: item.comments_count || 0,
          autor: foundUser.nombre,
          user_id: foundUser.id
        }));
        
        // Estadísticas basadas en datos reales
        const feedBasedStats = {
          followers_count: 0,
          following_count: 0,
          posts_count: userPosts.length
        };
        
        // Asignar datos al store
        followStore.$patch({
          currentPublicProfile: feedBasedProfile,
          currentProfileStats: feedBasedStats,
          isOwnProfile: false,
          isFollowingCurrentUser: false,
          profileLoading: false,
          profileError: null,
          publicPosts: {
            data: mappedFeedPosts,
            total: mappedFeedPosts.length,
            totalPages: 1,
            page: 1,
            loading: false,
            infiniteLoading: false
          }
        });
        
        // Verificar estado de seguimiento real desde el backend
        try {
          const realProfile = await followService.getPublicProfile(foundUser.username);
          if (realProfile?.is_following !== undefined) {
            followStore.$patch({
              isFollowingCurrentUser: realProfile.is_following
            });
            console.log(`✅ [PUBLIC PROFILE] Estado de seguimiento actualizado: ${realProfile.is_following}`);
          }
        } catch (error) {
          console.warn(`⚠️ [PUBLIC PROFILE] No se pudo verificar estado de seguimiento:`, error);
        }
        
      } else {
        // Intentar cargar como perfil público desde API
        try {
          await followStore.loadPublicProfile(username.value);
          
          // Si funciona, cargar posts públicos
          if (currentProfile.value) {
            await followStore.loadPublicPosts(username.value, true);
          }
        } catch (publicError) {
          console.warn(`⚠️ [PUBLIC PROFILE] No se pudo cargar como perfil público, creando perfil básico:`, publicError);
          
          // Fallback final: crear perfil simulado básico
          let simulatedProfile;
          if (isNumericId) {
            // Si es un ID numérico, simular perfil
            simulatedProfile = {
              id: parseInt(username.value),
              nombre: `Usuario ${username.value}`,
              username: `user${username.value}`,
              profile_picture_url: null,
              created_at: new Date().toISOString(),
              bio: 'Usuario no encontrado'
            };
          } else {
            // Si es un nombre de usuario, simular perfil
            simulatedProfile = {
              id: Math.floor(Math.random() * 1000000), // ID temporal
              nombre: username.value.replace(/[._-]/g, ' '),
              username: username.value,
              profile_picture_url: null,
              created_at: new Date().toISOString(),
              bio: 'Usuario no encontrado'
            };
          }
          
          // Estadísticas vacías
          const emptyStats = {
            followers_count: 0,
            following_count: 0,
            posts_count: 0
          };
          
          // Asignar datos simulados al store
          followStore.$patch({
            currentPublicProfile: simulatedProfile,
            currentProfileStats: emptyStats,
            isOwnProfile: false,
            isFollowingCurrentUser: false,
            profileLoading: false,
            profileError: null,
            publicPosts: {
              data: [],
              total: 0,
              totalPages: 1,
              page: 1,
              loading: false,
              infiniteLoading: false
            }
          });
          
          console.log(`⚠️ [PUBLIC PROFILE] Perfil básico creado para usuario no encontrado: ${username.value}`);
        }
      }
    }
    
  } catch (error: any) {
    console.error(`❌ [PUBLIC PROFILE] Error cargando perfil:`, error);
    // El error se maneja automáticamente por el store
  }
};

const loadMorePosts = async () => {
  if (canLoadMorePosts.value && !publicPosts.value.infiniteLoading) {
    await followStore.loadMorePublicPosts(username.value);
  }
};

const handleFollow = async () => {
  if (currentProfile.value) {
    await followStore.toggleFollow(currentProfile.value.id);
  }
};

const handleUnfollow = async () => {
  if (currentProfile.value) {
    await followStore.toggleFollow(currentProfile.value.id);
  }
};

const showFollowersModal = () => {
  showFollowersModalState.value = true;
};

const closeFollowersModal = () => {
  showFollowersModalState.value = false;
};

const showFollowingModal = () => {
  showFollowingModalState.value = true;
};

const closeFollowingModal = () => {
  showFollowingModalState.value = false;
};

const getUserAvatar = (avatarUrl?: string | null): string => {
  if (!avatarUrl) {
    return '/default-avatar.png';
  }
  return profileService.getFullImageUrl(avatarUrl);
};

const handleAvatarError = (event: Event) => {
  console.warn('🖼️ [PUBLIC PROFILE] Error cargando avatar, usando fallback');
  avatarError.value = true;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

const calculateDaysActive = (joinDate: string): number => {
  const join = new Date(joinDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - join.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const formatJoinDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long' 
  });
};

const formatWebsite = (url: string): string => {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
};

// Funciones para expandir/contraer posts
const maxDescriptionLength = 200; // Longitud máxima antes de truncar

const needsReadMore = (description: string): boolean => {
  return description && description.length > maxDescriptionLength;
};

const getTruncatedContent = (description: string): string => {
  if (!description || description.length <= maxDescriptionLength) {
    return description;
  }
  return description.substring(0, maxDescriptionLength) + '...';
};

const getExpandedPostContent = (postId: number): boolean => {
  return expandedPosts.value.has(postId);
};

const togglePostExpanded = (postId: number): void => {
  if (expandedPosts.value.has(postId)) {
    expandedPosts.value.delete(postId);
  } else {
    expandedPosts.value.add(postId);
  }
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
      day: 'numeric'
    });
  }
};

// Watchers
watch(() => username.value, (newUsername) => {
  if (newUsername) {
    followStore.resetAllState();
    avatarError.value = false; // Reset avatar error state
    loadProfile();
  }
}, { immediate: false });

watch(() => currentProfile.value?.profile_picture_url, () => {
  avatarError.value = false; // Reset when profile picture changes
});

// Lifecycle
onMounted(async () => {
  console.log(`🚀 [PUBLIC PROFILE] Montando vista para usuario: ${username.value}`);
  await loadProfile();
});

onUnmounted(() => {
  console.log(`👋 [PUBLIC PROFILE] Desmontando vista`);
});
</script>

<style scoped>
/* Animaciones suaves */
.transition-colors {
  transition: all 0.3s ease;
}

/* Efectos hover para estadísticas */
.cursor-pointer:hover {
  transform: translateY(-1px);
}

/* Responsive grid */
@media (max-width: 768px) {
  .grid-cols-3 {
    gap: 0.5rem;
  }
  
  .text-2xl {
    font-size: 1.25rem;
  }
  
  .text-xs {
    font-size: 0.7rem;
  }
}
</style>
