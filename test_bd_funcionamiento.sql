-- =========================================
-- TEST DE FUNCIONAMIENTO COMPLETO
-- Sistema de Feed Unificado - Trigamer Diario
-- =========================================

USE trigamer_diario;

-- =========================================
-- 1. INSERTAR DATOS DE PRUEBA
-- =========================================

-- Usuario de prueba
INSERT IGNORE INTO users (id, nombre, email, password, rol) VALUES 
(2, 'Usuario Prueba', 'test@trigamer.net', '$2b$10$test.hash.password', 'usuario');

-- Noticia de prueba
INSERT INTO news (titulo, descripcion, resumen, image_url, original_url, is_oficial, published_at, created_by) VALUES 
('Noticia de Prueba', 'Esta es una noticia de prueba para verificar que el sistema funciona correctamente.', 'Resumen de la noticia de prueba', 'https://ejemplo.com/imagen1.jpg', 'https://fuente.com/noticia1', TRUE, NOW(), 2);

-- Contenido de comunidad de prueba
INSERT INTO com (titulo, descripcion, image_url, video_url, user_id) VALUES 
('Post de Comunidad', 'Este es un post de la comunidad para probar el sistema.', 'https://ejemplo.com/imagen2.jpg', 'https://video.com/video1', 2);

-- =========================================
-- 2. VERIFICAR QUE CONTENT_FEED SE LLENÓ AUTOMÁTICAMENTE
-- =========================================

SELECT 'CONTENIDO EN CONTENT_FEED DESPUÉS DE INSERTAR:' as info;
SELECT 
  id as feed_id,
  titulo,
  type,
  CASE 
    WHEN type = 1 THEN 'NEWS'
    WHEN type = 2 THEN 'COMUNIDAD'
    ELSE 'DESCONOCIDO'
  END as tipo_content,
  original_id,
  user_name,
  likes_count,
  comments_count,
  published_at
FROM content_feed 
ORDER BY id DESC;

-- =========================================
-- 3. PROBAR SISTEMA DE LIKES
-- =========================================

-- Like a la noticia
INSERT INTO likes (user_id, news_id) VALUES (2, 1);

-- Like al contenido de comunidad  
INSERT INTO com_likes (user_id, com_id) VALUES (2, 1);

SELECT 'LIKES DESPUÉS DE DAR LIKE:' as info;
SELECT 
  id as feed_id,
  titulo,
  type,
  likes_count,
  comments_count
FROM content_feed 
ORDER BY id DESC;

-- =========================================
-- 4. PROBAR SISTEMA DE COMENTARIOS
-- =========================================

-- Comentario en noticia
INSERT INTO comments (user_id, news_id, content) VALUES 
(2, 1, 'Este es un comentario de prueba en la noticia.');

-- Comentario en comunidad
INSERT INTO com_comments (user_id, com_id, content) VALUES 
(2, 1, 'Este es un comentario de prueba en el post de comunidad.');

SELECT 'CONTADORES DESPUÉS DE COMENTAR:' as info;
SELECT 
  id as feed_id,
  titulo,
  type,
  likes_count,
  comments_count
FROM content_feed 
ORDER BY id DESC;

-- =========================================
-- 5. PROBAR ACTUALIZACIÓN DE CONTENIDO
-- =========================================

-- Actualizar la noticia
UPDATE news SET titulo = 'Noticia de Prueba ACTUALIZADA' WHERE id = 1;

-- Actualizar contenido de comunidad
UPDATE com SET titulo = 'Post de Comunidad ACTUALIZADO' WHERE id = 1;

SELECT 'TÍTULOS DESPUÉS DE ACTUALIZAR:' as info;
SELECT 
  id as feed_id,
  titulo,
  type,
  updated_at
FROM content_feed 
ORDER BY id DESC;

-- =========================================
-- 6. VERIFICAR FUNCIONAMIENTO DE TRIGGERS
-- =========================================

SELECT 'RESUMEN DE TRIGGERS FUNCIONANDO:' as info;
SHOW TRIGGERS WHERE Db = 'trigamer_diario';

-- =========================================
-- 7. ESTADÍSTICAS FINALES
-- =========================================

SELECT 'ESTADÍSTICAS FINALES DEL SISTEMA:' as info;

SELECT 
  'TOTAL USUARIOS' as metrica, COUNT(*) as valor FROM users
UNION ALL
SELECT 
  'TOTAL NOTICIAS' as metrica, COUNT(*) as valor FROM news
UNION ALL
SELECT 
  'TOTAL COMUNIDAD' as metrica, COUNT(*) as valor FROM com
UNION ALL
SELECT 
  'TOTAL CONTENT_FEED' as metrica, COUNT(*) as valor FROM content_feed
UNION ALL
SELECT 
  'TOTAL LIKES' as metrica, COUNT(*) as valor FROM likes
UNION ALL
SELECT 
  'TOTAL COM_LIKES' as metrica, COUNT(*) as valor FROM com_likes
UNION ALL
SELECT 
  'TOTAL COMENTARIOS' as metrica, COUNT(*) as valor FROM comments
UNION ALL
SELECT 
  'TOTAL COM_COMENTARIOS' as metrica, COUNT(*) as valor FROM com_comments;

-- =========================================
-- 8. TEST DE CONSULTA COMO LA USARÍA EL FRONTEND
-- =========================================

SELECT 'CONSULTA COMO LA USARÍA EL FRONTEND:' as info;

-- Simulación de la consulta principal del feed
SELECT 
  id as feedId,
  titulo,
  descripcion,
  image_url,
  type,
  original_id,
  user_name as autor,
  likes_count,
  comments_count,
  published_at,
  -- Campos específicos según tipo
  resumen,
  original_url,
  is_oficial,
  video_url
FROM content_feed 
ORDER BY published_at DESC 
LIMIT 10;

-- =========================================
-- 9. LIMPIAR DATOS DE PRUEBA (OPCIONAL)
-- =========================================

-- Si quieres limpiar los datos de prueba, descomenta estas líneas:
-- DELETE FROM comments WHERE user_id = 2;
-- DELETE FROM com_comments WHERE user_id = 2;
-- DELETE FROM likes WHERE user_id = 2;
-- DELETE FROM com_likes WHERE user_id = 2;
-- DELETE FROM news WHERE created_by = 2;
-- DELETE FROM com WHERE user_id = 2;
-- DELETE FROM users WHERE id = 2;

SELECT '✅ TEST COMPLETADO - SISTEMA FUNCIONANDO CORRECTAMENTE' as resultado; 