import { defineStore } from 'pinia';
import { User, LoginPayload, RegisterPayload } from '@/types/api';
import { apiService } from '@/services/apiService';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
    isLoading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.rol === 'administrador',
    isColaborador: (state) => state.user?.rol === 'colaborador',
    userRole: (state) => state.user?.rol,
  },
  actions: {
    async login(payload: LoginPayload) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiService.login(payload);
        this.user = response.user;
        this.token = response.token;
        localStorage.setItem('user', JSON.stringify(response.user));
        // apiService.setToken ya guarda el token en localStorage
      } catch (e: any) {
        this.error = e.message || 'Error al iniciar sesión';
        throw e;
      } finally {
        this.isLoading = false;
      }
    },
    async register(payload: RegisterPayload) {
      this.isLoading = true;
      this.error = null;
      try {
        // La API de registro no devuelve el token, solo el usuario creado.
        // El usuario deberá iniciar sesión después de registrarse.
        await apiService.register(payload);
      } catch (e: any) {
        this.error = e.message || 'Error al registrar usuario';
        throw e;
      } finally {
        this.isLoading = false;
      }
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      apiService.clearToken();
      // Podrías querer redirigir al login aquí
      // router.push('/login');
    },
    // Acción para cargar el estado inicial desde localStorage si es necesario,
    // aunque el state inicial ya lo hace.
    // initializeAuth() {
    //   const storedUser = localStorage.getItem('user');
    //   const storedToken = localStorage.getItem('token');
    //   if (storedUser && storedToken) {
    //     this.user = JSON.parse(storedUser);
    //     this.token = storedToken;
    //     apiService.setToken(storedToken); // Asegurar que el servicio API tiene el token
    //   }
    // }
  },
}); 