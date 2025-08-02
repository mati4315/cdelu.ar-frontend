-- =========================================
-- TRIGGERS DE SINCRONIZACIÓN AUTOMÁTICA
-- Sistema de Feed Unificado - Trigamer Diario
-- =========================================

USE trigamer_diario;

-- =========================================
-- TRIGGERS PARA TABLA NEWS
-- =========================================

-- Trigger: Cuando se crea una noticia → insertar en content_feed
DELIMITER $$

DROP TRIGGER IF EXISTS after_news_insert$$
CREATE TRIGGER after_news_insert
AFTER INSERT ON news
FOR EACH ROW
BEGIN
  INSERT INTO content_feed (
    titulo, 
    descripcion, 
    image_url, 
    type, 
    original_id, 
    user_id, 
    user_name, 
    published_at, 
    resumen, 
    original_url, 
    is_oficial,
    video_url,
    likes_count,
    comments_count
  ) VALUES (
    NEW.titulo,
    NEW.descripcion,
    NEW.image_url,
    1, -- type = 1 para news
    NEW.id,
    NEW.created_by,
    (SELECT nombre FROM users WHERE id = NEW.created_by),
    COALESCE(NEW.published_at, NEW.created_at),
    NEW.resumen,
    NEW.original_url,
    NEW.is_oficial,
    NULL, -- video_url solo para com
    0, -- likes_count inicial
    0  -- comments_count inicial
  );
END$$

-- Trigger: Cuando se actualiza una noticia → actualizar en content_feed
DROP TRIGGER IF EXISTS after_news_update$$
CREATE TRIGGER after_news_update
AFTER UPDATE ON news
FOR EACH ROW
BEGIN
  UPDATE content_feed SET
    titulo = NEW.titulo,
    descripcion = NEW.descripcion,
    image_url = NEW.image_url,
    published_at = COALESCE(NEW.published_at, NEW.created_at),
    resumen = NEW.resumen,
    original_url = NEW.original_url,
    is_oficial = NEW.is_oficial,
    updated_at = NOW()
  WHERE type = 1 AND original_id = NEW.id;
END$$

-- Trigger: Cuando se elimina una noticia → eliminar de content_feed
DROP TRIGGER IF EXISTS after_news_delete$$
CREATE TRIGGER after_news_delete
AFTER DELETE ON news
FOR EACH ROW
BEGIN
  DELETE FROM content_feed 
  WHERE type = 1 AND original_id = OLD.id;
END$$

-- =========================================
-- TRIGGERS PARA TABLA COM
-- =========================================

-- Trigger: Cuando se crea contenido de comunidad → insertar en content_feed
DROP TRIGGER IF EXISTS after_com_insert$$
CREATE TRIGGER after_com_insert
AFTER INSERT ON com
FOR EACH ROW
BEGIN
  INSERT INTO content_feed (
    titulo, 
    descripcion, 
    image_url, 
    type, 
    original_id, 
    user_id, 
    user_name, 
    published_at, 
    resumen, 
    original_url, 
    is_oficial,
    video_url,
    likes_count,
    comments_count
  ) VALUES (
    NEW.titulo,
    NEW.descripcion,
    NEW.image_url,
    2, -- type = 2 para com
    NEW.id,
    NEW.user_id,
    (SELECT nombre FROM users WHERE id = NEW.user_id),
    NEW.created_at,
    NULL, -- resumen solo para news
    NULL, -- original_url solo para news
    NULL, -- is_oficial solo para news
    NEW.video_url,
    0, -- likes_count inicial
    0  -- comments_count inicial
  );
END$$

-- Trigger: Cuando se actualiza contenido de comunidad → actualizar en content_feed
DROP TRIGGER IF EXISTS after_com_update$$
CREATE TRIGGER after_com_update
AFTER UPDATE ON com
FOR EACH ROW
BEGIN
  UPDATE content_feed SET
    titulo = NEW.titulo,
    descripcion = NEW.descripcion,
    image_url = NEW.image_url,
    video_url = NEW.video_url,
    updated_at = NOW()
  WHERE type = 2 AND original_id = NEW.id;
END$$

-- Trigger: Cuando se elimina contenido de comunidad → eliminar de content_feed
DROP TRIGGER IF EXISTS after_com_delete$$
CREATE TRIGGER after_com_delete
AFTER DELETE ON com
FOR EACH ROW
BEGIN
  DELETE FROM content_feed 
  WHERE type = 2 AND original_id = OLD.id;
