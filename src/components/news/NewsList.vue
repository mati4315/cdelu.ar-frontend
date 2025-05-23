<template>
  <div class="news-list container mx-auto py-8 px-4">
    <div v-if="newsStore.isLoading" class="text-center">
      <p>Cargando noticias...</p> <!-- Podrías usar un spinner aquí -->
    </div>
    <div v-else-if="newsStore.error" class="text-center text-red-500">
      <p>Error al cargar noticias: {{ newsStore.error }}</p>
    </div>
    <div v-else-if="newsStore.newsList.length === 0" class="text-center">
      <p>No hay noticias disponibles.</p>
    </div>
    <div v-else class="grid grid-cols-1 gap-6">
      <NewsItem 
        v-for="noticia in newsStore.newsList" 
        :key="noticia.id" 
        :noticia="noticia"
      />
    </div>
    <!-- Aquí podrías agregar paginación si es necesario -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useNewsStore } from '@/store/news';
import NewsItem from './NewsItem.vue';

const newsStore = useNewsStore();

onMounted(() => {
  // Cargar noticias si no están ya cargadas o si se necesita refrescar
  if (newsStore.newsList.length === 0) {
    newsStore.fetchNoticias();
  }
});
</script>

<style scoped>
.news-list {
  padding-top: 80px; /* Ajustar según la altura del header fijo */
}
</style> 