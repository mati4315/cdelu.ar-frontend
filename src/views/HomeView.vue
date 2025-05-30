<template>
  <div class="home-view relative min-h-screen pb-16 pt-20">
    <FeedMain />
    <router-link
      to="/comunicaciones/crear"
      class="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-700 text-white font-bold p-4 rounded-full shadow-lg transition-transform duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 z-40"
      aria-label="Crear nueva publicación"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import FeedMain from '@/components/feed/FeedMain.vue';
</script>

<style scoped>
.home-view {
  padding-top: 5rem;
}

@media (max-width: 640px) {
  .home-view {
    padding-top: 4.5rem;
  }
}

.home-view {
  transition: padding-top 0.3s ease-in-out;
}
</style> 