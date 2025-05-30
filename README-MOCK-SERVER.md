# 🚀 Servidor Mock para Desarrollo

Este servidor mock simula las APIs del backend para que puedas desarrollar y probar el frontend sin necesidad de un backend real.

## 🏃‍♂️ Inicio Rápido

### Opción 1: Script Automático (Windows)
```bash
# Ejecuta el archivo .bat
start-mock-server.bat
```

### Opción 2: Manual
```bash
# Instalar dependencias
npm install express cors nodemon

# Ejecutar servidor
node mock-server.js
```

## 📡 Endpoints Disponibles

El servidor mock corre en `http://localhost:3001` y proporciona:

### Feed Unificado
- `GET /api/v1/feed` - Todo el contenido (noticias + comunidad)
- `GET /api/v1/feed/noticias` - Solo noticias
- `GET /api/v1/feed/comunidad` - Solo posts de comunidad
- `GET /api/v1/feed/stats` - Estadísticas del feed
- `POST /api/v1/feed/:id/like` - Toggle like en un item
- `GET /api/v1/feed/:type/:id` - Item específico

### Legacy (Compatibilidad)
- `GET /api/v1/news` - API anterior de noticias

## 📊 Datos Mock

El servidor genera automáticamente:
- **50 noticias** con IDs 1-50 (type: 1)
- **30 posts de comunidad** con IDs 51-80 (type: 2)
- Imágenes aleatorias de Picsum
- Fechas realistas
- Contadores de likes y comentarios
- Estados de "me gusta" aleatorios

## 🔧 Características

- **CORS habilitado** para desarrollo local
- **Paginación completa** con metadata
- **Delay simulado** para probar estados de carga
- **Logs detallados** para debugging
- **Toggle de likes funcional**
- **Ordenación por fecha**

## 🛠️ Desarrollo

Para modificar los datos mock, edita el archivo `mock-server.js`:

```javascript
// Cambiar cantidad de noticias
const mockNews = Array.from({ length: 100 }, (_, i) => ({
  // ...
}));

// Cambiar delay de respuesta
setTimeout(() => {
  res.json(result);
}, 1000); // 1 segundo
```

## 🔄 Reiniciar Servidor

Si haces cambios en `mock-server.js`, reinicia el servidor:
1. Presiona `Ctrl+C` en la terminal
2. Ejecuta `node mock-server.js` nuevamente

## 🐛 Troubleshooting

### Puerto ocupado
Si el puerto 3001 está ocupado:
```bash
# Cambiar puerto en mock-server.js
const PORT = 3002; // o cualquier otro puerto
```

### CORS errors
El servidor ya tiene CORS habilitado. Si sigues teniendo problemas:
1. Verifica que el servidor esté corriendo
2. Revisa la URL en `feedService.ts`
3. Asegúrate de que no haya otro servidor en el puerto 3001

### Datos no aparecen
1. Verifica que el servidor esté corriendo en `http://localhost:3001`
2. Abre las DevTools y revisa la pestaña Network
3. Verifica que las URLs coincidan con las del frontend 