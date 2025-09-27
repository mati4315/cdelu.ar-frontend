# 🚀 **APIS REQUERIDAS PARA EL BACKEND** 

> **📋 Documentación completa para el desarrollador backend**  
> **Fecha:** 24 de Septiembre, 2025  
> **Prioridad:** ALTA - Sistema de perfiles públicos y seguimiento

---

## 🎯 **RESUMEN DE FUNCIONALIDADES**

El frontend necesita implementar un sistema completo de **perfiles públicos y seguimiento entre usuarios**. Actualmente tenemos:

- ✅ **Perfiles privados** (`/profile/me`) - FUNCIONA
- ✅ **Posts de usuario** (`/profile/me/posts`) - FUNCIONA  
- ❌ **Perfiles públicos** - FALTA EN BACKEND
- ❌ **Sistema de seguimiento** - FALTA EN BACKEND

---

## 🔗 **APIS FALTANTES EN EL BACKEND**

### 📄 **1. PERFILES PÚBLICOS**

#### `GET /api/v1/users/profile/:username`
**Obtener perfil público de un usuario**

**Headers:**
```
Authorization: Bearer <token> (opcional - para saber si sigo al usuario)
```

**Response exitoso (200):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "nombre": "Juan Pérez",
    "username": "juan.perez",
    "email": "juan@example.com", // opcional, solo para admins
    "profile_picture_url": "/uploads/profiles/juan.jpg",
    "bio": "Desarrollador Frontend en Vue.js",
    "location": "Concepción del Uruguay",
    "website": "https://juanperez.dev",
    "created_at": "2024-01-15T10:30:00Z",
    "is_verified": false,
    "stats": {
      "followers_count": 156,
      "following_count": 89,
      "posts_count": 45
    },
    "is_following": true, // solo si usuario está autenticado
    "is_own_profile": false // solo si usuario está autenticado
  }
}
```

**Response error (404):**
```json
{
  "success": false,
  "error": "Usuario no encontrado"
}
```

---

#### `GET /api/v1/users/profile/:username/posts`
**Obtener posts públicos de un usuario**

**Query Parameters:**
```
?page=1&limit=10&sort=created_at&order=desc
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "titulo": "Mi primera noticia",
      "descripcion": "Descripción del post...",
      "image_url": "/uploads/posts/image1.jpg",
      "image_urls": [
        "/uploads/posts/image1.jpg",
        "/uploads/posts/image2.jpg"
      ],
      "video_url": "/uploads/posts/video1.mp4",
      "created_at": "2024-09-20T15:30:00Z",
      "updated_at": "2024-09-20T15:30:00Z",
      "likes_count": 24,
      "comments_count": 8,
      "is_liked": false, // solo si usuario está autenticado
      "autor": "Juan Pérez",
      "user_id": 123
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

### 👥 **2. SISTEMA DE SEGUIMIENTO**

#### `POST /api/v1/users/:id/follow`
**Seguir a un usuario**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ahora sigues a Juan Pérez",
  "data": {
    "is_following": true,
    "followers_count": 157 // conteo actualizado
  }
}
```

**Response error (404):**
```json
{
  "success": false,
  "error": "Usuario no encontrado"
}
```

**Response error (409):**
```json
{
  "success": false,
  "error": "Ya sigues a este usuario"
}
```

---

#### `DELETE /api/v1/users/:id/follow`
**Dejar de seguir a un usuario**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ya no sigues a Juan Pérez",
  "data": {
    "is_following": false,
    "followers_count": 156 // conteo actualizado
  }
}
```

---

#### `GET /api/v1/users/profile/:username/followers`
**Obtener lista de seguidores**

**Query Parameters:**
```
?page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 789,
      "nombre": "María García",
      "username": "maria.garcia",
      "profile_picture_url": "/uploads/profiles/maria.jpg",
      "bio": "Diseñadora UX/UI",
      "is_following": true, // si el usuario actual sigue a este usuario
      "followed_at": "2024-08-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

#### `GET /api/v1/users/profile/:username/following`
**Obtener lista de usuarios que sigue**

**Query Parameters:**
```
?page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 321,
      "nombre": "Carlos López",
      "username": "carlos.lopez",
      "profile_picture_url": "/uploads/profiles/carlos.jpg",
      "bio": "Periodista local",
      "is_following": false, // si el usuario actual sigue a este usuario
      "followed_at": "2024-07-20T14:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 89,
    "totalPages": 5
  }
}
```

---

### 🔍 **3. BÚSQUEDA DE USUARIOS**

#### `GET /api/v1/users/search`
**Buscar usuarios por nombre o username**

**Query Parameters:**
```
?query=juan&page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "nombre": "Juan Pérez",
      "username": "juan.perez",
      "profile_picture_url": "/uploads/profiles/juan.jpg",
      "bio": "Desarrollador Frontend",
      "followers_count": 156,
      "is_following": false,
      "is_verified": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

---

## 🛠️ **MODIFICACIONES A APIS EXISTENTES**

