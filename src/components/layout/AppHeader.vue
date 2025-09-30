<template>
  <header 
    ref="headerRef" 
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b"
    :style="{ backgroundColor: 'var(--nav)', color: 'var(--on-nav)', borderColor: 'var(--nav-border)' }"
    :class="{ 
      '-translate-y-full': (!isHeaderVisible && !isAtTop) || isFeedTabsSticky, 
      'shadow-lg backdrop-blur-xl bg-white/90 dark:bg-gray-900/90': !isAtTop,
      'shadow-md': isAtTop 
    }"
  >
    <div class="container mx-auto px-4 lg:px-6 h-full w-full">
      <div class="flex justify-between items-center h-full w-full">
        <!-- Izquierda: Menú y Controles -->
        <div class="flex items-center space-x-4 min-w-0 flex-1">
          <!-- Botón de menú principal -->
          <div class="relative" ref="mainMenuRef">
            <button 
              @click="toggleMenu" 
              class="group relative p-2 rounded-lg transition-all duration-200 focus:outline-none"
              aria-label="Abrir menú"
            >
              <div class="relative w-6 h-6">
                <span class="absolute inset-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                  <svg class="w-6 h-6" :style="{ color: 'var(--on-nav)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </span>
              </div>
            </button>

            <!-- Dropdown del menú principal -->
            <transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div v-if="isMainMenuOpen" class="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                <!-- Crear nueva publicación -->
                <router-link 
                  v-if="authStore.isAuthenticated"
                  to="/comunicaciones/crear" 
                  @click="closeMainMenu"
                  class="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <div class="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium">Crear Publicación</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Comparte con la comunidad</p>
                  </div>
                </router-link>

                <!-- Divider si hay más opciones futuras -->
                <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                <!-- Placeholder para futuras opciones -->
                <div class="px-4 py-2">
                  <p class="text-xs text-gray-500 dark:text-gray-400 text-center">Más opciones próximamente</p>
                </div>
              </div>
            </transition>
          </div>

          <!-- Selector de tema -->
          <button 
            @click="toggleTheme" 
            class="group relative p-2 rounded-lg transition-all duration-200 focus:outline-none"
            aria-label="Cambiar tema"
          >
            <div class="relative w-6 h-6">
              <transition name="theme-switch" mode="out-in">
                <svg v-if="isDark" key="moon" class="w-6 h-6 text-yellow-400 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/>
                </svg>
                <svg v-else key="sun" class="w-6 h-6 text-orange-400 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-90" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,6a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V5A1,1,0,0,0,12,6ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-1.41-1.42a1,1,0,0,0-1.42,1.42ZM5,12a1,1,0,0,0-1-1H2a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm.64,5.95a1,1,0,0,0-.7-.29,1,1,0,0,0-.71.29,1,1,0,0,0,0,1.41l1.41,1.42a1,1,0,1,0,1.42-1.42ZM12,18a1,1,0,0,0-1,1v2a1,1,0,0,0,2,0V19A1,1,0,0,0,12,18Zm5.95-.64a1,1,0,0,0-1.41,0,1,1,0,0,0,0,1.41l1.42,1.42a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.42ZM22,11H20a1,1,0,0,0,0,2h2a1,1,0,0,0,0-2Zm-2.64-3.95a1,1,0,0,0,.7-.29l1.42-1.42a1,1,0,0,0-1.42-1.42L18.36,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,19.36,7.05ZM12,8a4,4,0,1,0,4,4A4,4,0,0,0,12,8Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,12,14Z"/>
                </svg>
              </transition>
            </div>
          </button>
        </div>

        <!-- Centro: Logo y Título -->
        <div class="flex items-center justify-center space-x-3 min-w-0 flex-1">
          <router-link 
            to="/"
            class="group flex items-center space-x-3 transition-all duration-300 hover:scale-105 focus:outline-none rounded-lg p-2"
          >
            <!-- Logo -->
            <div class="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:from-blue-600 group-hover:to-purple-700">
              <svg class="w-8 h-8 text-white transition-transform duration-300 group-hover:scale-110" :class="{ 'w-6 h-6': !isAtTop }" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
              <!-- Efecto de brillo -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
            
            <!-- Título -->
            <div class="hidden sm:block">
              <h1 class="text-xl lg:text-2xl font-bold transition-all duration-300" :style="{ color: 'var(--on-nav)' }" :class="{ 'text-lg lg:text-xl': !isAtTop }">
                Diario CdelU
              </h1>
              <p class="text-xs font-medium tracking-wide" :style="{ color: 'var(--on-nav)' }">
                NOTICIAS LOCALES
              </p>
            </div>
          </router-link>
        </div>

        <!-- Derecha: Autenticación y Perfil -->
        <div class="flex items-center justify-end space-x-3 min-w-0 flex-1">
          <template v-if="authStore.isAuthenticated && authStore.user">
            <!-- Menú de usuario -->
            <div class="relative" ref="userMenuRef">
              <button 
                @click="toggleUserMenu"
                class="group flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 focus:outline-none"
              >
                <!-- Avatar -->
                <div class="relative">
                  <UserAvatar 
                    :user="authStore.user"
                    :size="32"
                    :bordered="false"
                    class="transition-all duration-200 group-hover:scale-105"
                  />
                  <!-- Indicador online -->
                  <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full"></div>
                </div>
                
                <!-- Nombre (oculto en móvil) -->
                <div class="hidden md:block text-left" :style="{ color: 'var(--on-nav)' }">
                  <p class="text-sm font-medium truncate max-w-24">
                    {{ authStore.user.nombre }}
                  </p>
                  <p class="text-xs opacity-90 capitalize">
                    {{ authStore.user.rol }}
                  </p>
                </div>

                <!-- Chevron -->
                <svg class="w-4 h-4 transition-transform duration-200" :style="{ color: 'var(--on-nav)' }" :class="{ 'rotate-180': isUserMenuOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              <!-- Dropdown menu -->
              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div v-if="isUserMenuOpen" class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2">
                  <!-- Perfil info -->
                  <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ authStore.user.nombre }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ authStore.user.email }}</p>
                  </div>

                  <!-- Botón de refrescar (solo en Home) -->
                  <button v-if="isHome" @click="handleRefreshFeed" class="flex items-center w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50" :disabled="feedStore.isLoading">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114.32-4.906M20 14a8 8 0 01-14.32 4.906"></path>
                    </svg>
                    Actualizar contenido
                  </button>

                  <!-- Menu items -->
                  <router-link to="/perfil" class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" @click="closeUserMenu">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Mi Perfil
                  </router-link>

                  <router-link to="/configuracion" class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" @click="closeUserMenu">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Configuración
                  </router-link>

                  <router-link to="/publicidad" class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" @click="closeUserMenu">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.6A9 9 0 0 0 5.6 11a9 9 0 0 0 5.4 5.4 9 9 0 0 0 5.4-5.4A9 9 0 0 0 11 5.6z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v2m0 14v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m14 0h2M6.34 6.34l-1.41 1.41m11.32-1.41l-1.41-1.41"></path>
                    </svg>
                    Publicidad
                  </router-link>

                  <router-link to="/lotteries" class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" @click="closeUserMenu">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Loterías
                  </router-link>

                  <router-link to="/surveys" class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" @click="closeUserMenu">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                    </svg>
                    Sorteos
                  </router-link>

                  <router-link v-if="authStore.user?.rol === 'administrador'" to="/lotteries/admin" class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" @click="closeUserMenu">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                    </svg>
                    Administrar Loterías
                  </router-link>

                  <router-link v-if="authStore.user?.rol === 'administrador'" to="/surveys/admin" class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" @click="closeUserMenu">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                    </svg>
                    Administrar Sorteos
                  </router-link>

                  <!-- Control de Video Online (Solo Administradores) -->
                  <div v-if="authStore.user?.rol === 'administrador'" class="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <svg class="w-4 h-4 mr-3 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        <span class="text-sm text-gray-700 dark:text-gray-300">Video Online</span>
                      </div>
                      <button
                        @click="toggleVideoSetting"
                        :disabled="videoStore.isLoading"
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        :class="videoStore.isVideoEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'"
                      >
                        <span
                          class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                          :class="videoStore.isVideoEnabled ? 'translate-x-6' : 'translate-x-1'"
                        />
                      </button>
                    </div>
                    <p v-if="videoStore.lastModified" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {{ videoStore.isVideoEnabled ? 'Activado' : 'Desactivado' }} por {{ videoStore.modifiedBy }}
                    </p>
                  </div>

                  <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                  <button 
                    @click="handleLogout"
                    class="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Cerrar Sesión
                  </button>
                </div>
              </transition>
            </div>
          </template>

          <!-- Botones de login/registro para usuarios no autenticados -->
          <template v-else>
            <div class="flex items-center space-x-2">
              <router-link 
                to="/login" 
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
              >
                Ingresar
              </router-link>
              <router-link 
                to="/register" 
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:scale-105"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Registrarse
              </router-link>
            </div>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useWindowScroll, onClickOutside } from '@vueuse/core';
