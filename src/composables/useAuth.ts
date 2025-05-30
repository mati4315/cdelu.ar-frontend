import { computed } from 'vue';

export function useAuth() {
  // Obtener token desde localStorage
  const token = computed(() => localStorage.getItem('token'));
  
  // Verificar si está autenticado
  const isAuthenticated = computed(() => !!token.value);
  
  // Obtener información del usuario
  const user = computed(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });
  
  // Debug de autenticación
  const debugAuth = () => {
    console.log('🔍 [AUTH DEBUG] Estado de autenticación:');
    console.log('  - Token:', token.value ? `${token.value.substring(0, 20)}...` : 'NO TOKEN');
    console.log('  - Autenticado:', isAuthenticated.value);
    console.log('  - Usuario:', user.value);
    console.log('  - localStorage token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
    console.log('  - localStorage user:', localStorage.getItem('user') ? 'Presente' : 'Ausente');
  };
  
  return {
    token,
    isAuthenticated,
    user,
    debugAuth
  };
} 