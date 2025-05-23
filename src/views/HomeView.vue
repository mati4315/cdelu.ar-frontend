<template>
  <div class="home-view">
    <NewsList />
  </div>
</template>

<script setup lang="ts">
import NewsList from '@/components/news/NewsList.vue';
</script>

<style scoped>
/* Estilos específicos para la HomeView si son necesarios */
.home-view {
  /* El padding-top general para compensar el header fijo 
     se maneja mejor en App.vue o en el layout principal,
     o directamente en los componentes como NewsList si es específico.*/
  /* Por ejemplo, NewsList ya tiene un padding-top. */
}
</style> 