END$$

-- =========================================
-- TRIGGERS PARA LIKES (NOTICIAS)
-- =========================================

-- Trigger: Cuando se da like a noticia → incrementar contador
DROP TRIGGER IF EXISTS after_likes_insert$$
CREATE TRIGGER after_likes_insert
AFTER INSERT ON likes
FOR EACH ROW
BEGIN
  UPDATE content_feed SET
    likes_count = likes_count + 1,
    updated_at = NOW()
  WHERE type = 1 AND original_id = NEW.news_id;
END$$

-- Trigger: Cuando se quita like de noticia → decrementar contador
DROP TRIGGER IF EXISTS after_likes_delete$$
CREATE TRIGGER after_likes_delete
AFTER DELETE ON likes
FOR EACH ROW
BEGIN
  UPDATE content_feed SET
    likes_count = GREATEST(likes_count - 1, 0),
    updated_at = NOW()
  WHERE type = 1 AND original_id = OLD.news_id;
END$$

-- =========================================
-- TRIGGERS PARA COM_LIKES (COMUNIDAD)
-- =========================================

-- Trigger: Cuando se da like a comunidad → incrementar contador
DROP TRIGGER IF EXISTS after_com_likes_insert$$
CREATE TRIGGER after_com_likes_insert
AFTER INSERT ON com_likes
FOR EACH ROW
BEGIN
  UPDATE content_feed SET
    likes_count = likes_count + 1,
    updated_at = NOW()
  WHERE type = 2 AND original_id = NEW.com_id;
END$$

-- Trigger: Cuando se quita like de comunidad → decrementar contador
DROP TRIGGER IF EXISTS after_com_likes_delete$$
CREATE TRIGGER after_com_likes_delete
AFTER DELETE ON com_likes
FOR EACH ROW
BEGIN
  UPDATE content_feed SET
    likes_count = GREATEST(likes_count - 1, 0),
    updated_at = NOW()
  WHERE type = 2 AND original_id = OLD.com_id;
END$$

-- =========================================
-- TRIGGERS PARA COMMENTS (NOTICIAS)
-- =========================================

-- Trigger: Cuando se crea comentario en noticia → incrementar contador
DROP TRIGGER IF EXISTS after_comments_insert$$
CREATE TRIGGER after_comments_insert
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
  UPDATE content_feed SET
    comments_count = comments_count + 1,
    updated_at = NOW()
  WHERE type = 1 AND original_id = NEW.news_id;
END$$

-- Trigger: Cuando se elimina comentario de noticia → decrementar contador
DROP TRIGGER IF EXISTS after_comments_delete$$
CREATE TRIGGER after_comments_delete
AFTER DELETE ON comments
FOR EACH ROW
BEGIN
  UPDATE content_feed SET
    comments_count = GREATEST(comments_count - 1, 0),
    updated_at = NOW()
  WHERE type = 1 AND original_id = OLD.news_id;
END$$

-- =========================================
-- TRIGGERS PARA COM_COMMENTS (COMUNIDAD)
-- =========================================

-- Trigger: Cuando se crea comentario en comunidad → incrementar contador
DROP TRIGGER IF EXISTS after_com_comments_insert$$
CREATE TRIGGER after_com_comments_insert
AFTER INSERT ON com_comments
FOR EACH ROW
BEGIN
  UPDATE content_feed SET
    comments_count = comments_count + 1,
    updated_at = NOW()
  WHERE type = 2 AND original_id = NEW.com_id;
END$$

-- Trigger: Cuando se elimina comentario de comunidad → decrementar contador
DROP TRIGGER IF EXISTS after_com_comments_delete$$
CREATE TRIGGER after_com_comments_delete
AFTER DELETE ON com_comments
FOR EACH ROW
BEGIN
  UPDATE content_feed SET
    comments_count = GREATEST(comments_count - 1, 0),
    updated_at = NOW()
  WHERE type = 2 AND original_id = OLD.com_id;
END$$

DELIMITER ;

-- =========================================
-- VERIFICACIÓN DE TRIGGERS CREADOS
-- =========================================

SELECT 'TRIGGERS CREADOS EXITOSAMENTE:' as status;

SHOW TRIGGERS WHERE Db = 'trigamer_diario';

SELECT 'CONFIGURACIÓN COMPLETADA ✅' as resultado; 