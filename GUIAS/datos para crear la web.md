# Documentación de la API del Diario Digital CdelU

A continuación te presento la documentación completa de la API para que puedas desarrollar el frontend del Diario Digital CdelU.

## Base URL

```
http://localhost:3001/api/v1
```

## Autenticación

La API utiliza autenticación basada en tokens JWT. Para las rutas protegidas, incluye el token en el encabezado `Authorization` con el formato:

```
Authorization: Bearer 
# Configuracion de JWT
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

El token JWT se obtiene mediante el endpoint de inicio de sesión.

## Endpoints

### Autenticación

#### Registro de usuario

```http
POST /auth/register
```

**Body:**
```json
{
  "nombre": "Usuario Ejemplo",
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "role": "usuario"
}
```

**Notas:**
- El campo `role` es opcional y por defecto es "usuario"
- Los roles disponibles son: "administrador", "colaborador", "usuario"
- Solo un administrador puede crear otros administradores

**Respuesta:**
```json
{
  "id": 1,
  "nombre": "Usuario Ejemplo",
  "email": "usuario@ejemplo.com",
  "role": "usuario"
}
```

#### Inicio de sesión

```http
POST /auth/login
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Usuario Ejemplo",
    "email": "usuario@ejemplo.com",
    "role": "usuario"
  }
}
```

### Noticias

#### Obtener todas las noticias

```http
GET /news
```

**Parámetros de consulta:**
- `page` (opcional): Número de página (por defecto: 1)
- `limit` (opcional): Número de elementos por página (por defecto: 10, máximo: 100)

**Respuesta:**
```json
{
  "data": [
    {
      "id": 1,
      "titulo": "Título de la noticia",
      "descripcion": "Contenido de la noticia...",
      "resumen": "Resumen generado por IA...",
      "image_url": "https://ejemplo.com/imagen.jpg",
      "original_url": "https://fuente-original.com/noticia",
      "is_oficial": true,
      "autor": "Nombre del Autor",
      "likes_count": 5,
      "comments_count": 3,
      "created_at": "2023-07-01T12:00:00Z",
      "updated_at": "2023-07-01T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### Obtener una noticia por ID

```http
GET /news/{id}
```

**Respuesta:**
```json
{
  "id": 1,
  "titulo": "Título de la noticia",
  "descripcion": "Contenido de la noticia...",
  "resumen": "Resumen generado por IA...",
  "image_url": "https://ejemplo.com/imagen.jpg",
  "original_url": "https://fuente-original.com/noticia",
  "is_oficial": true,
  "autor": "Nombre del Autor",
  "created_at": "2023-07-01T12:00:00Z",
  "updated_at": "2023-07-01T12:00:00Z"
}
```

#### Crear una noticia

```http
POST /news
```

**Autenticación:** Requiere token JWT y rol de administrador o colaborador

**Body:**
```json
{
  "titulo": "Título de la noticia",
  "descripcion": "Contenido de la noticia...",
  "image_url": "https://ejemplo.com/imagen.jpg",
  "original_url": "https://fuente-original.com/noticia",
  "is_oficial": true
}
```

**Respuesta:**
```json
{
  "id": 1,
  "titulo": "Título de la noticia",
  "descripcion": "Contenido de la noticia...",
  "resumen": "Resumen generado por IA...",
  "image_url": "https://ejemplo.com/imagen.jpg",
  "original_url": "https://fuente-original.com/noticia",
  "is_oficial": true,
  "autor": "Nombre del Autor",
  "created_at": "2023-07-01T12:00:00Z",
  "updated_at": "2023-07-01T12:00:00Z"
}
```

#### Actualizar una noticia

```http
PUT /news/{id}
```

**Autenticación:** Requiere token JWT y rol de administrador o colaborador

**Body:**
```json
{
  "titulo": "Título actualizado",
  "descripcion": "Contenido actualizado...",
  "image_url": "https://ejemplo.com/nueva-imagen.jpg",
  "original_url": "https://fuente-original.com/noticia-actualizada",
  "is_oficial": true
}
```

**Respuesta:**
```json
{
  "id": 1,
  "titulo": "Título actualizado",
  "descripcion": "Contenido actualizado...",
  "resumen": "Resumen actualizado...",
  "image_url": "https://ejemplo.com/nueva-imagen.jpg",
  "original_url": "https://fuente-original.com/noticia-actualizada",
  "is_oficial": true,
  "autor": "Nombre del Autor",
  "created_at": "2023-07-01T12:00:00Z",
  "updated_at": "2023-07-02T15:30:00Z"
}
```

#### Eliminar una noticia

```http
DELETE /news/{id}
```

**Autenticación:** Requiere token JWT y rol de administrador

**Respuesta:** Código 204 (Sin contenido) si se elimina correctamente

#### Dar like a una noticia

```http
POST /news/{id}/like
```

**Autenticación:** Requiere token JWT (cualquier rol)

**Respuesta:**
```json
{
  "message": "Like agregado correctamente"
}
```

#### Quitar like de una noticia

```http
DELETE /news/{id}/like
```

**Autenticación:** Requiere token JWT (cualquier rol)

**Respuesta:**
```json
{
  "message": "Like eliminado correctamente"
}
```

#### Crear un comentario en una noticia

```http
POST /news/{id}/comments
```

**Autenticación:** Requiere token JWT (cualquier rol)

**Body:**
```json
{
  "content": "Este es mi comentario sobre la noticia"
}
```

**Respuesta:**
```json
{
  "id": 1,
  "message": "Comentario creado correctamente"
}
```

#### Obtener comentarios de una noticia

```http
GET /news/{id}/comments
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "news_id": 1,
    "user_id": 2,
    "content": "Este es mi comentario sobre la noticia",
    "autor": "Nombre del Usuario",
    "created_at": "2023-07-02T15:45:00Z"
  }
]
```

### Usuarios

#### Obtener todos los usuarios

```http
GET /users
```

**Autenticación:** Requiere token JWT y rol de administrador

**Respuesta:**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Usuario Ejemplo",
      "email": "usuario@ejemplo.com",
      "role": "administrador",
      "created_at": "2023-07-01T10:00:00Z"
    }
  ]
}
```

#### Actualizar un usuario

```http
PUT /users/{id}
```

**Autenticación:** Requiere token JWT y rol de administrador

**Body:**
```json
{
  "nombre": "Nuevo Nombre",
  "email": "nuevo@email.com",
  "role": "colaborador"
}
```

**Respuesta:**
```json
{
  "id": 1,
  "nombre": "Nuevo Nombre",
  "email": "nuevo@email.com",
  "role": "colaborador",
  "created_at": "2023-07-01T10:00:00Z",
  "updated_at": "2023-07-02T16:00:00Z"
}
```

#### Eliminar un usuario

```http
DELETE /users/{id}
```

**Autenticación:** Requiere token JWT y rol de administrador

**Respuesta:** Código 204 (Sin contenido) si se elimina correctamente

### Estadísticas

#### Obtener estadísticas generales

```http
GET /stats
```

**Autenticación:** Requiere token JWT y rol de administrador

**Respuesta:**
```json
{
  "totalNoticias": 50,
  "totalUsuarios": 25,
  "totalComentarios": 120
}
```

## Ejemplos de uso con JavaScript

### Clase de servicio para la API

Aquí tienes una clase de servicio que puedes usar en tu frontend:

```javascript
class ApiService {
  constructor(baseUrl = 'http://localhost:3001/api/v1') {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('token');
  }

