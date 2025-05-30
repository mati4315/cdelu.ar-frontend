-- 🛠️ Script para crear tabla content_likes
-- Base de datos: trigamer_diario

USE trigamer_diario;

-- 1. Crear tabla content_likes
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
    
    -- Claves foráneas (ajustar según tu estructura)
    FOREIGN KEY (content_id) REFERENCES content_feed(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Verificar que la tabla se creó correctamente
DESCRIBE content_likes;

-- 3. Crear algunos datos de prueba (opcional)
-- INSERT INTO content_likes (content_id, user_id) VALUES 
-- (1, 1),  -- Usuario 1 le dio like al contenido 1
-- (2, 1),  -- Usuario 1 le dio like al contenido 2
-- (1, 2);  -- Usuario 2 le dio like al contenido 1

-- 4. Consulta de prueba para verificar el campo is_liked
SELECT 
    cf.id,
    cf.titulo,
    cf.likes_count,
    COUNT(cl.id) as actual_likes_count,
    COALESCE(
        (SELECT TRUE FROM content_likes cl2 
         WHERE cl2.content_id = cf.id AND cl2.user_id = 1), -- Cambiar 1 por ID de usuario real
        FALSE
    ) as is_liked
FROM content_feed cf
LEFT JOIN content_likes cl ON cf.id = cl.content_id
GROUP BY cf.id
ORDER BY cf.published_at DESC
LIMIT 10;

-- 5. Actualizar contadores de likes existentes (si hay datos inconsistentes)
UPDATE content_feed cf 
SET likes_count = (
    SELECT COUNT(*) 
    FROM content_likes cl 
    WHERE cl.content_id = cf.id
);

-- 6. Mostrar estadísticas
SELECT 
    'content_feed' as tabla,
    COUNT(*) as total_registros,
    SUM(likes_count) as total_likes_reported
FROM content_feed
UNION ALL
SELECT 
    'content_likes' as tabla,
    COUNT(*) as total_registros,
    COUNT(*) as total_likes_actual
FROM content_likes; 