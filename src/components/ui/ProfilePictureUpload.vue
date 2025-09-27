<template>
  <div class="profile-picture-upload">
    <!-- Contenedor principal de la foto -->
    <div 
      class="profile-picture-container"
      @click="openFileSelector"
      :class="{ 
        'loading': isUploading,
        'error': hasError 
      }"
    >
      <img 
        :src="currentImageUrl" 
        :alt="user?.nombre || 'Foto de perfil'"
        class="profile-picture"
      />
      
      <!-- Overlay con botones -->
      <div class="profile-picture-overlay">
        <button 
          type="button" 
          class="overlay-button primary"
          :disabled="isUploading"
        >
          <i class="icon">📷</i>
          {{ hasProfilePicture ? 'Cambiar foto' : 'Subir foto' }}
        </button>
        
        <button 
          v-if="hasProfilePicture"
          type="button" 
          class="overlay-button danger"
          @click.stop="confirmRemove"
          :disabled="isUploading"
        >
          <i class="icon">🗑️</i>
          Eliminar
        </button>
      </div>

      <!-- Indicador de carga -->
      <div v-if="isUploading" class="upload-progress">
        <div class="spinner"></div>
        <span>{{ uploadProgressText }}</span>
      </div>
    </div>

    <!-- Input oculto para seleccionar archivo -->
    <input 
      ref="fileInput"
      type="file" 
      accept="image/jpeg,image/jpg,image/png,image/webp"
      style="display: none"
      @change="handleFileSelection"
    />

    <!-- Información adicional -->
    <div class="upload-info">
      <p class="upload-hint">
        Formatos: JPG, PNG, WebP • Máximo: 5MB
      </p>
      <p v-if="user?.nombre" class="user-name">
        {{ user.nombre }}
      </p>
    </div>

    <!-- Mensajes de estado -->
    <Transition name="message">
      <div v-if="message" class="message" :class="messageType">
        <i class="message-icon">{{ messageIcon }}</i>
        {{ message }}
      </div>
    </Transition>

    <!-- Modal de confirmación para eliminar -->
    <Transition name="modal">
      <div v-if="showRemoveModal" class="modal-overlay" @click="cancelRemove">
        <div class="modal-content" @click.stop>
          <h3>¿Eliminar foto de perfil?</h3>
          <p>Esta acción no se puede deshacer.</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="cancelRemove">
              Cancelar
            </button>
            <button 
              class="btn btn-danger" 
              @click="removeProfilePicture"
              :disabled="isUploading"
            >
              {{ isUploading ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { User } from '../../types/api';
import { profileService } from '../../services/profileService';
import { useAuthStore } from '../../store/auth';

interface Props {
  user?: User | null;
  size?: number;
  autoUpdate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 150,
  autoUpdate: true
});

const emit = defineEmits<{
  uploaded: [url: string];
  removed: [];
  error: [error: string];
}>();

const authStore = useAuthStore();
const fileInput = ref<HTMLInputElement>();

// Estado del componente
const isUploading = ref(false);
const hasError = ref(false);
const message = ref('');
const messageType = ref<'success' | 'error' | 'info'>('info');
const uploadProgressText = ref('');
const showRemoveModal = ref(false);
const currentImagePreview = ref<string | null>(null);

// Usuario actual (props o store)
const user = computed(() => props.user || authStore.user);

// URL de imagen actual
const currentImageUrl = computed(() => {
  if (currentImagePreview.value) {
    return currentImagePreview.value;
  }
  
  if (user.value?.profile_picture_url) {
    return profileService.getFullImageUrl(user.value.profile_picture_url);
  }
  
  return '/default-avatar.png';
});

// Verificar si tiene foto de perfil
const hasProfilePicture = computed(() => {
  return !!(user.value?.profile_picture_url && !currentImagePreview.value);
});

// Icono del mensaje
const messageIcon = computed(() => {
  switch (messageType.value) {
    case 'success': return '✅';
    case 'error': return '❌';
    default: return 'ℹ️';
  }
});

// Limpiar preview cuando cambie el usuario
watch(() => user.value?.profile_picture_url, () => {
  currentImagePreview.value = null;
});

// Abrir selector de archivos
const openFileSelector = () => {
  if (isUploading.value) return;
  fileInput.value?.click();
};

// Manejar selección de archivo
const handleFileSelection = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  // Validar archivo
  const validation = profileService.validateImageFile(file);
  if (!validation.valid) {
    showMessage(validation.error!, 'error');
    return;
  }

  try {
    // Mostrar preview inmediato
    currentImagePreview.value = await profileService.createImagePreview(file);
    
    // Subir archivo
    await uploadFile(file);
  } catch (error: any) {
    showMessage(error.message || 'Error al procesar la imagen', 'error');
    currentImagePreview.value = null;
  } finally {
    // Limpiar input
    target.value = '';
  }
};

