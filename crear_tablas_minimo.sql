<<<<<<< HEAD
-- =========================================
-- ESTRUCTURA MÍNIMA DE BASE DE DATOS
-- Sistema de Feed Unificado - Trigamer Diario
-- =========================================

-- Usar la base de datos
USE trigamer_diario;

-- 1. Tabla de USUARIOS
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('administrador', 'colaborador', 'usuario') DEFAULT 'usuario',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_rol (rol)
);

-- 2. Tabla de NOTICIAS (original)
CREATE TABLE IF NOT EXISTS news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  resumen TEXT,
  image_url VARCHAR(500),
  original_url VARCHAR(500),
  is_oficial BOOLEAN DEFAULT FALSE,
  published_at DATETIME,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_published_at (published_at),
  INDEX idx_is_oficial (is_oficial)
);

-- 3. Tabla de COMUNICACIONES/COMUNIDAD (original)
CREATE TABLE IF NOT EXISTS com (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- 4. Tabla CONTENT_FEED (Central del sistema)
CREATE TABLE IF NOT EXISTS content_feed (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
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
  INDEX idx_original (type, original_id),
  INDEX idx_user_id (user_id)
);

-- 5. Tabla de LIKES para noticias
CREATE TABLE IF NOT EXISTS likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  news_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_news (user_id, news_id)
);

-- 6. Tabla de LIKES para comunidad
CREATE TABLE IF NOT EXISTS com_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  com_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (com_id) REFERENCES com(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_com (user_id, com_id)
);

-- 7. Tabla de COMENTARIOS para noticias
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  news_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
  INDEX idx_news_id (news_id),
  INDEX idx_user_id (user_id)
);

-- 8. Tabla de COMENTARIOS para comunidad
CREATE TABLE IF NOT EXISTS com_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  com_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (com_id) REFERENCES com(id) ON DELETE CASCADE,
  INDEX idx_com_id (com_id),
  INDEX idx_user_id (user_id)
);

-- =========================================
-- USUARIO ADMINISTRADOR POR DEFECTO
-- =========================================
INSERT IGNORE INTO users (id, nombre, email, password, rol) VALUES 
(1, 'Administrador', 'admin@trigamer.net', '$2b$10$default.hash.password', 'administrador');

-- =========================================
-- VERIFICACIÓN DE TABLAS CREADAS
-- =========================================
SELECT 'Tablas creadas exitosamente:' as status;
SHOW TABLES; 
=======
-- 🎯 Script MÍNIMO para sistema de likes
-- Base de datos: trigamer_diario

USE trigamer_diario;

-- ============================================
-- TABLA ESENCIAL: content_likes
-- ============================================
CREATE TABLE IF NOT EXISTS content_likes (
    id INT(11) NOT NULL AUTO_INCREMENT,
    content_id INT(11) NOT NULL COMMENT 'ID del contenido en content_feed',
    user_id INT(11) NOT NULL COMMENT 'ID del usuario que dio like',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_content_id (content_id),
    INDEX idx_user_id (user_id),
    UNIQUE KEY unique_user_content (user_id, content_id),
    FOREIGN KEY (content_id) REFERENCES content_feed(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ver si se creó correctamente
DESCRIBE content_likes;

-- Consulta de prueba (cambiar el 1 por tu ID de usuario)
SELECT 
    cf.id,
    cf.titulo,
    cf.likes_count,
    COALESCE(
        (SELECT TRUE FROM content_likes cl 
         WHERE cl.content_id = cf.id AND cl.user_id = 1),
        FALSE
    ) as is_liked
FROM content_feed cf
LIMIT 5; 
>>>>>>> 20577a1183f8832f97cb7c1847d49f3a457e4c0a
