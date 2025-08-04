-- 🚀 Script completo para sistema de Feed Unificado
-- Base de datos: trigamer_diario

USE trigamer_diario;

-- ============================================
-- 1. TABLA CONTENT_FEED (si no existe)
-- ============================================
CREATE TABLE IF NOT EXISTS content_feed (
    id INT(11) NOT NULL AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    resumen TEXT NULL,
    image_url VARCHAR(500) NULL,
    type TINYINT(1) NOT NULL COMMENT '1=noticia, 2=comunidad',
    original_id INT(11) NOT NULL COMMENT 'ID en tabla original (news/com)',
    user_id INT(11) NULL,
    user_name VARCHAR(100) NULL,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Campos específicos de noticias
    original_url VARCHAR(500) NULL,
    is_oficial BOOLEAN DEFAULT FALSE,
    
    -- Campos específicos de comunidad
    video_url VARCHAR(500) NULL,
    
    -- Contadores (se actualizan automáticamente)
    likes_count INT(11) DEFAULT 0,
    comments_count INT(11) DEFAULT 0,
    
    PRIMARY KEY (id),
    
    -- Índices para optimización
    INDEX idx_type (type),
    INDEX idx_original_id (original_id),
    INDEX idx_type_original (type, original_id),
    INDEX idx_published_at (published_at),
    INDEX idx_user_id (user_id),
    
    -- Índice único para evitar duplicados
    UNIQUE KEY unique_type_original (type, original_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. TABLA CONTENT_LIKES
-- ============================================
CREATE TABLE IF NOT EXISTS content_likes (
    id INT(11) NOT NULL AUTO_INCREMENT,
    content_id INT(11) NOT NULL COMMENT 'ID del contenido en content_feed',
    user_id INT(11) NOT NULL COMMENT 'ID del usuario que dio like',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    
    -- Índices para optimizar consultas
    INDEX idx_content_id (content_id),
    INDEX idx_user_id (user_id),
    INDEX idx_content_user (content_id, user_id),
    
    -- Restricción única para evitar likes duplicados
    UNIQUE KEY unique_user_content (user_id, content_id),
    
    -- Claves foráneas
    FOREIGN KEY (content_id) REFERENCES content_feed(id) ON DELETE CASCADE
    -- NOTA: Uncomment next line if your users table is named 'users'
    -- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. TABLA CONTENT_COMMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS content_comments (
    id INT(11) NOT NULL AUTO_INCREMENT,
    content_id INT(11) NOT NULL COMMENT 'ID del contenido en content_feed',
    user_id INT(11) NOT NULL COMMENT 'ID del usuario que comentó',
    contenido TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    
    -- Índices
    INDEX idx_content_id (content_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    
    -- Claves foráneas
    FOREIGN KEY (content_id) REFERENCES content_feed(id) ON DELETE CASCADE
    -- NOTA: Uncomment next line if your users table is named 'users'
    -- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. TRIGGERS PARA ACTUALIZAR CONTADORES
-- ============================================

-- Trigger para actualizar likes_count cuando se inserta un like
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS update_likes_count_insert
    AFTER INSERT ON content_likes
    FOR EACH ROW
BEGIN
    UPDATE content_feed 
    SET likes_count = (
        SELECT COUNT(*) FROM content_likes 
        WHERE content_id = NEW.content_id
    )
    WHERE id = NEW.content_id;
END$$
DELIMITER ;

-- Trigger para actualizar likes_count cuando se elimina un like
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS update_likes_count_delete
    AFTER DELETE ON content_likes
    FOR EACH ROW
BEGIN
    UPDATE content_feed 
    SET likes_count = (
        SELECT COUNT(*) FROM content_likes 
        WHERE content_id = OLD.content_id
    )
    WHERE id = OLD.content_id;
END$$
DELIMITER ;

-- Trigger para actualizar comments_count cuando se inserta un comentario
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS update_comments_count_insert
    AFTER INSERT ON content_comments
    FOR EACH ROW
BEGIN
    UPDATE content_feed 
    SET comments_count = (
        SELECT COUNT(*) FROM content_comments 
        WHERE content_id = NEW.content_id
    )
    WHERE id = NEW.content_id;
END$$
DELIMITER ;

-- Trigger para actualizar comments_count cuando se elimina un comentario
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS update_comments_count_delete
    AFTER DELETE ON content_comments
    FOR EACH ROW
BEGIN
    UPDATE content_feed 
    SET comments_count = (
        SELECT COUNT(*) FROM content_comments 
        WHERE content_id = OLD.content_id
    )
    WHERE id = OLD.content_id;
END$$
DELIMITER ;

-- ============================================
-- 5. DATOS DE EJEMPLO/MIGRACIÓN
-- ============================================

-- Migrar noticias existentes a content_feed (ajustar según tu estructura)
-- INSERT INTO content_feed (titulo, descripcion, resumen, image_url, type, original_id, published_at, original_url, is_oficial)
-- SELECT 
--     titulo,
--     descripcion,
--     resumen,
--     image_url,
--     1 as type,
--     id as original_id,
--     created_at as published_at,
--     url as original_url,
--     is_oficial
-- FROM news 
-- WHERE id NOT IN (SELECT original_id FROM content_feed WHERE type = 1);

-- Migrar posts de comunidad a content_feed (ajustar según tu estructura)
-- INSERT INTO content_feed (titulo, descripcion, image_url, type, original_id, user_id, user_name, published_at, video_url)
-- SELECT 
--     titulo,
--     descripcion,
--     image_url,
--     2 as type,
--     id as original_id,
--     user_id,
--     (SELECT nombre FROM users WHERE id = com.user_id) as user_name,
--     created_at as published_at,
--     video_url
-- FROM com 
-- WHERE id NOT IN (SELECT original_id FROM content_feed WHERE type = 2);

-- ============================================
-- 6. CONSULTAS DE VERIFICACIÓN
-- ============================================

-- Verificar que las tablas se crearon
SHOW TABLES LIKE 'content_%';

-- Ver estructura de content_feed
DESCRIBE content_feed;

-- Ver estructura de content_likes
DESCRIBE content_likes;

-- Ver estructura de content_comments
DESCRIBE content_comments;

-- Ver triggers creados
SHOW TRIGGERS LIKE '%content%';

-- ============================================
-- 7. CONSULTA DE PRUEBA PARA EL FEED CON is_liked
-- ============================================

-- Consulta que debería usar tu backend para el feed
-- (Reemplaza el 1 por el ID del usuario actual)
SELECT 
    cf.id,
    cf.titulo,
    cf.descripcion,
    cf.resumen,
    cf.image_url,
    cf.type,
    cf.original_id,
    cf.user_id,
    cf.user_name,
    cf.published_at,
    cf.created_at,
    cf.updated_at,
    cf.original_url,
    cf.is_oficial,
    cf.video_url,
    cf.likes_count,
    cf.comments_count,
    
    -- ⭐ CAMPO CRUCIAL: is_liked
    COALESCE(
        (SELECT TRUE FROM content_likes cl 
         WHERE cl.content_id = cf.id AND cl.user_id = 1), -- Reemplazar 1 por ID de usuario actual
        FALSE
    ) as is_liked
    
FROM content_feed cf
ORDER BY cf.published_at DESC
LIMIT 10;

-- ============================================
-- 8. ESTADÍSTICAS Y VERIFICACIÓN
-- ============================================

-- Mostrar estadísticas de las tablas
SELECT 
    'content_feed' as tabla,
    COUNT(*) as registros,
    COUNT(CASE WHEN type = 1 THEN 1 END) as noticias,
    COUNT(CASE WHEN type = 2 THEN 1 END) as comunidad,
    SUM(likes_count) as total_likes,
    SUM(comments_count) as total_comments
FROM content_feed

UNION ALL

SELECT 
    'content_likes' as tabla,
    COUNT(*) as registros,
    NULL as noticias,
    NULL as comunidad,
    COUNT(*) as total_likes,
    NULL as total_comments
FROM content_likes

UNION ALL

SELECT 
    'content_comments' as tabla,
    COUNT(*) as registros,
    NULL as noticias,
    NULL as comunidad,
    NULL as total_likes,
    COUNT(*) as total_comments
FROM content_comments; 