// Subir archivo
const uploadFile = async (file: File) => {
  isUploading.value = true;
  hasError.value = false;
  uploadProgressText.value = 'Subiendo foto...';

  try {
    const response = await profileService.uploadProfilePicture(file);
    
    // Actualizar usuario en el store si autoUpdate está habilitado
    if (props.autoUpdate && authStore.user) {
      authStore.updateUserProfile({
        ...authStore.user,
        profile_picture_url: response.profile_picture_url
      });
    }

    // Limpiar preview
    currentImagePreview.value = null;
    
    // Mostrar mensaje de éxito
    showMessage(response.message || 'Foto actualizada correctamente', 'success');
    
    // Emitir evento
    emit('uploaded', response.profile_picture_url);

  } catch (error: any) {
    hasError.value = true;
    showMessage(error.message || 'Error al subir la imagen', 'error');
    emit('error', error.message);
    
    // Revertir preview
    currentImagePreview.value = null;
  } finally {
    isUploading.value = false;
    uploadProgressText.value = '';
  }
};

// Confirmar eliminación
const confirmRemove = () => {
  showRemoveModal.value = true;
};

// Cancelar eliminación
const cancelRemove = () => {
  showRemoveModal.value = false;
};

// Eliminar foto de perfil
const removeProfilePicture = async () => {
  isUploading.value = true;
  uploadProgressText.value = 'Eliminando foto...';

  try {
    const response = await profileService.removeProfilePicture();
    
    // Actualizar usuario en el store si autoUpdate está habilitado
    if (props.autoUpdate && authStore.user) {
      authStore.updateUserProfile({
        ...authStore.user,
        profile_picture_url: null
      });
    }

    // Mostrar mensaje de éxito
    showMessage(response.message || 'Foto eliminada correctamente', 'success');
    
    // Emitir evento
    emit('removed');

    // Cerrar modal
    showRemoveModal.value = false;

  } catch (error: any) {
    showMessage(error.message || 'Error al eliminar la imagen', 'error');
    emit('error', error.message);
  } finally {
    isUploading.value = false;
    uploadProgressText.value = '';
  }
};

// Mostrar mensaje
const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
  message.value = text;
  messageType.value = type;
  
  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    message.value = '';
  }, 5000);
};
</script>

<style scoped>
.profile-picture-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 300px;
  margin: 0 auto;
}

.profile-picture-container {
  position: relative;
  width: v-bind("`${size}px`");
  height: v-bind("`${size}px`");
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.profile-picture-container:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.profile-picture-container.loading {
  pointer-events: none;
}

.profile-picture-container.error {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.profile-picture {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
  background-color: #f3f4f6;
}

.profile-picture-container:hover .profile-picture {
  transform: scale(1.05);
}

.profile-picture-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 12px;
  text-align: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile-picture-container:hover .profile-picture-overlay {
  opacity: 1;
}

.overlay-button {
  background: none;
  border: none;
  color: white;
  font-size: 11px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.overlay-button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.2);
}

.overlay-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.overlay-button.primary:hover:not(:disabled) {
  background-color: rgba(59, 130, 246, 0.8);
}

.overlay-button.danger:hover:not(:disabled) {
  background-color: rgba(239, 68, 68, 0.8);
}

.icon {
  font-size: 12px;
}

.upload-progress {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.upload-info {
  text-align: center;
}

.upload-hint {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 4px 0 0 0;
}

.message {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  text-align: center;
}

.message.success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.message.error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.message.info {
  background-color: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.message-icon {
  font-size: 16px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  max-width: 400px;
  width: 90vw;
  text-align: center;
}

.modal-content h3 {
  margin: 0 0 12px 0;
  color: #1f2937;
  font-size: 18px;
}

.modal-content p {
  margin: 0 0 20px 0;
  color: #6b7280;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Animaciones */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.message-enter-active, .message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from, .message-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Responsive */
@media (max-width: 768px) {
  .profile-picture-upload {
    max-width: 250px;
  }
  
  .overlay-button {
    font-size: 10px;
    padding: 3px 6px;
  }
  
  .icon {
    font-size: 10px;
  }
}

/* Tema oscuro */
@media (prefers-color-scheme: dark) {
  .user-name {
    color: #f9fafb;
  }
  
  .upload-hint {
    color: #9ca3af;
  }
  
  .modal-content {
    background: #1f2937;
  }
  
  .modal-content h3 {
    color: #f9fafb;
  }
  
  .modal-content p {
    color: #d1d5db;
  }
  
  .btn-secondary {
    background: #374151;
    color: #d1d5db;
    border-color: #4b5563;
  }
  
  .btn-secondary:hover {
    background: #4b5563;
  }
}
</style> 