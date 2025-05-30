import { useRouter } from 'vue-router';
import { useNotifications } from '@/composables/useNotifications';

export function useTokenValidation() {
  const router = useRouter();
  const notifications = useNotifications();

  // Verificar si un token JWT está expirado
  function isTokenExpired(token: string): boolean {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      
      // Verificar si el token ha expirado
      if (payload.exp && payload.exp < now) {
        console.log('🚨 [TOKEN VALIDATION] Token expirado:', {
          exp: payload.exp,
          now: now,
          diff: now - payload.exp
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('🚨 [TOKEN VALIDATION] Error al validar token:', error);
      return true;
    }
  }

  // Verificar token actual del usuario
  function validateCurrentToken(): boolean {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('🚨 [TOKEN VALIDATION] No hay token en localStorage');
      return false;
    }

    if (isTokenExpired(token)) {
      console.log('🚨 [TOKEN VALIDATION] Token actual expirado, limpiando sesión');
      handleExpiredSession();
      return false;
    }

    return true;
  }

  // Manejar sesión expirada
  function handleExpiredSession() {
    console.log('🧹 [TOKEN VALIDATION] Limpiando sesión expirada');
    
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Notificar al usuario
    notifications.warning(
      'Sesión expirada',
      'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
    );
    
    // Redirigir a login después de un breve delay
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  }

  // Verificar antes de hacer requests importantes
  function ensureValidToken(): boolean {
    const isValid = validateCurrentToken();
    
    if (!isValid) {
      console.log('❌ [TOKEN VALIDATION] Token inválido, operación cancelada');
      return false;
    }
    
    return true;
  }

  return {
    isTokenExpired,
    validateCurrentToken,
    handleExpiredSession,
    ensureValidToken
  };
} 