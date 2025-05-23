import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import NewsDetailView from '@/views/NewsDetailView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
// Importa otras vistas según sea necesario, por ejemplo, LoginView, RegisterView

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/noticia/:id',
    name: 'NewsDetail',
    component: NewsDetailView,
    props: true, // Para pasar el :id como prop al componente
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
  },
  // Agrega aquí más rutas según tu documentación (Dashboard, Profile, etc.)
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      };
    }
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 }; // Scroll al tope por defecto en cambio de ruta
  },
});

export default router; 