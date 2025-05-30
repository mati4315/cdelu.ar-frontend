-- 🔍 Script de verificación después de crear las tablas
USE trigamer_diario;

-- Ver todas las tablas relacionadas con content
SHOW TABLES LIKE 'content_%';

-- Ver estructura de content_likes
DESCRIBE content_likes;

-- Ver si content_feed existe
SHOW TABLES LIKE 'content_feed';

-- Consulta de prueba para verificar funcionamiento
-- (Cambiar el 1 por tu ID de usuario real)
SELECT 
    'TEST: Verificando funcionamiento del sistema' as status,
    COUNT(*) as content_feed_records
FROM content_feed;

SELECT 
    'TEST: Tabla content_likes creada' as status,
    COUNT(*) as likes_records  
FROM content_likes;

-- Verificar que los índices se crearon correctamente
SHOW INDEX FROM content_likes; 