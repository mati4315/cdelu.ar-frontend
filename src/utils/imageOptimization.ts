/**
 * Utilidades para optimización de imágenes
 */

/**
 * Genera URLs de imágenes optimizadas según el tamaño requerido
 */
export function getOptimizedImageUrl(originalUrl: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
  if (!originalUrl) return '';
  
  // Si es una imagen de perfil, ajustar el tamaño
  if (originalUrl.includes('profile-pictures')) {
    const sizeMap = {
      small: '32x32',
      medium: '64x64', 
      large: '128x128'
    };
    
    // Si ya tiene un parámetro de tamaño, reemplazarlo
    if (originalUrl.includes('?size=') || originalUrl.includes('&size=')) {
      return originalUrl.replace(/([?&])size=[^&]*/, `$1size=${sizeMap[size]}`);
    }
    
    // Agregar parámetro de tamaño
    const separator = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}size=${sizeMap[size]}`;
  }
  
  return originalUrl;
}

/**
 * Genera srcset para imágenes responsive
 */
export function generateSrcSet(baseUrl: string): string {
  if (!baseUrl || !baseUrl.includes('profile-pictures')) return '';
  
  return [
    `${getOptimizedImageUrl(baseUrl, 'small')} 32w`,
    `${getOptimizedImageUrl(baseUrl, 'medium')} 64w`,
    `${getOptimizedImageUrl(baseUrl, 'large')} 128w`
  ].join(', ');
}

/**
 * Genera sizes attribute para imágenes responsive
 */
export function generateSizes(context: 'avatar' | 'thumbnail' | 'full'): string {
  switch (context) {
    case 'avatar':
      return '(max-width: 640px) 24px, 32px';
    case 'thumbnail':
      return '(max-width: 640px) 64px, 128px';
    case 'full':
      return '(max-width: 640px) 100vw, 50vw';
    default:
      return '32px';
  }
}

/**
 * Crea un elemento image con optimizaciones de carga
 */
export function createOptimizedImage(src: string, alt: string, size: 'small' | 'medium' | 'large' = 'medium'): HTMLImageElement {
  const img = new Image();
  
  // Configurar carga optimizada
  img.loading = 'lazy';
  img.decoding = 'async';
  
  // Configurar src y srcset optimizados
  img.src = getOptimizedImageUrl(src, size);
  img.srcset = generateSrcSet(src);
  img.sizes = generateSizes('avatar');
  img.alt = alt;
  
  return img;
}

/**
 * Preload de imágenes críticas
 */
export function preloadImage(src: string, size: 'small' | 'medium' | 'large' = 'medium'): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = getOptimizedImageUrl(src, size);
  
  // Agregar al head
  document.head.appendChild(link);
}
