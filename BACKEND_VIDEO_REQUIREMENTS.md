# 🎥 REQUERIMIENTOS BACKEND - VIDEO ONLINE GLOBAL

> **📋 Nuevo endpoint requerido para el sistema de video global**  
> Fecha: 29 de Septiembre, 2025

## 🚨 PROBLEMA SOLUCIONADO

Anteriormente, el sistema de video solo se inicializaba para administradores, pero esto causaba que **los usuarios normales no pudieran ver el estado global del video**. 

**Problema anterior:**
- Admin desactiva video → Solo el admin ve que está desactivado  
- Usuarios normales → Siguen viendo el video porque no cargan la configuración
- **Resultado**: Video no se oculta globalmente 

## ✅ SOLUCIÓN IMPLEMENTADA

**Frontend ya modificado** para cargar configuración de video para **todos los usuarios**:
- **Administradores**: Usan endpoint existente `/admin/video-settings` (con JWT)
- **Usuarios normales**: Necesitan nuevo endpoint público `/video-settings/public` (sin JWT)

## 🔧 NUEVO ENDPOINT REQUERIDO

### **GET /api/v1/video-settings/public**

**Descripción:** Endpoint público para obtener configuración de video sin autenticación

**Características:**
- ✅ **Sin autenticación**: No requiere JWT token
- ✅ **Solo lectura**: Solo retorna configuración actual
- ✅ **Misma estructura**: Idéntica respuesta que endpoint de admin

**Request:**
```http
GET /api/v1/video-settings/public
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "isVideoEnabled": false,
  "lastModified": "2025-09-29T14:30:00.000Z",
  "modifiedBy": "Admin Juan"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Video settings not found"
}
```

## 🗄️ IMPLEMENTACIÓN EN BACKEND

### **1. Ruta Express**
```javascript
// En tu archivo de rutas (routes/video.js o similar)
router.get('/video-settings/public', async (req, res) => {
  try {
    // Obtener configuración desde base de datos (misma lógica que admin)
    const settings = await VideoSettings.findOne();
    
    if (!settings) {
      return res.status(404).json({ error: 'Video settings not found' });
    }
    
    res.json({
      isVideoEnabled: settings.isVideoEnabled,
      lastModified: settings.lastModified,
      modifiedBy: settings.modifiedBy
    });
    
  } catch (error) {
    console.error('Error obteniendo configuración pública de video:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### **2. Controlador**
```javascript
// controllers/videoController.js
exports.getPublicVideoSettings = async (req, res) => {
  try {
    const settings = await VideoSettings.findOne();
    
    if (!settings) {
      // Si no existe configuración, devolver valores por defecto
      return res.json({
        isVideoEnabled: true,
        lastModified: new Date().toISOString(),
        modifiedBy: 'Sistema'
      });
    }
    
    res.json({
      isVideoEnabled: settings.isVideoEnabled,
      lastModified: settings.lastModified,
      modifiedBy: settings.modifiedBy
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error obteniendo configuración de video' });
  }
};
```

### **3. Tabla Base de Datos**

**La tabla `admin_settings` ya existe**, solo necesitas exponer los datos:

```sql
-- Verificar estructura existente
SELECT * FROM admin_settings WHERE setting_key = 'video_enabled';

-- Si no existe, crear registro por defecto
INSERT INTO admin_settings (setting_key, setting_value, modified_by, modified_at) 
VALUES ('video_enabled', 'true', 'Sistema', NOW());
```

## 🔄 FLUJO COMPLETO

### **1. Usuario normal accede a la web:**
```
1. AppHeader.vue se monta
2. videoStore.initializeVideoStore() se ejecuta  
3. videoService.validateAdminAccess() falla
4. Se ejecuta loadPublicVideoSettings()
5. Llama a GET /video-settings/public
6. Obtiene configuración global
7. shouldLoadVideo() retorna true/false
8. Componentes de video se renderizan o no
```

### **2. Admin cambia configuración:**
```  
1. Admin hace toggle en header
2. PUT /admin/video-settings (endpoint existente)
3. Base de datos se actualiza
4. Próxima vez que usuario normal recarga:
   - GET /video-settings/public retorna nuevo estado
   - Video se oculta/muestra globalmente
```

## 🎯 COMPORTAMIENTO ESPERADO

**✅ Estado actual con nuevo endpoint:**
- Admin desactiva video → `isVideoEnabled: false` en BD
- Usuario normal recarga → GET `/video-settings/public` → `{ isVideoEnabled: false }`
- `shouldLoadVideo()` retorna `false` 
- Componentes `InlineLivePlayer` e `InlineLiveComments` NO se renderizan
- **Resultado**: Video oculto globalmente para todos

**✅ Estado actual sin nuevo endpoint:**
- Frontend usa fallback a localStorage  
- Si admin cambió configuración, localStorage se sincroniza
- Funcionalidad mantiene consistencia global

## 🚀 IMPLEMENTACIÓN INMEDIATA

**1. Crear el endpoint:**
```bash
# En tu backend
touch routes/video-public.js
# Agregar el endpoint GET /video-settings/public
```

**2. Registrar la ruta:**
```javascript
// app.js o index.js
app.use('/api/v1', require('./routes/video-public'));
```

**3. Testear:**
```bash
curl http://localhost:3001/api/v1/video-settings/public
```

## ✅ VERIFICACIÓN

**Frontend ya está listo**. Cuando implementes el endpoint, automáticamente:

1. **Admin puede controlar**: Switch en menú funcional ✅
2. **Configuración persiste**: Backend + localStorage ✅  
3. **Usuarios ven estado**: Endpoint público carga configuración ✅
4. **Video se oculta globalmente**: `shouldLoadVideo()` controla renderizado ✅

**¡El sistema estará 100% funcional con este único endpoint!** 🎥✨

---

> **📋 RESUMEN:** Solo necesitas implementar `GET /api/v1/video-settings/public` que retorne la misma configuración que el endpoint de admin, pero sin autenticación.
