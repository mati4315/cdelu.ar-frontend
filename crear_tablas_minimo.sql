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