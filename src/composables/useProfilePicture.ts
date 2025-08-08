import { ref, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import profileService from '@/services/profileService';
import { useNotifications } from './useNotifications';

export function useProfilePicture() {
  const authStore = useAuthStore();
  const { addNotification } = useNotifications();
  
  // Estado reactivo
  const isUploading = ref(false);
  const isRemoving = ref(false);
  const uploadProgress = ref(0);
  
  // Usuario actual
  const currentUser = computed(() => authStore.user);
  
  // URL de la imagen actual
  const currentImageUrl = computed(() => {
    if (!currentUser.value?.profile_picture_url) {
      return '/default-avatar.png';
    }
    return profileService.getFullImageUrl(currentUser.value.profile_picture_url);
  });
  
  // Verificar si el usuario tiene foto de perfil
  const hasProfilePicture = computed(() => {
    return !!(currentUser.value?.profile_picture_url);
  });
  
  // Subir nueva foto de perfil
  const uploadPicture = async (file: File): Promise<boolean> => {
    if (!currentUser.value) {
      addNotification('error', 'Debes estar autenticado para subir una foto');
      return false;
    }
    
    // Validar archivo
    const validation = profileService.validateImageFile(file);
    if (!validation.valid) {
      addNotification('error', validation.error!);
      return false;
    }
    
    isUploading.value = true;
    uploadProgress.value = 0;
    
    try {
      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        if (uploadProgress.value < 90) {
          uploadProgress.value += 10;
        }
      }, 100);
      
      const response = await profileService.uploadProfilePicture(file);
      
      clearInterval(progressInterval);
      uploadProgress.value = 100;
      
      // Actualizar usuario en el store
      const updatedUser = {
        ...currentUser.value,
        profile_picture_url: response.profile_picture_url
      };
      authStore.updateUserProfile(updatedUser);
      
      addNotification('success', 'Foto de perfil actualizada correctamente');
      return true;
      
    } catch (error: any) {
      addNotification('error', error.message || 'Error al subir la imagen');
      return false;
    } finally {
      isUploading.value = false;
      uploadProgress.value = 0;
    }
  };
  
  // Eliminar foto de perfil
  const removePicture = async (): Promise<boolean> => {
    if (!currentUser.value) {
      addNotification('error', 'Debes estar autenticado para eliminar la foto');
      return false;
    }
    
    if (!hasProfilePicture.value) {
      addNotification('info', 'No tienes una foto de perfil para eliminar');
      return false;
    }
    
    isRemoving.value = true;
    
    try {
      await profileService.removeProfilePicture();
      
      // Actualizar usuario en el store
      const updatedUser = {
        ...currentUser.value,
        profile_picture_url: null
      };
      authStore.updateUserProfile(updatedUser);
      
      addNotification('success', 'Foto de perfil eliminada correctamente');
      return true;
      
    } catch (error: any) {
      addNotification('error', error.message || 'Error al eliminar la imagen');
      return false;
    } finally {
      isRemoving.value = false;
    }
  };
  
  // Crear preview de imagen
  const createPreview = async (file: File): Promise<string | null> => {
    try {
      return await profileService.createImagePreview(file);
    } catch (error: any) {
      addNotification('error', 'Error al crear vista previa de la imagen');
      return null;
    }
  };
  
  // Refrescar datos del perfil
  const refreshProfile = async (): Promise<boolean> => {
    try {
      await authStore.refreshUserProfile();
      addNotification('success', 'Perfil actualizado correctamente');
      return true;
    } catch (error: any) {
      addNotification('error', error.message || 'Error al actualizar el perfil');
      return false;
    }
  };
  
  return {
    // Estado
    isUploading: computed(() => isUploading.value),
    isRemoving: computed(() => isRemoving.value),
    uploadProgress: computed(() => uploadProgress.value),
    
    // Datos computados
    currentUser,
    currentImageUrl,
    hasProfilePicture,
    
    // Métodos
    uploadPicture,
    removePicture,
    createPreview,
    refreshProfile,
    
    // Utilidades
    validateFile: profileService.validateImageFile,
    getFullImageUrl: profileService.getFullImageUrl
  };
} 