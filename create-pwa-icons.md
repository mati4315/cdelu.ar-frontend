# Guía para Crear Iconos PWA

## Problema
El manifest.webmanifest referencia iconos que no existen:
- logo-192x192.png
- logo-512x512.png  
- logo-512x512-maskable.png

## Solución Rápida

### Opción 1: Usar herramientas online
1. Ve a https://realfavicongenerator.net/
2. Sube tu logo.png
3. Genera todos los tamaños necesarios
4. Descarga y coloca en la carpeta `public/`

### Opción 2: Usar ImageMagick (si tienes acceso)
```bash
# Desde logo.png crear los tamaños necesarios
convert public/logo.png -resize 192x192 public/logo-192x192.png
convert public/logo.png -resize 512x512 public/logo-512x512.png
convert public/logo.png -resize 512x512 public/logo-512x512-maskable.png
```

### Opción 3: Usar CSS para redimensionar temporalmente
Modifica vite.config.ts para usar el logo.png existente:

```typescript
icons: [
  {
    src: 'logo.png', // Usar el existente
    sizes: '192x192',
    type: 'image/png'
  },
  {
    src: 'logo.png', // Usar el existente  
    sizes: '512x512',
    type: 'image/png'
  }
]
```

## Archivos necesarios en public/
- favicon.ico ✅ (ya existe)
- logo.png ✅ (ya existe)
- logo-192x192.png ❌ (falta)
- logo-512x512.png ❌ (falta)
- logo-512x512-maskable.png ❌ (falta)
- apple-touch-icon.png ❌ (falta) 