### 📰 **Feed - Agregar información de usuario**

**Modificar:** `GET /api/v1/feed/*` (todo, noticias, comunidad)

**Agregar campos a cada item del feed:**
```json
{
  "id": 456,
  "titulo": "...",
  "descripcion": "...",
  // ... campos existentes ...
  
  // AGREGAR ESTOS CAMPOS:
  "user_id": 123,           // ID del autor
  "user_name": "Juan Pérez", // Nombre del autor
  "user_profile_picture": "/uploads/profiles/juan.jpg" // Foto del autor (opcional)
}
```

**¿Por qué es importante?**
- El frontend genera usernames desde `user_name`
- La navegación de `/user/juan.perez` funciona con estos datos
- Permite mostrar fotos de perfil en el feed

---

## 🗄️ **BASE DE DATOS - NUEVAS TABLAS**

### **Tabla: `user_follows`**
```sql
CREATE TABLE user_follows (
  id INT PRIMARY KEY AUTO_INCREMENT,
  follower_id INT NOT NULL,      -- Usuario que sigue
  following_id INT NOT NULL,     -- Usuario seguido
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_follow (follower_id, following_id),
  INDEX idx_follower (follower_id),
  INDEX idx_following (following_id)
);
```

### **Modificar tabla: `users`**
```sql
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN location VARCHAR(255);
ALTER TABLE users ADD COLUMN website VARCHAR(255);
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
```

---

## 🔐 **REGLAS DE NEGOCIO**

### **Perfiles Públicos:**
- ✅ Cualquier usuario puede ver perfiles públicos (con/sin autenticación)
- ✅ Usuarios autenticados ven si siguen al usuario (`is_following`)
- ✅ Solo el propietario puede ver email y datos privados

### **Seguimiento:**
- ✅ Usuarios no pueden seguirse a sí mismos
- ✅ No se puede seguir al mismo usuario dos veces
- ✅ Los contadores se actualizan automáticamente
- ✅ Al eliminar usuario, se eliminan sus follows automáticamente

### **Posts Públicos:**
- ✅ Todos los posts de comunidad son públicos
- ✅ Las noticias solo las ven usuarios con permisos

### **Búsqueda:**
- ✅ Buscar por nombre completo: "Juan Pérez"
- ✅ Buscar por username: "juan.perez"
- ✅ Buscar parcial: "juan" encuentra "Juan Pérez"
- ✅ Case insensitive

---

## 🧪 **ENDPOINTS PARA TESTING**

Para probar rápidamente, crear estos usuarios de prueba:

```sql
INSERT INTO users (nombre, email, password) VALUES 
('Juan Pérez', 'juan@test.com', 'hashed_password'),
('María García', 'maria@test.com', 'hashed_password'),
('Carlos López', 'carlos@test.com', 'hashed_password');

INSERT INTO user_follows (follower_id, following_id) VALUES
(1, 2), -- Juan sigue a María
(1, 3), -- Juan sigue a Carlos  
(2, 1); -- María sigue a Juan
```

---

## 🚀 **PRIORIDADES DE IMPLEMENTACIÓN**

### **FASE 1 - CRÍTICA** (Implementar primero)
1. ✅ `GET /users/profile/:username` - Perfiles públicos básicos
2. ✅ `GET /users/profile/:username/posts` - Posts públicos
3. ✅ Modificar feed para incluir `user_id` y `user_name`

### **FASE 2 - IMPORTANTE**
4. ✅ `POST/DELETE /users/:id/follow` - Sistema de seguimiento
5. ✅ `GET /users/profile/:username/followers` - Lista seguidores
6. ✅ `GET /users/profile/:username/following` - Lista siguiendo

### **FASE 3 - OPCIONAL**
7. ✅ `GET /users/search` - Búsqueda de usuarios
8. ✅ Campos adicionales en users (bio, location, website)

---

## 📞 **CONTACTO PARA DUDAS**

Si tienes dudas sobre:
- **Formatos de respuesta**: Los JSONs son ejemplos, puedes ajustar nombres
- **Validaciones**: El frontend ya maneja errores 404/401/403
- **Paginación**: Usa el mismo formato que en `/profile/me/posts`
- **Autenticación**: Usa el mismo middleware JWT existente

---

## ✅ **CHECKLIST PARA EL DESARROLLADOR**

- [ ] Crear tabla `user_follows`
- [ ] Agregar campos a tabla `users` 
- [ ] Implementar `GET /users/profile/:username`
- [ ] Implementar `GET /users/profile/:username/posts`
- [ ] Modificar feed para incluir `user_id` y `user_name`
- [ ] Implementar `POST /users/:id/follow`
- [ ] Implementar `DELETE /users/:id/follow`
- [ ] Implementar `GET /users/profile/:username/followers`
- [ ] Implementar `GET /users/profile/:username/following`
- [ ] Implementar `GET /users/search`
- [ ] Testing con usuarios de prueba

---

> **🎯 Con estas APIs, el frontend funcionará completamente sin modificaciones adicionales!**
