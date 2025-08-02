import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

interface ThemeState {
  isDark: boolean;
  isSystem: boolean;
}

export const useThemeStore = defineStore('theme', () => {
  // Estado reactivo
  const isDark = ref(false);
  const isSystem = ref(true);

  // Obtener preferencia del sistema
  const getSystemPreference = (): boolean => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Aplicar tema al DOM
  const applyTheme = (dark: boolean) => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
    } else {
      html.classList.remove('dark');
      html.setAttribute('data-theme', 'light');
    }
  };

  // Inicializar tema
  const initializeTheme = () => {
    // Obtener tema guardado en localStorage
    const savedTheme = localStorage.getItem('theme');
    const savedSystem = localStorage.getItem('theme-system');
    
    if (savedSystem === 'false') {
      isSystem.value = false;
      isDark.value = savedTheme === 'dark';
    } else {
      isSystem.value = true;
      isDark.value = getSystemPreference();
    }
    
    applyTheme(isDark.value);
  };

  // Cambiar tema
  const toggleTheme = () => {
    isDark.value = !isDark.value;
    isSystem.value = false;
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
    localStorage.setItem('theme-system', 'false');
    applyTheme(isDark.value);
  };

  // Usar preferencia del sistema
  const useSystemTheme = () => {
    isSystem.value = true;
    isDark.value = getSystemPreference();
    localStorage.setItem('theme-system', 'true');
    localStorage.removeItem('theme');
    applyTheme(isDark.value);
  };

  // Escuchar cambios en la preferencia del sistema
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    if (isSystem.value) {
      isDark.value = e.matches;
      applyTheme(isDark.value);
    }
  });

  // Observar cambios en el tema
  watch(isDark, (newValue) => {
    applyTheme(newValue);
  });

  // Inicializar al crear el store
  initializeTheme();

  return {
    isDark,
    isSystem,
    toggleTheme,
    useSystemTheme,
    initializeTheme
  };
}); 