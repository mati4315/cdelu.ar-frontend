import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import NewsDetailView from '@/views/NewsDetailView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import CreateComView from '@/views/com/CreateComView.vue';
import FeedItemDetailView from '@/views/FeedItemDetailView.vue';
import AdsDashboardView from '@/views/AdsDashboardView.vue';
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
    path: '/post/:type/:id',
    name: 'FeedItemDetail',
    component: FeedItemDetailView,
    props: true, // Para pasar type e id como props
  },
  {
    path: '/comunidad/:id',
    name: 'CommunityDetail', 
    component: FeedItemDetailView,
    props: (route) => ({ type: '2', id: route.params.id }), // Siempre tipo 2 para comunidad
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
  {
    path: '/comunicaciones/crear',
    name: 'CreateCom',
    component: CreateComView,
    meta: { requiresAuth: true } // Agregado: requiere autenticación
  },
  {
    path: '/publicidad',
    name: 'AdsDashboard',
    component: AdsDashboardView,
    meta: { requiresAuth: true }
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

// Guard de autenticación - CRÍTICO para seguridad
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  
  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirigir al login con la ruta original como parámetro
    next({ 
      name: 'Login', 
      query: { redirect: to.fullPath }
    });
    return;
  }
  
  // Si el usuario está autenticado y va al login, redirigir al home
  if (to.name === 'Login' && isAuthenticated) {
    next({ name: 'Home' });
    return;
  }
  
  // Continuar normalmente
  next();
});

export default router; 