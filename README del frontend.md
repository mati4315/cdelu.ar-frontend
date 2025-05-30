# 📰 CdelU - Portal de Noticias API

API REST para el diario online CdelU con autenticación JWT, gestión de contenido multimedia y documentación interactiva.

## 🚀 Características

- ✅ **API RESTful** con Fastify
- 🔐 **Autenticación JWT** con roles de usuario
- 📱 **CORS configurado** para frontend
- 📚 **Documentación Swagger/OpenAPI** interactiva
- 🖼️ **Upload de archivos** multimedia
- 📊 **Paginación y ordenación** avanzada
- 🔄 **Infinite scroll** compatible
- 🌐 **Endpoints públicos** y protegidos
- 📈 **Estadísticas** del sistema
- 💬 **Sistema de comentarios** y likes
- 🏷️ **Sistema de tags** para organización

## 📋 Requisitos Previos

- **Node.js** v16 o superior
- **MySQL** 5.7 o superior
- **npm** v8 o superior

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/cdelu.git
cd cdelu
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=cdelu

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
JWT_EXPIRES_IN=24h

# Servidor
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# RSS (opcional)
RSS_FEED_URL=https://example.com/rss
NOTICIA_NUMERO=0

# IA (opcional)
OPENAI_API_KEY=tu_api_key_openai
```

### 4. Configurar base de datos
Ejecutar los scripts SQL en tu base de datos MySQL:

```sql
-- Crear base de datos
CREATE DATABASE cdelu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE cdelu;

-- Crear tablas (ejecutar scripts SQL del proyecto)
-- Ver archivos en /database/migrations/
```

### 5. Iniciar el servidor

**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

El servidor estará disponible en: `http://localhost:3001`

## 📚 Documentación de la API

### Swagger UI
Una vez que el servidor esté ejecutándose, puedes acceder a la documentación interactiva en:

```
http://localhost:3001/api/v1/docs
```

### API Viewer Interno
Para administradores, hay un visor de API interno disponible en el dashboard:

```
http://localhost:3001/public/dashboard.html
```

## 🔗 Endpoints Principales

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuarios
- `POST /api/v1/auth/login` - Inicio de sesión

### Noticias (Públicas)
- `GET /api/v1/news` - Listar noticias con paginación
- `GET /api/v1/news/:id` - Obtener noticia específica
- `GET /api/v1/news/:id/comments` - Comentarios de una noticia

### Noticias (Autenticadas)
- `POST /api/v1/news` - Crear noticia (usuario, colaborador, admin)
- `PUT /api/v1/news/:id` - Actualizar noticia (colaborador, admin)
- `DELETE /api/v1/news/:id` - Eliminar noticia (admin)
- `POST /api/v1/news/:id/like` - Dar like
- `DELETE /api/v1/news/:id/like` - Quitar like
- `POST /api/v1/news/:id/comments` - Crear comentario

### Usuarios (Admin)
- `GET /api/v1/users` - Listar usuarios
- `GET /api/v1/users/profile` - Perfil del usuario actual
- `PUT /api/v1/users/:id` - Actualizar usuario
- `DELETE /api/v1/users/:id` - Eliminar usuario

### Estadísticas
- `GET /api/v1/stats` - Estadísticas generales

### Comunicaciones
- `POST /api/v1/com` - Crear entrada multimedia
- `GET /api/v1/com` - Listar entradas
- `GET /api/v1/com/:id` - Obtener entrada específica

## 🔐 Autenticación

