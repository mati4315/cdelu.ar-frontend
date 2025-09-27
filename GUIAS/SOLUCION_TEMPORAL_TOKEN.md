# 🔧 Solución Temporal: Problema de Token JWT

## 🎯 **Problema Identificado:**

El token JWT generado por el backend **no incluye el rol del usuario**. El payload del token solo contiene:
```json
{
  "id": 6,
  "exp": 1234567890
}
```

**Falta el campo `rol` en el token JWT.**

## 🔍 **Diagnóstico:**

1. ✅ **Login**: Funcionando correctamente
2. ✅ **Usuario**: Tiene rol `administrador` en la base de datos
3. ✅ **Token**: Se genera y envía correctamente
4. ❌ **Autorización**: Falla porque el token no incluye el rol

## 🔧 **Solución Temporal:**

### **Opción 1: Actualizar el Backend (Recomendado)**

El backend necesita incluir el rol en el token JWT. En el controlador de login, cambiar:

```javascript
// ANTES (token sin rol)
const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

// DESPUÉS (token con rol)
const token = jwt.sign({ 
  id: user.id, 
  rol: user.rol 
}, process.env.JWT_SECRET, { expiresIn: '24h' });
```

### **Opción 2: Solución Temporal en Frontend**

Mientras se actualiza el backend, podemos almacenar el rol del usuario en localStorage y usarlo para verificaciones locales:

```javascript
// En el login exitoso
localStorage.setItem('userRole', loginResult.user.rol);

// En el middleware de autorización del frontend
const userRole = localStorage.getItem('userRole');
if (userRole !== 'administrador') {
  // Mostrar error de permisos
}
```

## 📋 **Pasos para Solucionar:**

### **Paso 1: Verificar el Backend**
1. Ir al directorio del backend
2. Buscar el archivo de autenticación (auth controller)
3. Verificar que el token incluya el rol del usuario

### **Paso 2: Actualizar el Token JWT**
```javascript
// En el controlador de login
const token = jwt.sign({
  id: user.id,
  email: user.email,
  rol: user.rol  // ← Agregar el rol
}, process.env.JWT_SECRET, { expiresIn: '24h' });
```

### **Paso 3: Actualizar el Middleware de Autorización**
```javascript
// En el middleware de autorización
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Verificar rol para endpoints de administración
    if (req.path.startsWith('/surveys') && req.method !== 'GET') {
      if (decoded.rol !== 'administrador') {
        return res.status(403).json({ error: 'No tienes permisos de administrador' });
      }
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
```

## 🎯 **Estado Actual:**

- ✅ **Frontend**: Completamente funcional
- ✅ **Base de datos**: Completamente funcional
- ✅ **Usuario**: Con rol de administrador
- ❌ **Token JWT**: No incluye el rol
- ❌ **Autorización**: Falla por falta de rol en token

## 🚀 **Próximos Pasos:**

1. **Actualizar el backend** para incluir el rol en el token JWT
2. **Reiniciar el servidor backend**
3. **Probar la creación de encuestas** nuevamente
4. **Verificar que el token incluya el rol**

## 📞 **Información de Contacto:**

- **Backend**: `http://localhost:3001`
- **Usuario admin**: `admin@cdelu.ar`
- **Contraseña**: `admin123`
- **Rol en BD**: `administrador`
- **Problema**: Rol no incluido en token JWT

---

**🎯 CONCLUSIÓN: El problema está en el backend. El token JWT debe incluir el rol del usuario para que la autorización funcione correctamente.** 