  // Método para configurar headers
  getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Método para actualizar el token (tras login)
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Método para limpiar el token (logout)
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Método para verificar si hay token
  isAuthenticated() {
    return !!this.token;
  }

  // Métodos de autenticación
  async login(email, password) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
    }
    
    this.setToken(data.token);
    return data;
  }

  async register(userData) {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al registrar usuario');
    }
    
    return data;
  }

  // Métodos para noticias
  async getNoticias(page = 1, limit = 10) {
    const response = await fetch(`${this.baseUrl}/news?page=${page}&limit=${limit}`);
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener noticias');
    }
    
    return data;
  }

  async getNoticia(id) {
    const response = await fetch(`${this.baseUrl}/news/${id}`);
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener la noticia');
    }
    
    return data;
  }

  async crearNoticia(noticia) {
    const response = await fetch(`${this.baseUrl}/news`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(noticia)
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al crear noticia');
    }
    
    return data;
  }

  async actualizarNoticia(id, noticia) {
    const response = await fetch(`${this.baseUrl}/news/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(noticia)
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar noticia');
    }
    
    return data;
  }

  async eliminarNoticia(id) {
    const response = await fetch(`${this.baseUrl}/news/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true)
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Error al eliminar noticia');
    }
    
    return true;
  }

  // Métodos para likes y comentarios
  async darLike(noticiaId) {
    const response = await fetch(`${this.baseUrl}/news/${noticiaId}/like`, {
      method: 'POST',
      headers: this.getHeaders(true)
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al dar like');
    }
    
    return data;
  }

  async quitarLike(noticiaId) {
    const response = await fetch(`${this.baseUrl}/news/${noticiaId}/like`, {
      method: 'DELETE',
      headers: this.getHeaders(true)
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al quitar like');
    }
    
    return data;
  }

  async getComentarios(noticiaId) {
    const response = await fetch(`${this.baseUrl}/news/${noticiaId}/comments`);
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener comentarios');
    }
    
    return data;
  }

  async crearComentario(noticiaId, content) {
    const response = await fetch(`${this.baseUrl}/news/${noticiaId}/comments`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ content })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al crear comentario');
    }
    
    return data;
  }

  // Métodos para usuarios (admin)
  async getUsuarios() {
    const response = await fetch(`${this.baseUrl}/users`, {
      headers: this.getHeaders(true)
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener usuarios');
    }
    
    return data;
  }

  async actualizarUsuario(id, userData) {
    const response = await fetch(`${this.baseUrl}/users/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar usuario');
    }
    
    return data;
  }

  async eliminarUsuario(id) {
    const response = await fetch(`${this.baseUrl}/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true)
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Error al eliminar usuario');
    }
    
    return true;
  }

  // Estadísticas
  async getEstadisticas() {
    const response = await fetch(`${this.baseUrl}/stats`, {
      headers: this.getHeaders(true)
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener estadísticas');
    }
    
    return data;
  }
}

