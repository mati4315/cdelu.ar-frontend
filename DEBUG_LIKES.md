# 🐛 Debug de Likes - Guía de Resolución

## ✅ Correcciones Implementadas

### 1. **Frontend Mejorado**
- ✅ `formatNumber()` ya no se rompe con valores `undefined`
- ✅ `toggleLike()` maneja respuestas incompletas del backend
- ✅ Token se sincroniza automáticamente desde localStorage
- ✅ Logging detallado para debugging
- ✅ Verificación de autenticación antes de hacer like

### 2. **Debugging Automático**
- ✅ Log del token en cada request
- ✅ Validación de estructura de respuesta
- ✅ Fallbacks para respuestas incompletas

## 🔍 Pasos para Debuggear

### **Paso 1: Verificar el Frontend**
1. Abre el navegador en `http://localhost:5174`
2. Abre DevTools (F12)
3. Ve a la pestaña **Console**
4. Haz clic en un botón de ❤️ (like)
5. Observa los logs en la consola

### **Paso 2: Analizar los Logs**
Deberías ver algo como:
```
❤️ [FEEDITEM] Intentando dar like - feedId: 59
🔍 [AUTH DEBUG] Estado de autenticación:
  - Token: eyJhbGciOiJIUzI1NiIs... (o NO TOKEN)
  - Autenticado: true/false
  - Usuario: {objeto user o null}
🔑 [FEED SERVICE] Using token: eyJhbGciOiJIUzI1NiIs...
📝 [FEED STORE] Raw backend response: {objeto respuesta}
```

### **Paso 3: Casos Posibles**

#### 🔒 **Caso 1: No Token (401 Unauthorized)**
```
⚠️ [FEED SERVICE] No token available for request
POST http://localhost:3001/api/v1/feed/59/like 401
```
**Solución:** Necesitas hacer login
1. Ve a la página de login
2. Ingresa credenciales válidas
3. Prueba like nuevamente

#### 🔧 **Caso 2: Backend 400 (Bad Request)**
```
POST http://localhost:3001/api/v1/feed/59/like 400
📊 [FEED SERVICE] Error response data: {error details}
```
**Solución:** Problema en el backend
- Revisa que el endpoint `/feed/59/like` exista
- Verifica que acepta el método POST
- Confirma la estructura esperada

#### 📋 **Caso 3: Respuesta Incompleta pero 200 OK**
```
✅ [FEED SERVICE] toggleLike response: {message: 'Like agregado'}
⚠️ [FEED STORE] Backend response missing likes_count
```
**Solución:** Backend funciona pero respuesta incompleta
- El frontend usará fallbacks automáticos
- Los contadores se estimarán

#### 🔍 **Caso 4: Endpoint No Existe (404)**
```
POST http://localhost:3001/api/v1/feed/59/like 404
```
**Solución:** Endpoint incorrecto
- Verifica que el backend tenga la ruta correcta
- Usa el script de prueba para verificar endpoints

## 🧪 Script de Prueba del Backend

Para probar directamente el backend sin el frontend:

### **1. Obtener Token**
1. Abre DevTools en `http://localhost:5174`
2. Ve a **Application > Local Storage > http://localhost:5174**
3. Copia el valor de `token`

### **2. Ejecutar Script de Prueba**
```bash
# En la terminal de backend o donde tengas Node.js
npm install axios  # si no está instalado

# Ejecutar test con tu token
TEST_TOKEN="tu-token-copiado-aqui" node test-like.js
```

Este script probará:
- ✅ POST `/feed/59/like`
- ✅ GET `/feed/59` (para ver estructura)
- ✅ Endpoints alternativos si el principal falla

### **3. Interpretar Resultados del Script**

#### ✅ **Éxito Completo**
```
✅ Success!
📊 Status: 200
📋 Data: {liked: true, likes_count: 5, message: 'Like agregado'}
```

#### ❌ **Error 401 - Token Inválido**
```
❌ Error: Request failed with status code 401
🔑 Posible problema de autenticación - token inválido o expirado
```

#### ❌ **Error 404 - Endpoint No Existe**
```
❌ Error: Request failed with status code 404
🔍 Endpoint no encontrado - revisar ruta del backend
```

#### ❌ **Error 400 - Bad Request**
```
❌ Error: Request failed with status code 400
📝 Bad Request - revisar estructura de la petición
```

## 🚀 Soluciones Rápidas

### **Si no tienes token:**
1. Ve a la página de login en el frontend
2. Ingresa credenciales válidas
3. El token se guardará automáticamente

### **Si el backend no responde:**
1. Verifica que el servidor backend esté ejecutándose
2. Confirma que está en `http://localhost:3001`
3. Revisa los logs del backend para errores

### **Si el endpoint no existe:**
1. Revisa la documentación del backend
2. Confirma que implementa `/feed/:id/like`
3. Verifica que acepta método POST

### **Si la respuesta es incompleta:**
1. El frontend manejará esto automáticamente
2. Los contadores se estimarán
3. Funcionalidad básica seguirá funcionando

## 📊 Siguiente Paso

**Ejecuta el frontend y comparte los logs de la consola** para que pueda ayudarte con la solución específica a tu caso. 