import { useAuthStore } from '@/store/auth';
import { useThemeStore } from '@/store/theme';
import { useRouter } from 'vue-router';
import UserAvatar from '@/components/ui/UserAvatar.vue';
import { useFeedStore } from '@/store/feedStore';
import { useVideoStore } from '@/store/videoStore';

const headerRef = ref<HTMLElement | null>(null);
const userMenuRef = ref<HTMLElement | null>(null);
const mainMenuRef = ref<HTMLElement | null>(null);
const isHeaderVisible = ref(true);
const isAtTop = ref(true);
const isUserMenuOpen = ref(false);
const isMainMenuOpen = ref(false);
let lastScrollY = 0;

const authStore = useAuthStore();
const themeStore = useThemeStore();
const router = useRouter();
const feedStore = useFeedStore();
const videoStore = useVideoStore();

// Usar nuestro store de tema personalizado
const { isDark, toggleTheme } = themeStore;

// Computed para detectar si las tabs están sticky
const isFeedTabsSticky = computed(() => {
  const stickyValue = getComputedStyle(document.documentElement).getPropertyValue('--feed-tabs-sticky');
  return stickyValue === '1';
});

const isHome = computed(() => router.currentRoute.value.name === 'Home');

function handleScroll() {
  const currentScrollY = window.scrollY;
  isAtTop.value = currentScrollY < 50;

  if (isAtTop.value) {
    isHeaderVisible.value = true;
  } else {
    if (currentScrollY < lastScrollY) {
      isHeaderVisible.value = true;
    } else {
      isHeaderVisible.value = false;
    }
  }
  lastScrollY = currentScrollY < 0 ? 0 : currentScrollY;
}