// Exportar la clase
export default ApiService;
```

## Estructura recomendada para el frontend

Para desarrollar el frontend, te recomiendo esta estructura básica (React):

```
src/
├── api/
│   └── ApiService.js    # Clase de servicio mostrada arriba
├── components/
│   ├── Layout/          # Componentes de layout (header, footer, etc.)
│   ├── Auth/            # Componentes de login/registro
│   ├── News/            # Componentes para mostrar/editar noticias
│   ├── Comments/        # Componentes para comentarios
│   ├── Users/           # Componentes de administración de usuarios
│   └── common/          # Componentes reutilizables (botones, inputs, etc.)
├── contexts/
│   └── AuthContext.js   # Contexto para gestionar autenticación
├── hooks/
│   ├── useAuth.js       # Hook para autenticación
│   └── useApi.js        # Hook para llamadas a la API
├── pages/
│   ├── Home.js          # Página principal
│   ├── NewsDetail.js    # Página de detalle de noticia
│   ├── Login.js         # Página de login
│   ├── Register.js      # Página de registro
│   ├── Dashboard.js     # Panel de administración
│   └── Profile.js       # Perfil de usuario
├── utils/
│   ├── dateFormat.js    # Utilidades para formateo de fechas
│   └── validators.js    # Funciones de validación
└── App.js               # Componente principal con rutas
```

## Implementación de rutas protegidas

Para implementar rutas protegidas por rol en React Router:

```jsx
import { useEffect, useContext } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

// Componente para rutas protegidas que requieren autenticación
export const PrivateRoute = ({ children, roles = [] }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  // Si está cargando, muestra un spinner
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si no está autenticado, redirige al login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Si se especifican roles y el usuario no tiene el rol requerido
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  // Si pasa todas las validaciones, muestra el componente hijo
  return children;
};

// Ejemplo de uso en App.js
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/news/:id" element={<NewsDetail />} />
      
      {/* Rutas protegidas */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute roles={['administrador']}>
            <Dashboard />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/create-news"
        element={
          <PrivateRoute roles={['administrador', 'colaborador']}>
            <CreateNews />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
```

Con esta documentación y los ejemplos de código proporcionados, deberías tener todo lo necesario para desarrollar el frontend completo del Diario Digital CdelU. La API está diseñada de manera RESTful, lo que facilita la integración con cualquier framework de frontend que elijas (React, Vue, Angular, etc.).
