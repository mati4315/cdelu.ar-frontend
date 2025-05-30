# 🗄️ Estructura de Base de Datos - Sistema de Feed Unificado

## 📊 Diagrama de Relaciones

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     USERS       │    │      NEWS       │    │       COM       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ nombre          │    │ titulo          │    │ titulo          │
│ email           │    │ descripcion     │    │ descripcion     │
│ rol             │    │ resumen         │    │ image_url       │
│ ...             │    │ image_url       │    │ video_url       │
└─────────────────┘    │ original_url    │    │ user_id (FK)    │
         │              │ is_oficial      │    │ created_at      │
         │              │ published_at    │    │ updated_at      │
         │              │ created_by (FK) │    └─────────────────┘
         │              │ created_at      │             │
         │              │ updated_at      │             │
         │              └─────────────────┘             │
         │                       │                      │
         │                       │                      │
         └───────────────────────┼──────────────────────┘
                                 │                      
                                 ▼                      
                  ┌─────────────────────────────────┐   
                  │        CONTENT_FEED             │   
                  │     (Tabla Unificada)           │   
                  ├─────────────────────────────────┤   
                  │ id (PK)                         │   
                  │ titulo                          │   
                  │ descripcion                     │   
                  │ resumen (solo news)             │   
                  │ image_url                       │   
                  │ type (1=news, 2=com)            │   
                  │ original_id (FK)                │   
                  │ user_id (FK)                    │   
                  │ user_name (desnormalizado)      │   
                  │ published_at                    │   
                  │ original_url (solo news)        │   
                  │ is_oficial (solo news)          │   
                  │ video_url (solo com)            │   
                  │ likes_count (precalculado)      │   
                  │ comments_count (precalculado)   │   
                  │ created_at                      │   
                  │ updated_at                      │   
                  └─────────────────────────────────┘   
                                 │                      
           ┌─────────────────────┼─────────────────────┐
           │                     │                     │
           ▼                     ▼                     ▼
    ┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │    LIKES    │    │   COM_LIKES     │    │    COMMENTS     │
    │  (noticias) │    │  (comunidad)    │    │   (noticias)    │
    ├─────────────┤    ├─────────────────┤    ├─────────────────┤
    │ id (PK)     │    │ id (PK)         │    │ id (PK)         │
    │ user_id(FK) │    │ user_id (FK)    │    │ user_id (FK)    │
    │ news_id(FK) │    │ com_id (FK)     │    │ news_id (FK)    │
    │ created_at  │    │ created_at      │    │ content         │
    └─────────────┘    └─────────────────┘    │ created_at      │
                                              └─────────────────┘
                                                       │
                                              ┌─────────────────┐
                                              │  COM_COMMENTS   │
                                              │  (comunidad)    │
                                              ├─────────────────┤
                                              │ id (PK)         │
                                              │ user_id (FK)    │
                                              │ com_id (FK)     │
                                              │ content         │
                                              │ created_at      │
                                              └─────────────────┘
```

## 🏗️ Tablas del Sistema

### 1. **CONTENT_FEED** (Tabla Central) ⭐

```sql
CREATE TABLE content_feed (
  id INT AUTO_INCREMENT PRIMARY KEY,          -- feedId único
  
  -- Campos comunes para todos los tipos
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  image_url VARCHAR(500) NULL,
  type TINYINT NOT NULL,                      -- 1=news, 2=com
  original_id INT NOT NULL,                   -- ID en tabla original
  user_id INT NULL,                           -- Autor/creador
  user_name VARCHAR(100) NULL,                -- Nombre desnormalizado
  published_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Campos específicos de NOTICIAS (type=1)
  resumen TEXT NULL,
  original_url VARCHAR(500) NULL,
  is_oficial BOOLEAN NULL,
  
  -- Campos específicos de COMUNIDAD (type=2)
  video_url VARCHAR(500) NULL,
  
  -- Estadísticas precalculadas
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  
  -- Índices para performance
  INDEX idx_type (type),
  INDEX idx_published_at (published_at),
  INDEX idx_type_published (type, published_at),
  INDEX idx_original (type, original_id)
);
```

### 2. **Tablas Originales** (Sin cambios)

#### NEWS (Noticias)
```sql
CREATE TABLE news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  resumen TEXT,
  image_url VARCHAR(500),
  original_url VARCHAR(500),
  is_oficial BOOLEAN DEFAULT FALSE,
  published_at DATETIME,
  created_by INT,                             -- FK → users.id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### COM (Comunicaciones/Comunidad)