function handleRefreshFeed() {
  if (isHome.value) {
    feedStore.refresh();
    closeUserMenu();
  }
}

const handleLogout = () => {
  isUserMenuOpen.value = false;
  authStore.logout();
  router.push('/login');
};

const toggleMenu = () => {
  isMainMenuOpen.value = !isMainMenuOpen.value;
};

const closeMainMenu = () => {
  isMainMenuOpen.value = false;
};

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const closeUserMenu = () => {
  isUserMenuOpen.value = false;
};

const toggleVideoSetting = async () => {
  if (!authStore.user || authStore.user.rol !== 'administrador') {
    return;
  }
  
  const newState = !videoStore.isVideoEnabled;
  const adminName = authStore.user.nombre || 'Administrador';
  
  await videoStore.toggleVideoEnabled(newState, adminName);
};

// Cerrar menús al hacer click fuera
onClickOutside(userMenuRef, () => {
  if (isUserMenuOpen.value) {
    closeUserMenu();
  }
});

onClickOutside(mainMenuRef, () => {
  if (isMainMenuOpen.value) {
    closeMainMenu();
  }
});

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  lastScrollY = window.scrollY;
  isAtTop.value = lastScrollY < 50;
  
  // Inicializar configuración de video para TODOS los usuarios
  // Esto permite que el estado global se aplique a todos
    videoStore.initializeVideoStore();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.container {
  max-width: 1200px;
}

/* Altura fija del header para prevenir CLS */
header {
  height: 64px; /* Altura fija para evitar layout shifts */
  min-height: 64px;
  max-height: 64px;
  display: flex;
  align-items: center; /* Centrar verticalmente contenido dentro del header */
  left: 0;
  right: 0;
  width: 100%;
  background-color: var(--nav);
  color: var(--on-nav);
  border-bottom: 1px solid var(--nav-border);
}

/* Transiciones para el cambio de tema */
.theme-switch-enter-active, .theme-switch-leave-active {
  transition: all 0.3s ease-in-out;
}

.theme-switch-enter-from {
  opacity: 0;
  transform: rotate(90deg) scale(0.8);
}

.theme-switch-leave-to {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}

/* Efectos de glassmorphism para mejor contraste */
@supports (backdrop-filter: blur()) {
  header {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
}

/* Animaciones personalizadas */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Hover effects mejorados */
.group:hover .group-hover\:shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Dark mode improvements */
@media (prefers-color-scheme: dark) {
  .dark\:bg-gray-900\/80 {
    background-color: rgba(17, 24, 39, 0.8);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Focus improvements for accessibility */
button:focus,
a:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style> 