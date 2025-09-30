<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header de la página -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Mi Perfil
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Gestiona tu información personal y foto de perfil
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div class="flex items-center">
          <svg class="w-6 h-6 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 class="text-red-800 dark:text-red-200 font-medium">Error al cargar el perfil</h3>
            <p class="text-red-600 dark:text-red-400 text-sm">{{ error }}</p>
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
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar con foto de perfil -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="text-center">
              <!-- Componente de subida de foto -->
              <ProfilePictureUpload 
                :user="userProfile"
                :size="120"
                @uploaded="handlePhotoUploaded"
                @removed="handlePhotoRemoved"
                @error="handlePhotoError"
                class="mb-6"
              />

              <!-- Información básica del usuario -->
              <div class="text-center">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                  {{ userProfile?.nombre }}
                </h2>
                <p class="text-gray-600 dark:text-gray-400 capitalize">
                  {{ userProfile?.rol }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {{ userProfile?.email }}
                </p>
              </div>

              <!-- Estadísticas del usuario REALES desde backend -->
              <div class="mt-6 grid grid-cols-2 gap-4">
                <!-- NUEVAS: Estadísticas de seguimiento -->
                <div class="text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors" 
                     @click="openFollowersModal" 
                     :title="feedStore.userStats.followers_count > 0 ? 'Ver seguidores' : 'Sin seguidores'">
                  <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {{ formatNumber(feedStore.userStats.followers_count) }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Seguidores
                  </div>
                </div>
                <div class="text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                     @click="openFollowingModal"
                     :title="feedStore.userStats.following_count > 0 ? 'Ver siguiendo' : 'No sigues a nadie'">
                  <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                    {{ formatNumber(feedStore.userStats.following_count) }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Siguiendo
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {{ formatNumber(feedStore.userStats.posts_count) }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Publicaciones
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {{ userStats.joinedDays }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Días activo
                  </div>
                </div>
                <!-- MANTENER: Estadísticas de loterías (específicas del sistema) -->
                <div class="text-center">
                  <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {{ lotteryParticipations }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Loterías jugadas
                  </div>
                </div>
                <div class="text-center">
                  <button 
                    class="mx-auto inline-flex items-center gap-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400 hover:opacity-90"
                    :disabled="lotteryWins === 0"
                    @click="openWinsModal"
                    :title="lotteryWins > 0 ? 'Ver loterías ganadas' : 'Sin loterías ganadas'"
                  >
                    <span>{{ lotteryWins }}</span>
                    <svg v-if="lotteryWins > 0" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M8 21h8l1-7H7l1 7zm8-9V7h1V5H7v2h1v5H5l2 12h10l2-12h-3zM9 7h6v5H9V7z"/>
                    </svg>
                  </button>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Loterías ganadas
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Acciones rápidas -->
          <div class="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Acciones rápidas
            </h3>
            <div class="space-y-3">
              <button 
                @click="refreshProfile"
                :disabled="isRefreshing"
                class="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg v-if="!isRefreshing" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <svg v-else class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                {{ isRefreshing ? 'Actualizando...' : 'Actualizar datos' }}
              </button>

              <router-link 
                to="/configuracion"
                class="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Configuración
              </router-link>
            </div>
          </div>
        </div>

        <!-- Contenido principal -->
        <div class="lg:col-span-2">
          <!-- Navegación interna -->
          <div class="mb-6">
            <nav class="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
              <button
                @click="scrollToSection('profile-info')"
                :class="[
                  'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeSection === 'profile-info' 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-blue-500'
                ]"
              >
                Información del Perfil
              </button>
              <button
                @click="scrollToSection('my-posts')"
                :class="[
                  'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeSection === 'my-posts' 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-blue-500'
                ]"
              >
                Mis Publicaciones
                <span v-if="communityPosts > 0" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  {{ communityPosts }}
                </span>
              </button>
            </nav>
          </div>

          <div class="space-y-8">
            <!-- Sección: Información del perfil -->
            <div id="profile-info" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                Información del Perfil
              </h2>
              <button 
                @click="toggleEditMode"
                class="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                {{ isEditing ? 'Cancelar' : 'Editar' }}
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Nombre -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre completo
                </label>
                <input 
                  v-if="isEditing"
                  v-model="editForm.nombre"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Ingresa tu nombre completo"
                />
                <p v-else class="px-3 py-2 text-gray-900 dark:text-white">
                  {{ userProfile?.nombre }}
                </p>
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input 
                  v-if="isEditing"
                  v-model="editForm.email"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="tu@email.com"
                />
                <p v-else class="px-3 py-2 text-gray-900 dark:text-white">
                  {{ userProfile?.email }}
                </p>
              </div>

              <!-- Rol -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rol
                </label>
                <p class="px-3 py-2 text-gray-900 dark:text-white capitalize">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getRoleBadgeClass(userProfile?.rol)">
                    {{ userProfile?.rol }}
                  </span>
                </p>
              </div>

              <!-- Fecha de registro -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Miembro desde
                </label>
                <p class="px-3 py-2 text-gray-900 dark:text-white">
                  {{ formatDate(userProfile?.created_at) }}
                </p>
              </div>
            </div>

            <!-- Botones de edición -->
            <div v-if="isEditing" class="mt-6 flex justify-end space-x-3">
              <button 
                @click="cancelEdit"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button 
                @click="saveChanges"
                :disabled="isSaving"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {{ isSaving ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </div>
          </div>

            <!-- Sección: Mis Publicaciones -->
            <div id="my-posts" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                Mis Publicaciones
                <span v-if="communityPosts > 0" class="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  {{ communityPosts }}
                </span>
              </h2>
            </div>
            
            <UserPostsTab />
            </div>
          </div>

          <!-- Mensajes de notificación -->
          <div v-if="notifications.length > 0" class="space-y-4">
            <TransitionGroup name="notification" tag="div">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="p-4 rounded-lg border"
                :class="getNotificationClass(notification.type)"
              >
                <div class="flex items-center">
                  <div class="mr-3">
                    <svg v-if="notification.type === 'success'" class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <svg v-else-if="notification.type === 'error'" class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <svg v-else class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium">{{ notification.message }}</p>
                  </div>
                  <button 
                    @click="removeNotification(notification.id)"
                    class="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>

      <!-- Modal de loterías ganadas -->
      <div v-if="showWinsModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Loterías ganadas</h3>
            <button @click="closeWinsModal" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
          </div>
          <div class="p-4 max-h-[60vh] overflow-auto">
            <div v-if="winsLoading" class="py-6 text-center text-gray-500">Cargando...</div>
            <div v-else-if="winsError" class="py-6 text-center text-red-500">{{ winsError }}</div>
            <div v-else>
              <div v-if="userWins.length === 0" class="text-center text-gray-500">No hay registros</div>
              <ul v-else class="space-y-3">
                <li v-for="(win, idx) in userWins" :key="idx" class="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                  <div class="flex items-start gap-3">
                    <img v-if="win.lottery_image_url" :src="win.lottery_image_url" alt="Imagen lotería" class="w-12 h-12 rounded object-cover border border-gray-200 dark:border-gray-700" />
                    <div class="flex-1">
                      <div class="flex justify-between items-center">
                        <router-link :to="`/lotteries/${win.lottery_id}`" class="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                          {{ win.lottery_title }}
                        </router-link>
                        <div class="text-yellow-600 dark:text-yellow-400 font-bold">#{{ win.winning_number }}</div>
                      </div>
                      <p v-if="win.prize_description" class="text-sm text-gray-700 dark:text-gray-300 mt-1">Premio: {{ win.prize_description }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Fecha: {{ formatDate(win.won_at) }}</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-right">
            <button @click="closeWinsModal" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useFeedStore } from '@/store/feedStore';
import { User, ProfileResponse } from '@/types/api';
import ProfilePictureUpload from '@/components/ui/ProfilePictureUpload.vue';
import UserPostsTab from '@/components/profile/UserPostsTab.vue';
import { profileService } from '@/services/profileService';
import { lotteryService } from '@/services/lotteryService'

// Stores
const authStore = useAuthStore();
const feedStore = useFeedStore();

// Estado reactivo
const isLoading = ref(true);
const isEditing = ref(false);
const isSaving = ref(false);
const isRefreshing = ref(false);
const error = ref<string | null>(null);
const userProfile = ref<User | null>(null);
const lotteryParticipations = ref<number>(0);
const lotteryWins = ref<number>(0);
const communityPosts = ref<number>(0);
const showWinsModal = ref(false)
const userWins = ref<Array<{ lottery_id: number; lottery_title: string; winning_number: number; won_at: string; prize_description?: string; lottery_image_url?: string }>>([])
const winsLoading = ref(false)
const winsError = ref<string | null>(null)
const activeSection = ref<string>('profile-info')

// Formulario de edición
const editForm = reactive({
  nombre: '',
  email: ''
});

// Notificaciones
interface Notification {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

const notifications = ref<Notification[]>([]);
let notificationId = 0;

// Estadísticas del usuario (si el backend provee comments_count lo usamos)
const userStats = computed(() => ({
  commentsCount: userProfile.value?.comments_count ?? 0,
  joinedDays: userProfile.value?.created_at 
    ? Math.floor((Date.now() - new Date(userProfile.value.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0
}));

// Cargar perfil del usuario
const loadProfile = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response: ProfileResponse = await profileService.getMyProfile();
    userProfile.value = response.user;

    // Guardar stats de lotería si vienen
    lotteryParticipations.value = response.stats?.lottery_participations ?? 0;
    lotteryWins.value = response.stats?.lottery_wins ?? 0;
    communityPosts.value = response.stats?.community_posts_count ?? 0;
    
    // Actualizar formulario de edición
    editForm.nombre = response.user.nombre;
    editForm.email = response.user.email;

  } catch (err: any) {
    error.value = err.message || 'Error al cargar el perfil';
    console.error('Error loading profile:', err);
  } finally {
    isLoading.value = false;
  }
};

// Refrescar perfil
const refreshProfile = async () => {
  isRefreshing.value = true;
  try {
    await authStore.refreshUserProfile();
    await loadProfile();
    addNotification('success', 'Perfil actualizado correctamente');
  } catch (err: any) {
    addNotification('error', err.message || 'Error al actualizar el perfil');
  } finally {
    isRefreshing.value = false;
  }
};

// Manejar eventos de foto de perfil
const handlePhotoUploaded = (url: string) => {
  addNotification('success', 'Foto de perfil actualizada correctamente');
  // El ProfilePictureUpload ya actualiza el store automáticamente
};

const handlePhotoRemoved = () => {
  addNotification('success', 'Foto de perfil eliminada correctamente');
};

const handlePhotoError = (error: string) => {
  addNotification('error', error);
};

// Modo de edición
const toggleEditMode = () => {
  if (isEditing.value) {
    cancelEdit();
  } else {
    isEditing.value = true;
  }
};

const cancelEdit = () => {
  isEditing.value = false;
  // Restaurar valores originales
  if (userProfile.value) {
    editForm.nombre = userProfile.value.nombre;
    editForm.email = userProfile.value.email;
  }
};

const saveChanges = async () => {
  isSaving.value = true;
  
  try {
    // TODO: Implementar API endpoint para actualizar perfil
    // Por ahora solo simulamos el guardado exitoso
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Actualizar datos locales
    if (userProfile.value) {
      userProfile.value.nombre = editForm.nombre;
      userProfile.value.email = editForm.email;
      
      // Actualizar en el store
      authStore.updateUserProfile(userProfile.value);
    }
    
    isEditing.value = false;
    addNotification('success', 'Perfil actualizado correctamente');
    
  } catch (err: any) {
    addNotification('error', err.message || 'Error al guardar los cambios');
  } finally {
    isSaving.value = false;
  }
};

// Utilidades
const formatDate = (dateString?: string) => {
  if (!dateString) return 'No disponible';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Función para formatear números grandes
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

// Funciones para modales (por implementar - temporal)
const openFollowersModal = () => {
  console.log('🔄 [PROFILE] Abrir modal de seguidores - funcionalidad próximamente');
};

const openFollowingModal = () => {
  console.log('🔄 [PROFILE] Abrir modal de siguiendo - funcionalidad próximamente');
};

const getRoleBadgeClass = (rol?: string) => {
  switch (rol) {
    case 'administrador':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'colaborador':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

// Notificaciones
const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
  const notification: Notification = {
    id: ++notificationId,
    type,
    message
  };
  
  notifications.value.push(notification);
  
  // Auto-eliminar después de 5 segundos
  setTimeout(() => {
    removeNotification(notification.id);
  }, 5000);
};

const removeNotification = (id: number) => {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index > -1) {
    notifications.value.splice(index, 1);
  }
};

const getNotificationClass = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400';
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
    default:
      return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400';
  }
};

function openWinsModal() {
  if (lotteryWins.value === 0) return
  showWinsModal.value = true
  fetchUserWins()
}

function closeWinsModal() {
  showWinsModal.value = false
}

async function fetchUserWins() {
  try {
    winsLoading.value = true
    winsError.value = null
    const resp = await lotteryService.getUserWins(1, 50)
    // Normalizar estructura
    const data = Array.isArray(resp?.data) ? resp.data : []
    userWins.value = data.map((w: any) => ({
      lottery_id: Number(w.lottery_id ?? w.id ?? 0),
      lottery_title: w.lottery_title ?? w.title ?? `Lotería ${w.lottery_id}`,
      winning_number: Number(w.winning_number ?? w.number ?? 0),
      won_at: w.won_at ?? w.created_at ?? new Date().toISOString(),
      prize_description: w.prize_description ?? undefined,
      lottery_image_url: w.lottery_image_url ?? undefined
    }))
  } catch (e: any) {
    winsError.value = e?.message || 'No se pudieron cargar las loterías ganadas'
  } finally {
    winsLoading.value = false
  }
}

// Función para scroll suave a secciones
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    // Actualizar manualmente la sección activa
    activeSection.value = sectionId;
    
    // Scroll suave con offset para no cubrir el elemento con el header
    const offsetTop = element.offsetTop - 80; // 80px de offset desde arriba
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
};

// Función para detectar cuál sección está visible
const updateActiveSection = () => {
  const sections = ['profile-info', 'my-posts'];
  const scrollPosition = window.scrollY + 120; // offset para considerar visible
  
  for (const sectionId of sections) {
    const element = document.getElementById(sectionId);
    if (element) {
      const rect = element.getBoundingClientRect();
      const elementTop = element.offsetTop;
      const elementBottom = elementTop + element.offsetHeight;
      
      if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
        activeSection.value = sectionId;
        break;
      }
    }
  }
};

// Inicialización
onMounted(async () => {
  // Si el usuario está en el store, usarlo como inicial
  if (authStore.user) {
    userProfile.value = authStore.user;
    editForm.nombre = authStore.user.nombre;
    editForm.email = authStore.user.email;
  }
  
  // Cargar datos actualizados del servidor
  await loadProfile();
  
  // ✅ NUEVO: Cargar estadísticas reales del usuario
  console.log('📊 [PROFILE] Cargando estadísticas de usuario...');
  await feedStore.loadUserStats();
  console.log('✅ [PROFILE] Estadísticas cargadas:', feedStore.userStats);
  
  // Agregar listener para detectar sección visible
  window.addEventListener('scroll', updateActiveSection);
  
  // Detectar sección inicial
  setTimeout(() => {
    updateActiveSection();
  }, 100);
});

// Cleanup al desmontar
onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveSection);
});
</script>

<style scoped>
/* Animaciones para notificaciones */
.notification-enter-active, .notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* Estilos responsive */
@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style> 