```sql
CREATE TABLE com (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  user_id INT NOT NULL,                       -- FK → users.id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### USERS (Usuarios)
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  rol ENUM('administrador', 'colaborador', 'usuario') DEFAULT 'usuario',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. **Tablas de Likes** 

#### LIKES (Para noticias - existente)
```sql
CREATE TABLE likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,                       -- FK → users.id
  news_id INT NOT NULL,                       -- FK → news.id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_news (user_id, news_id)
);
```

#### COM_LIKES (Para comunidad - nueva)
```sql
CREATE TABLE com_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,                       -- FK → users.id
  com_id INT NOT NULL,                        -- FK → com.id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_com (user_id, com_id)
);
```

### 4. **Tablas de Comentarios**

#### COMMENTS (Para noticias - existente)
```sql
CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,                       -- FK → users.id
  news_id INT NOT NULL,                       -- FK → news.id
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### COM_COMMENTS (Para comunidad - nueva)
```sql
CREATE TABLE com_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,                       -- FK → users.id
  com_id INT NOT NULL,                        -- FK → com.id
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Flujo de Datos

### Ejemplo de Contenido en CONTENT_FEED

```sql
-- Registro de una NOTICIA (type=1)
INSERT INTO content_feed VALUES (
  1,                                          -- feedId
  'Título de la noticia',                     -- titulo
  'Descripción completa...',                  -- descripcion
  'imagen.jpg',                               -- image_url
  1,                                          -- type (1=news)
  123,                                        -- original_id (news.id)
  45,                                         -- user_id
  'Juan Pérez',                               -- user_name
  '2024-01-15 10:30:00',                      -- published_at
  '2024-01-15 10:30:00',                      -- created_at
  '2024-01-15 10:30:00',                      -- updated_at
  'Resumen corto...',                         -- resumen (solo news)
  'https://fuente.com/noticia',               -- original_url (solo news)
  TRUE,                                       -- is_oficial (solo news)
  NULL,                                       -- video_url (solo com)
  25,                                         -- likes_count
  8                                           -- comments_count
);

-- Registro de CONTENIDO DE COMUNIDAD (type=2)
INSERT INTO content_feed VALUES (
  2,                                          -- feedId
  'Post de la comunidad',                     -- titulo
  'Descripción del post...',                  -- descripcion
  'foto.jpg',                                 -- image_url
  2,                                          -- type (2=com)
  67,                                         -- original_id (com.id)
  89,                                         -- user_id
  'María García',                             -- user_name
  '2024-01-15 11:00:00',                      -- published_at
  '2024-01-15 11:00:00',                      -- created_at
  '2024-01-15 11:00:00',                      -- updated_at
  NULL,                                       -- resumen (solo news)
  NULL,                                       -- original_url (solo news)
  NULL,                                       -- is_oficial (solo news)
  'https://video.com/abc',                    -- video_url (solo com)
  12,                                         -- likes_count
  5                                           -- comments_count
);
```

## ⚡ Sistema de Triggers

### Sincronización Automática

Los triggers mantienen `content_feed` sincronizado:

```sql
-- Cuando se crea una noticia
TRIGGER after_news_insert → INSERT INTO content_feed

-- Cuando se actualiza una noticia
TRIGGER after_news_update → UPDATE content_feed WHERE type=1 AND original_id=news.id

-- Cuando se da like a una noticia
TRIGGER after_likes_insert → UPDATE content_feed SET likes_count++

-- Cuando se crea contenido de comunidad
TRIGGER after_com_insert → INSERT INTO content_feed

-- Cuando se da like a contenido de comunidad
TRIGGER after_com_likes_insert → UPDATE content_feed SET likes_count++
```

## 🔍 Consultas Típicas

### Obtener Feed Completo
```sql
SELECT * FROM content_feed 
ORDER BY published_at DESC 
LIMIT 10 OFFSET 0;
```

### Obtener Solo Noticias
```sql
SELECT * FROM content_feed 
WHERE type = 1 
ORDER BY published_at DESC 
LIMIT 10;
```

### Obtener Solo Comunidad
```sql
SELECT * FROM content_feed 
WHERE type = 2 
ORDER BY published_at DESC 
LIMIT 10;
```

### Dar Like (API maneja automáticamente qué tabla usar)
```sql
-- Para noticia (type=1)
INSERT INTO likes (user_id, news_id) VALUES (?, ?);

-- Para comunidad (type=2)
INSERT INTO com_likes (user_id, com_id) VALUES (?, ?);
```

## 📊 Estadísticas

### Conteo por Tipo
```sql
SELECT 
  type,
  COUNT(*) as total_items,
  SUM(likes_count) as total_likes,
  SUM(comments_count) as total_comments
FROM content_feed 
GROUP BY type;
```

### Performance
- **Una consulta** vs múltiples JOINs
- **Índices optimizados** para cada tipo de búsqueda
- **Estadísticas precalculadas** (no COUNT en tiempo real)
- **Datos desnormalizados** (user_name) para evitar JOINs

## 🎯 Ventajas de esta Estructura

### ✅ **Para Backend**
- Una tabla central para todo el contenido
- Consultas rápidas con índices optimizados
- Estadísticas precalculadas
- Sincronización automática con triggers

### ✅ **Para Frontend**  
- Una sola API para todo tipo de contenido
- Likes y comentarios funcionan igual para todo
- Respuesta uniforme independiente del tipo

### ✅ **Para Performance**
- Menos consultas SQL
- Índices específicos por tipo de búsqueda
- Sin JOINs costosos en consultas frecuentes
- Conteos precalculados

---

**🔑 Punto Clave**: `content_feed.id` es el **feedId** que usa el frontend para likes/comentarios. El sistema automáticamente sabe si usar `likes` o `com_likes` según el `type`. 