### Obtener Token
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@example.com", "password": "password"}'
```

### Usar Token
```bash
curl -X GET http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer TU_TOKEN_JWT_AQUI"
```

## 👥 Roles de Usuario

- **usuario**: Puede crear noticias, comentar y dar likes
- **colaborador**: Todo lo anterior + editar noticias
- **administrador**: Todo lo anterior + gestionar usuarios y eliminar contenido

## 📊 Paginación e Infinite Scroll

### Ejemplo de solicitud paginada
```bash
GET /api/v1/news?page=1&limit=10&sort=published_at&order=desc
```

### Respuesta
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

### Para Infinite Scroll
El frontend puede implementar infinite scroll solicitando páginas incrementales:
- Página 1: `?page=1&limit=10`
- Página 2: `?page=2&limit=10`
- Continuar hasta `pagination.totalPages`

## 🖼️ Upload de Archivos

### Crear noticia con imagen
```bash
curl -X POST http://localhost:3001/api/v1/news \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Mi Noticia",
    "descripcion": "Contenido de la noticia",
    "image_url": "https://example.com/imagen.jpg"
  }'
```

### Upload multimedia (comunicaciones)
```bash
curl -X POST http://localhost:3001/api/v1/com \
  -H "Authorization: Bearer TU_TOKEN" \
  -F "titulo[value]=Mi Comunicación" \
  -F "descripcion[value]=Descripción del contenido" \
  -F "image=@/ruta/a/imagen.jpg" \
  -F "video=@/ruta/a/video.mp4"
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo con hot reload
npm run dev

# Producción
npm start

# Tests
npm test

# Importar noticias desde RSS
npm run import-news

# Eliminar todas las noticias
npm run delete-news
```

## 🔧 Configuración CORS

Para desarrollo frontend, asegúrate de configurar CORS en `.env`:

```env
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://localhost:8080
```

## 📁 Estructura del Proyecto

```
cdelu/
├── src/
│   ├── app.js                 # Configuración principal de Fastify
│   ├── index.js              # Punto de entrada
│   ├── config/               # Configuraciones
│   ├── controllers/          # Lógica de negocio
│   ├── routes/               # Definición de rutas
│   ├── middlewares/          # Middlewares personalizados
│   ├── services/             # Servicios externos (IA, RSS)
│   └── scripts/              # Scripts de utilidad
├── public/                   # Archivos estáticos
│   └── dashboard.html        # Panel de administración
├── database/                 # Esquemas y migraciones
├── .env                      # Variables de entorno
├── package.json              # Dependencias
└── README.md                 # Esta documentación
```

## 🌐 Frontend Integration

### Para desarrolladores frontend
Este backend está optimizado para trabajar con:

- **Vue.js 3** con TypeScript
- **React** con TypeScript
- **Angular**
- Cualquier framework que consuma APIs REST

### Headers requeridos
```javascript
// Para requests autenticados
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Ejemplo de integración (JavaScript)
```javascript
// Obtener noticias
const response = await fetch('http://localhost:3001/api/v1/news?page=1&limit=10');
const data = await response.json();

// Crear noticia (autenticado)
const response = await fetch('http://localhost:3001/api/v1/news', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    titulo: 'Mi noticia',
    descripcion: 'Contenido de la noticia'
  })
});
```

## 🐛 Troubleshooting

### Error: "Swagger no está disponible"
- Asegúrate de que `@fastify/swagger` y `@fastify/swagger-ui` estén instalados
- Verifica que el servidor esté ejecutándose correctamente
- Reinicia el servidor con `npm run dev`

### Error de CORS
- Verifica que `CORS_ORIGIN` incluya la URL de tu frontend
- Para desarrollo local, usa: `CORS_ORIGIN=http://localhost:5173`

### Error de base de datos
- Verifica las credenciales en `.env`
- Asegúrate de que MySQL esté ejecutándose
- Verifica que la base de datos `cdelu` exista

### Error de JWT
- Verifica que `JWT_SECRET` esté configurado en `.env`
- Asegúrate de enviar el token en el header `Authorization`

## 📞 Soporte

Para reportar issues o solicitar features:

1. **GitHub Issues**: [Crear issue](https://github.com/tu-usuario/cdelu/issues)
2. **Email**: dev@cdelu.ar
3. **Documentación**: `http://localhost:3001/api/v1/docs`

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**¡Desarrollado con ❤️ para el equipo de CdelU!** 