# 🔍 Cómo Revisar los Logs del Backend

## 1. **Acceder a la Terminal del Backend**
Abre la terminal donde tienes ejecutándose el servidor backend (Node.js/Express)

## 2. **Buscar el Error 500**
Cuando hagas clic en un like en el frontend, deberías ver un error en los logs del backend como:

```
POST /api/v1/feed/62/like 500
Error: [descripción del error]
    at [línea del código]
```

## 3. **Tipos de Errores Comunes**

### **Error de Base de Datos:**
```
Error: Table 'database.likes' doesn't exist
Error: Duplicate entry '7-62' for key 'user_feed_unique'
Error: Cannot add or update a child row: a foreign key constraint fails
```

### **Error de Código:**
```
Error: Cannot read property 'id' of undefined
TypeError: user.hasPermission is not a function
Error: feedId is not defined
```

### **Error de Permisos:**
```
Error: User does not have permission to like
Error: Invalid user role: usuario
```

## 4. **Capturas que Necesitamos**
Copia el error completo que aparezca en los logs del backend cuando hagas clic en like. 