-- =========================================
-- SCRIPT DE VERIFICACIÓN DE TABLAS
-- Sistema de Feed Unificado - Trigamer Diario
-- =========================================

USE trigamer_diario;

-- Verificar que la base de datos existe y está seleccionada
SELECT DATABASE() as base_de_datos_actual;

-- Mostrar todas las tablas
SELECT 'TABLAS EN LA BASE DE DATOS:' as info;
SHOW TABLES;

-- Verificar estructura de tabla principal CONTENT_FEED
SELECT 'ESTRUCTURA DE CONTENT_FEED:' as info;
DESCRIBE content_feed;

-- Verificar estructura de USERS
SELECT 'ESTRUCTURA DE USERS:' as info;
DESCRIBE users;

-- Verificar estructura de NEWS
SELECT 'ESTRUCTURA DE NEWS:' as info;
DESCRIBE news;

-- Verificar estructura de COM
SELECT 'ESTRUCTURA DE COM:' as info;
DESCRIBE com;

-- Verificar índices de content_feed
SELECT 'ÍNDICES DE CONTENT_FEED:' as info;
SHOW INDEX FROM content_feed;

-- Contar registros en cada tabla
SELECT 'CONTEO DE REGISTROS:' as info;
SELECT 
  'users' as tabla, COUNT(*) as registros FROM users
UNION ALL
SELECT 
  'news' as tabla, COUNT(*) as registros FROM news
UNION ALL
SELECT 
  'com' as tabla, COUNT(*) as registros FROM com
UNION ALL
SELECT 
  'content_feed' as tabla, COUNT(*) as registros FROM content_feed
UNION ALL
SELECT 
  'likes' as tabla, COUNT(*) as registros FROM likes
UNION ALL
SELECT 
  'com_likes' as tabla, COUNT(*) as registros FROM com_likes
UNION ALL
SELECT 
  'comments' as tabla, COUNT(*) as registros FROM comments
UNION ALL
SELECT 
  'com_comments' as tabla, COUNT(*) as registros FROM com_comments;

-- Verificar usuario administrador
SELECT 'USUARIO ADMINISTRADOR:' as info;
SELECT id, nombre, email, rol FROM users WHERE rol = 'administrador';

-- Verificar foreign keys
SELECT 'FOREIGN KEYS CONFIGURADAS:' as info;
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM 
  INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE 
  REFERENCED_TABLE_SCHEMA = 'trigamer_diario'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Test de inserción básica (opcional)
SELECT 'ESTADO DE VERIFICACIÓN:' as resultado, 
       CASE 
         WHEN (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
               WHERE TABLE_SCHEMA = 'trigamer_diario') >= 8 
         THEN '✅ TODAS LAS TABLAS CREADAS CORRECTAMENTE'
         ELSE '❌ FALTAN TABLAS POR CREAR'
       END as estado; 