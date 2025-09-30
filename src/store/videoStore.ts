import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useNotifications } from '@/composables/useNotifications';
import { videoService, type VideoSettings } from '@/services/videoService';

export const useVideoStore = defineStore('video', () => {
  const globalNotifications = useNotifications();
  
  // Estado
  const isVideoEnabled = ref<boolean>(true); // Por defecto activado
  const isLoading = ref<boolean>(false);
  const lastModified = ref<string>('');
  const modifiedBy = ref<string>('');

  // Getters
  const shouldLoadVideo = (): boolean => {
    return isVideoEnabled.value;
  };

  // Actions
  const loadVideoSettings = async (): Promise<void> => {
    console.log('🎥 [VIDEO STORE] Cargando configuración de video');
    
    try {
      isLoading.value = true;
      
      try {
        // Verificar permisos de administrador
        videoService.validateAdminAccess();
        
        // Cargar desde backend (endpoint de admin)
        const settings = await videoService.getVideoSettings();
        isVideoEnabled.value = settings.isVideoEnabled;
        lastModified.value = settings.lastModified;
        modifiedBy.value = settings.modifiedBy;
        
        // Sincronizar con localStorage como backup
        localStorage.setItem('videoSettings', JSON.stringify(settings));
        
        console.log('✅ [VIDEO STORE] Configuración cargada desde backend (admin):', settings);
        
      } catch (backendError: any) {
        console.warn('⚠️ [VIDEO STORE] Error del backend, usando localStorage:', backendError.message);
        
        // Fallback a localStorage si el backend falla
        const localSettings = localStorage.getItem('videoSettings');
        if (localSettings) {
          const settings = JSON.parse(localSettings) as VideoSettings;
          isVideoEnabled.value = settings.isVideoEnabled;
          lastModified.value = settings.lastModified;
          modifiedBy.value = settings.modifiedBy;
          console.log('✅ [VIDEO STORE] Configuración cargada desde localStorage:', settings);
        } else {
          // Valores por defecto si no hay nada
          console.log('📝 [VIDEO STORE] Usando valores por defecto');
          isVideoEnabled.value = true;
          lastModified.value = new Date().toISOString();
          modifiedBy.value = 'Sistema';
        }
        
        // Solo mostrar error si es crítico (no de permisos)
        if (!backendError.message.includes('permisos')) {
          if (globalNotifications?.warning) {
            globalNotifications.warning('Usando configuración local de video');
          }
        }
      }
      
    } catch (error: any) {
      console.error('❌ [VIDEO STORE] Error crítico cargando configuración:', error);
      
      // Valores por defecto como último recurso
      isVideoEnabled.value = true;
      lastModified.value = new Date().toISOString();
      modifiedBy.value = 'Sistema';
      
      if (globalNotifications?.error) {
        globalNotifications.error('Error cargando configuración de video');
      }
    } finally {
      isLoading.value = false;
    }
  };

  const loadPublicVideoSettings = async (): Promise<void> => {
    console.log('🎥 [VIDEO STORE] Cargando configuración pública de video');
    
    try {
      isLoading.value = true;
      
      try {
        // Cargar desde endpoint público (sin autenticación)
        const settings = await videoService.getPublicVideoSettings();
        isVideoEnabled.value = settings.isVideoEnabled;
        lastModified.value = settings.lastModified;
        modifiedBy.value = settings.modifiedBy;
        
        // Sincronizar con localStorage como backup
        localStorage.setItem('videoSettings', JSON.stringify(settings));
        
        console.log('✅ [VIDEO STORE] Configuración pública cargada desde backend:', settings);
        
      } catch (backendError: any) {
        console.warn('⚠️ [VIDEO STORE] Error del backend público, usando localStorage:', backendError.message);
        
        // Fallback a localStorage si el backend falla
        const localSettings = localStorage.getItem('videoSettings');
        if (localSettings) {
          const settings = JSON.parse(localSettings) as VideoSettings;
          isVideoEnabled.value = settings.isVideoEnabled;
          lastModified.value = settings.lastModified;
          modifiedBy.value = settings.modifiedBy;
          console.log('✅ [VIDEO STORE] Configuración cargada desde localStorage:', settings);
        } else {
          // Valores por defecto si no hay nada
          console.log('📝 [VIDEO STORE] Usando valores por defecto (público)');
          isVideoEnabled.value = true;
          lastModified.value = new Date().toISOString();
          modifiedBy.value = 'Sistema';
        }
        
        if (globalNotifications?.warning) {
          globalNotifications.warning('Usando configuración local de video');
        }
      }
      
    } catch (error: any) {
      console.error('❌ [VIDEO STORE] Error crítico cargando configuración pública:', error);
      
      // Valores por defecto como último recurso
      isVideoEnabled.value = true;
      lastModified.value = new Date().toISOString();
      modifiedBy.value = 'Sistema';
      
      if (globalNotifications?.error) {
        globalNotifications.error('Error cargando configuración de video');
      }
    } finally {
      isLoading.value = false;
    }
  };

  const toggleVideoEnabled = async (enabled: boolean, adminName: string): Promise<boolean> => {
    console.log(`🎥 [VIDEO STORE] ${enabled ? 'Activando' : 'Desactivando'} video - Admin: ${adminName}`);
    
    try {
      isLoading.value = true;
      
      try {
        // Verificar permisos de administrador
        videoService.validateAdminAccess();
        
        // Enviar al backend
        const updatedSettings = await videoService.updateVideoSettings({
          isVideoEnabled: enabled,
          modifiedBy: adminName
        });
        
        // Actualizar estado local con la respuesta del backend
        isVideoEnabled.value = updatedSettings.isVideoEnabled;
        lastModified.value = updatedSettings.lastModified;
        modifiedBy.value = updatedSettings.modifiedBy;
        
        // Sincronizar con localStorage como backup
        localStorage.setItem('videoSettings', JSON.stringify(updatedSettings));
        
        console.log(`✅ [VIDEO STORE] Video ${enabled ? 'activado' : 'desactivado'} en backend exitosamente`);
        
      } catch (backendError: any) {
        console.warn('⚠️ [VIDEO STORE] Error del backend, guardando solo localmente:', backendError.message);
        
        // Fallback: guardar solo en localStorage
        const localSettings: VideoSettings = {
          isVideoEnabled: enabled,
          lastModified: new Date().toISOString(),
          modifiedBy: adminName
        };
        
        localStorage.setItem('videoSettings', JSON.stringify(localSettings));
        
        // Actualizar estado local
        isVideoEnabled.value = localSettings.isVideoEnabled;
        lastModified.value = localSettings.lastModified;
        modifiedBy.value = localSettings.modifiedBy;
        
        // Mostrar advertencia si no es problema de permisos
        if (!backendError.message.includes('permisos')) {
          if (globalNotifications?.warning) {
            globalNotifications.warning('Configuración guardada solo localmente');
          }
        } else {
          // Si es problema de permisos, mostrar error y fallar
          if (globalNotifications?.error) {
            globalNotifications.error(backendError.message);
          }
          return false;
        }
      }
      
      // Mostrar mensaje de éxito
      if (globalNotifications?.success) {
        globalNotifications.success(
          enabled 
            ? 'Video online activado correctamente' 
            : 'Video online desactivado correctamente'
        );
      }
      
      console.log(`✅ [VIDEO STORE] Video ${enabled ? 'activado' : 'desactivado'} exitosamente`);
      return true;
      
    } catch (error: any) {
      console.error('❌ [VIDEO STORE] Error crítico actualizando configuración:', error);
      
      if (globalNotifications?.error) {
        globalNotifications.error('Error actualizando configuración de video');
      }
      
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const initializeVideoStore = async (): Promise<void> => {
    console.log('🎥 [VIDEO STORE] Inicializando store de video');
    
    try {
      // Verificar si el usuario es administrador
      videoService.validateAdminAccess();
      
      // Si es admin, usar endpoint de administrador  
      console.log('🎥 [VIDEO STORE] Usuario administrador - usando endpoint admin');
      await loadVideoSettings();
      
    } catch (error: any) {
      // Si no es admin o falla la validación, usar endpoint público
      console.log('🎥 [VIDEO STORE] Usuario regular - usando endpoint público');
      await loadPublicVideoSettings();
    }
  };

  return {
    // Estado
    isVideoEnabled,
    isLoading,
    lastModified,
    modifiedBy,
    
    // Getters
    shouldLoadVideo,
    
    // Actions
    loadVideoSettings,
    loadPublicVideoSettings,
    toggleVideoEnabled,
    initializeVideoStore
  };
});
