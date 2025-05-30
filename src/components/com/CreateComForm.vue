<template>
  <div class="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
    <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Crear Nueva Comunicación</h2>
    
    <form @submit.prevent="handleSubmit" ref="comFormRef" class="space-y-6">
      <div>
        <label for="titulo" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
        <input
          type="text"
          name="titulo"
          id="titulo"
          v-model="titulo"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
        />
      </div>

      <div>
        <label for="descripcion" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
        <textarea
          name="descripcion"
          id="descripcion"
          v-model="descripcion"
          rows="4"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
        ></textarea>
      </div>

      <div>
        <label for="image" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Imágenes (opcional, máx. 6, cada una 10MB)</label>
        <input
          type="file"
          name="image"
          id="image"
          @change="handleImageChange"
          multiple
          accept="image/*"
          ref="imageInputRef" 
          class="mt-1 block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-700 file:text-indigo-700 dark:file:text-indigo-100 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-600 transition-colors duration-150"
        />
      </div>
      <!-- Previsualización de imágenes -->
      <div v-if="imagePreviews.length > 0" class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div v-for="(preview, index) in imagePreviews" :key="index" class="relative group bg-gray-100 dark:bg-gray-700 p-1 rounded-md shadow">
          <img :src="preview.url" :alt="'Previsualización ' + (index + 1)" class="w-full h-32 object-cover rounded-md " />
          <button
            @click="removeImage(index)"
            type="button"
            class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 text-xs opacity-80 group-hover:opacity-100 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md"
            aria-label="Eliminar imagen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div class="absolute bottom-1 left-1 right-1 bg-black bg-opacity-60 text-white text-xs p-1.5 truncate rounded-b-md">
            {{ preview.name }}
          </div>
        </div>
      </div>
      <div v-if="imageFiles.length > 0 && imagePreviews.length === 0" class="mt-2 space-y-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
        <h4 class="text-xs font-medium text-gray-700 dark:text-gray-300">Imágenes seleccionadas:</h4>
        <ul class="list-disc list-inside pl-4">
          <li v-for="file in imageFiles" :key="file.name" class="text-xs text-gray-600 dark:text-gray-400">
            {{ file.name }} ({{ (file.size / 1024 / 1024).toFixed(2) }} MB)
          </li>
        </ul>
      </div>

      <div>
        <label for="video" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Video (opcional, máx. 200MB)</label>
        <input
          type="file"
          name="video"
          id="video"
          @change="handleVideoChange"
          accept="video/*"
          class="mt-1 block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-700 file:text-indigo-700 dark:file:text-indigo-100 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-600 transition-colors duration-150"
        />
      </div>
       <div v-if="videoFile" class="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
        <h4 class="text-xs font-medium text-gray-700 dark:text-gray-300">Video seleccionado:</h4>
        <p class="text-xs text-gray-600 dark:text-gray-400">
          {{ videoFile.name }} ({{ (videoFile.size / 1024 / 1024).toFixed(2) }} MB)
        </p>
      </div>

      <!-- Progreso de Subida -->
      <div v-if="isUploading" class="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-sm">
        <h4 class="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">Subiendo archivos...</h4>
        <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
          <div class="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-300 ease-out" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 text-right">
          {{ uploadProgress }}%
          <span v-if="uploadTotalBytes && uploadTotalBytes > 0">
            ({{ (uploadLoadedBytes / 1024 / 1024).toFixed(2) }} MB / {{ (uploadTotalBytes / 1024 / 1024).toFixed(2) }} MB)
          </span>
          <span v-else-if="uploadLoadedBytes > 0">
            ({{ (uploadLoadedBytes / 1024 / 1024).toFixed(2) }} MB cargados)
          </span>
        </p>
        <p v-if="estimatedTimeLeft !== null && estimatedTimeLeft !== Infinity" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Tiempo restante estimado: {{ formatTime(estimatedTimeLeft) }}
        </p>
      </div>

      <div v-if="isLoading && !isUploading" class="text-indigo-600 dark:text-indigo-400">
        Procesando comunicación...
      </div>
      
      <div v-if="successMessage" class="p-4 mb-4 text-sm text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-800 dark:bg-opacity-30 rounded-lg shadow" role="alert">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage || fileErrorMessage" class="p-4 mb-4 text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-800 dark:bg-opacity-30 rounded-lg shadow" role="alert">
        <p v-if="errorMessage">Error: {{ errorMessage }}</p>
        <p v-if="fileErrorMessage">Error con archivos: {{ fileErrorMessage }}</p>
      </div>
       <div v-if="storeError && !errorMessage && !fileErrorMessage" class="p-4 mb-4 text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-800 dark:bg-opacity-30 rounded-lg shadow" role="alert">
        Error del store: {{ storeError }}
      </div>

      <div>
        <button
          type="submit"
          :disabled="isLoading || !!fileErrorMessage || isUploading"
          class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:opacity-60 transition-colors duration-150"
        >
          {{ isUploading ? `Subiendo... ${uploadProgress}%` : (isLoading ? 'Procesando...' : 'Crear Comunicación') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useNewsStore } from '@/store/news';
import { storeToRefs } from 'pinia';

const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024; // 200MB
const MAX_IMAGES_COUNT = 6;
const MAX_IMAGE_SIZE_BYTES_PER_FILE = 10 * 1024 * 1024; // 10MB

const newsStore = useNewsStore();
const comFormRef = ref<HTMLFormElement | null>(null);
const imageInputRef = ref<HTMLInputElement | null>(null); // Referencia para el input de imágenes

// Obtener referencias reactivas del estado del store
const { uploadProgress, isUploading, uploadLoadedBytes, uploadTotalBytes, error: storeError, isLoading } = storeToRefs(newsStore);

const titulo = ref('');
const descripcion = ref('');

interface ImagePreview {
  url: string;
  name: string;
  file: File; // Guardamos el archivo original para poder removerlo de imageFiles
}
const imageFiles = ref<File[]>([]);
const imagePreviews = ref<ImagePreview[]>([]);
const videoFile = ref<File | null>(null);

const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const fileErrorMessage = ref<string | null>(null);

// Estimación de tiempo restante
const previousLoadedBytes = ref(0);
const previousTime = ref(Date.now());
const uploadSpeed = ref(0); // bytes per second

watch([uploadLoadedBytes, uploadTotalBytes], ([loaded, total]) => {
  const currentTime = Date.now();
  const timeDiff = (currentTime - previousTime.value) / 1000; // seconds
  const bytesDiff = loaded - previousLoadedBytes.value;

  if (timeDiff > 0 && bytesDiff > 0) {
    uploadSpeed.value = bytesDiff / timeDiff;
  } else if (loaded === 0) {
    uploadSpeed.value = 0; // Reset speed if upload hasn't started or restarted
  }
  // If uploadSpeed is 0 (e.g., at the very start or if stalled), estimatedTimeLeft will be Infinity or NaN
  // which is handled in the template.

  previousLoadedBytes.value = loaded;
  previousTime.value = currentTime;
}, { immediate: false }); // `immediate: false` para que no se ejecute al inicio con valores 0


const estimatedTimeLeft = computed(() => {
  if (!uploadTotalBytes.value || uploadTotalBytes.value === 0 || uploadSpeed.value === 0) {
    return null; // O Infinity, dependiendo de cómo quieras manejarlo
  }
  const remainingBytes = uploadTotalBytes.value - uploadLoadedBytes.value;
  if (remainingBytes <= 0) return 0; // Completado
  return remainingBytes / uploadSpeed.value; // en segundos
});

function formatTime(seconds: number | null): string {
  if (seconds === null || seconds === Infinity || isNaN(seconds) || seconds < 0) {
    return 'calculando...';
  }
  if (seconds === 0) return '0s';

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  let timeString = '';
  if (h > 0) timeString += `${h}h `;
  if (m > 0) timeString += `${m}m `;
  if (s >= 0) timeString += `${s}s`; // Mostrar segundos incluso si es 0 si no hay h o m
  
  return timeString.trim() || '0s';
}

function handleImageChange(event: Event) {
  const target = event.target as HTMLInputElement;
  // No limpiar errores de archivo previos aquí directamente,
  // se manejarán en base a la nueva selección total.
  // fileErrorMessage.value = null; 

  // No limpiar imageFiles.value ni imagePreviews.value para permitir selección aditiva
  // imageFiles.value = [];
  // imagePreviews.value = [];

  if (target.files && target.files.length > 0) {
    const newFiles: File[] = Array.from(target.files);
    let potentialTotalFiles = imageFiles.value.length + newFiles.length;

    if (potentialTotalFiles > MAX_IMAGES_COUNT) {
      fileErrorMessage.value = `No puede seleccionar más de ${MAX_IMAGES_COUNT} imágenes en total. Ya tiene ${imageFiles.value.length}. Intentó añadir ${newFiles.length}.`;
      if (imageInputRef.value) imageInputRef.value.value = ''; // Resetear el input para permitir nueva selección corregida
      return;
    }

    const newlyAddedPreviews: ImagePreview[] = [];
    const newlyAddedFiles: File[] = [];

    for (const file of newFiles) {
      if (file.size > MAX_IMAGE_SIZE_BYTES_PER_FILE) {
        fileErrorMessage.value = `La imagen ${file.name} excede el tamaño máximo de 10MB y no será añadida.`;
        // No reseteamos todo, solo omitimos este archivo y continuamos con los demás válidos de esta selección.
        // Si quieres un comportamiento más estricto (cancelar toda la nueva selección si uno falla), puedes cambiarlo aquí.
        continue; 
      }
      newlyAddedPreviews.push({
        url: URL.createObjectURL(file),
        name: file.name,
        file: file
      });
      newlyAddedFiles.push(file);
    }
    
    // Añadir los nuevos archivos y previsualizaciones válidos a los existentes
    imageFiles.value.push(...newlyAddedFiles);
    imagePreviews.value.push(...newlyAddedPreviews);

    // Limpiar el mensaje de error si después de añadir y omitir inválidos, todo está bien.
    if (newlyAddedFiles.length === newFiles.length) { // Solo si todos los nuevos archivos fueron válidos
        fileErrorMessage.value = null;
    }
  }
  // Es importante resetear el valor del input de archivo para permitir seleccionar el mismo archivo nuevamente si fue removido
  // o si el usuario quiere volver a gatillar el evento change con la misma selección (aunque esto último es menos común con aditiva)
  if (imageInputRef.value) {
    imageInputRef.value.value = '';
  }
}

function removeImage(indexToRemove: number) {
  if (!imagePreviews.value[indexToRemove]) return;

  // Revocar la URL del objeto para liberar memoria
  URL.revokeObjectURL(imagePreviews.value[indexToRemove].url);

  // Remover de imagePreviews
  imagePreviews.value.splice(indexToRemove, 1);
  
  // Remover el archivo correspondiente de imageFiles
  // Esto es importante porque imageFiles es lo que se envía al backend
  imageFiles.value.splice(indexToRemove, 1);

  // Si se eliminan todas las imágenes, es buena idea resetear el input de archivos
  // para que el usuario pueda volver a seleccionar los mismos archivos si quisiera.
  if (imageFiles.value.length === 0 && imageInputRef.value) {
    imageInputRef.value.value = '';
  }
  // Si después de eliminar no hay errores y antes había uno por exceso, limpiarlo.
  if (imageFiles.value.length <= MAX_IMAGES_COUNT && fileErrorMessage.value?.includes("No puede seleccionar más de")) {
      fileErrorMessage.value = null;
  }
}

function handleVideoChange(event: Event) {
  const target = event.target as HTMLInputElement;
  fileErrorMessage.value = null; // Limpiar errores de archivo previos
  videoFile.value = null;
  imageFiles.value = [];
  imagePreviews.value = []; // Limpiar previsualizaciones

  if (target.files && target.files[0]) {
    // Ya no se comprueba si imageFiles.value.length > 0, se permiten ambos

    const file = target.files[0];
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      fileErrorMessage.value = `El video ${file.name} excede el tamaño máximo de 200MB.`;
      target.value = ''; // Resetear input
      return;
    }
    videoFile.value = file;
  } 
  // Si no se selecciona archivo, videoFile.value ya es null o se establece en null
}

