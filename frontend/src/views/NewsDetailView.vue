<template>
  <div class="news-detail-view">
    <NewsDetail :id="Array.isArray($route.params.id) ? $route.params.id[0] : $route.params.id" />
  </div>
</template>

<script setup lang="ts">
import NewsDetail from '@/components/news/NewsDetail.vue';

// El ID se pasa como prop al componente NewsDetail gracias a `props: true` en la definición de la ruta.
// No es necesario definir props aquí si $route.params.id se usa directamente en el template.
// Sin embargo, si quisieras acceder al ID en el script de NewsDetailView, lo harías así:
// import { useRoute } from 'vue-router';
// const route = useRoute();
// const newsId = computed(() => route.params.id);
</script>

<style scoped>
/* Estilos específicos para la NewsDetailView si son necesarios */
.news-detail-view {
  /* padding-top para compensar el header fijo ya lo maneja NewsDetail.vue */
}
</style> 