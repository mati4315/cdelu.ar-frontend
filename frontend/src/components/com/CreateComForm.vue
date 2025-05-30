<template>
  <div class="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Crear Nueva Comunicación</h2>
    
    <form @submit.prevent="handleSubmit" ref="comFormRef" class="space-y-6">
      <div>
        <label for="titulo" class="block text-sm font-medium text-gray-700">Título</label>
        <input
          type="text"
          name="titulo"
          id="titulo"
          v-model="titulo"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label for="descripcion" class="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          name="descripcion"
          id="descripcion"
          v-model="descripcion"
          rows="4"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        ></textarea>
      </div>

      <div>
        <label for="image" class="block text-sm font-medium text-gray-700">Imágenes (opcional, máx. 6, cada una 10MB)</label>
        <input
          type="file"
          name="image"
          id="image"
          @change="handleImageChange"
          multiple
          accept="image/*"
          class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </div>
      <div v-if="imageFiles.length > 0" class="mt-2 space-y-1">
        <h4 class="text-xs font-medium text-gray-700">Imágenes seleccionadas:</h4>
        <ul class="list-disc list-inside pl-4">
          <li v-for="file in imageFiles" :key="file.name" class="text-xs text-gray-600">
            {{ file.name }} ({{ (file.size / 1024 / 1024).toFixed(2) }} MB)
          </li>
        </ul>
      </div>

      <div>
        <label for="video" class="block text-sm font-medium text-gray-700">Video (opcional, máx. 200MB)</label>
        <input
          type="file"
          name="video"
          id="video"
          @change="handleVideoChange"
          accept="video/*"
          class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </div>
       <div v-if="videoFile" class="mt-2">
        <h4 class="text-xs font-medium text-gray-700">Video seleccionado:</h4>
        <p class="text-xs text-gray-600">
          {{ videoFile.name }} ({{ (videoFile.size / 1024 / 1024).toFixed(2) }} MB)
        </p>
      </div>

      <div v-if="newsStore.isLoading" class="text-indigo-600">
        Creando comunicación...
      </div>
      
      <div v-if="successMessage" class="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage || fileErrorMessage" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
        <p v-if="errorMessage">Error: {{ errorMessage }}</p>
        <p v-if="fileErrorMessage">Error con archivos: {{ fileErrorMessage }}</p>
      </div>
       <div v-if="newsStore.error && !errorMessage && !fileErrorMessage" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
        Error del store: {{ newsStore.error }}
      </div>

      <div>
        <button
          type="submit"
          :disabled="newsStore.isLoading || !!fileErrorMessage"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {{ newsStore.isLoading ? 'Enviando...' : 'Crear Comunicación' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useNewsStore } from '@/store/news';

const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024; // 200MB
const MAX_IMAGES_COUNT = 6;
const MAX_IMAGE_SIZE_BYTES_PER_FILE = 10 * 1024 * 1024; // 10MB

const newsStore = useNewsStore();
const comFormRef = ref<HTMLFormElement | null>(null);

const titulo = ref('');
const descripcion = ref('');

const imageFiles = ref<File[]>([]);
const videoFile = ref<File | null>(null);

const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const fileErrorMessage = ref<string | null>(null);

function handleImageChange(event: Event) {
  const target = event.target as HTMLInputElement;
  fileErrorMessage.value = null; // Limpiar errores de archivo previos al cambiar la selección
  // No limpiamos imageFiles.value aquí para permitir la adición incremental si el input se usara así,
  // pero con type="file" multiple, cada "change" es una nueva selección completa.
  // Así que es mejor limpiar para reflejar la nueva selección.
  imageFiles.value = []; 

  if (target.files && target.files.length > 0) {
    // Ya no se comprueba si videoFile.value existe, se permiten ambos

    if (target.files.length > MAX_IMAGES_COUNT) {
      fileErrorMessage.value = `No puede seleccionar más de ${MAX_IMAGES_COUNT} imágenes.`;
      target.value = ''; // Resetear input
      return;
    }
    const currentImages: File[] = [];
    for (const file of Array.from(target.files)) {
      if (file.size > MAX_IMAGE_SIZE_BYTES_PER_FILE) {
        fileErrorMessage.value = `La imagen ${file.name} excede el tamaño máximo de 10MB.`;
        target.value = ''; 
        imageFiles.value = []; 
        return;
      }
      currentImages.push(file);
    }
    imageFiles.value = currentImages;
  } 
  // Si no se seleccionan archivos, imageFiles.value ya está vacío o se vacía
}

function handleVideoChange(event: Event) {
  const target = event.target as HTMLInputElement;
  fileErrorMessage.value = null; // Limpiar errores de archivo previos
  videoFile.value = null;

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
</style> 