async function handleSubmit() {
  successMessage.value = null;
  errorMessage.value = null;
  // fileErrorMessage se actualiza en los handlers, pero un chequeo final es bueno

  // Limpiar error del store antes de un nuevo intento
  if (newsStore.error) {
    newsStore.error = null;
  }

  if (!titulo.value || !descripcion.value) {
    errorMessage.value = 'Título y descripción son requeridos.';
    return;
  }

  // Si hay un error de validación de archivos de los handlers, no continuar.
  if (fileErrorMessage.value) { 
    return;
  }

  // Ya no hay error si ambos están seleccionados, el backend debe manejarlo.
  // if (videoFile.value && imageFiles.value.length > 0) {
  //   fileErrorMessage.value = "Error interno: Video e imágenes seleccionados. Por favor, corrija la selección.";
  //   return;
  // }

  const formData = new FormData();
  formData.append('titulo', titulo.value);
  formData.append('descripcion', descripcion.value);

  if (videoFile.value) {
    formData.append('video', videoFile.value);
  }
  // Ahora se pueden añadir imágenes incluso si hay un video
  if (imageFiles.value.length > 0) {
    imageFiles.value.forEach(imgFile => {
      formData.append('image', imgFile);
    });
  }
  // Si no hay archivos, se envían solo título y descripción.

  try {
    newsStore.isLoading = true;
    const nuevaComunicacion = await newsStore.crearComunicacion(formData);
    let successDetails = [];
    if (nuevaComunicacion.video_url) {
      successDetails.push("Video subido");
    }
    if (nuevaComunicacion.image_urls && nuevaComunicacion.image_urls.length > 0) {
      successDetails.push(`${nuevaComunicacion.image_urls.length} imágen(es) subida(s)`);
    }

    let fileSuccessMessage = successDetails.join(' y ');
    if (fileSuccessMessage) fileSuccessMessage = ` (${fileSuccessMessage})`;

    successMessage.value = `¡Comunicación creada con éxito! ID: ${nuevaComunicacion.id}, Título: ${nuevaComunicacion.titulo}${fileSuccessMessage}`;
    
    titulo.value = '';
    descripcion.value = '';
    videoFile.value = null;
    imageFiles.value = [];
    imagePreviews.value = [];
    fileErrorMessage.value = null; // Limpiar también en éxito
    if (comFormRef.value) {
      comFormRef.value.reset(); 
    }

  } catch (error: any) {
    // Si el error viene del store (que a su vez puede ser del API), se mostrará allí.
    // Pero si el error de newsStore.crearComunicacion ya tiene un mensaje específico,
    // ese se mostrará en newsStore.error.
    // Si no, mostramos un genérico.
    if (error.message) {
        errorMessage.value = error.message;
    } else if (newsStore.error) {
        errorMessage.value = newsStore.error; // En caso de que el store ya lo haya capturado
    } else {
        errorMessage.value = 'Ocurrió un error al crear la comunicación.';
    }
    console.error('Error al crear comunicación:', error);
  } finally {
    newsStore.isLoading = false;
  }
}
</script>

<style scoped>
/* Puedes añadir estilos específicos aquí si Tailwind no es suficiente */
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style> 