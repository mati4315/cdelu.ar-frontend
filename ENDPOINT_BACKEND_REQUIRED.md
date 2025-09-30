# 🚀 Endpoints Requeridos para Sistema de Seguimiento

## 📊 1. Estadísticas del Usuario

```javascript
// GET /api/v1/users/me/stats
app.get('/api/v1/users/me/stats', { preHandler: authenticate }, async (request, reply) => {
  const userId = request.user.id;
  
  const [stats] = await pool.execute(`
    SELECT 
      (SELECT COUNT(*) FROM user_follows WHERE follower_id = ?) as following_count,
      (SELECT COUNT(*) FROM user_follows WHERE following_id = ?) as followers_count,
      (SELECT COUNT(*) FROM com WHERE user_id = ?) as posts_count
  `, [userId, userId, userId]);
  
  return stats[0];
});
```

## 📝 2. Feed de Usuarios Seguidos

```javascript
// GET /api/v1/feed/following
app.get('/api/v1/feed/following', { preHandler: authenticate }, async (request, reply) => {
  const userId = request.user.id;
  const { page = 1, limit = 10 } = request.query;
  const offset = (page - 1) * limit;
  
  const [posts] = await pool.execute(`
    SELECT 
      f.id,
      f.type,
      f.original_id,
      f.title,
      f.description,
      f.media_url,
      f.created_at,
      f.comments_count,
      f.likes_count,
      u.nombre as user_name,
      u.profile_picture_url as user_profile_picture,
      u.id as user_id
    FROM feed f
    JOIN users u ON f.user_id = u.id
    JOIN user_follows uf ON uf.following_id = u.id
    WHERE uf.follower_id = ?
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
  `, [userId, limit, offset]);
  
  const [total] = await pool.execute(`
    SELECT COUNT(*) as count
    FROM feed f
    JOIN user_follows uf ON uf.following_id = f.user_id
    WHERE uf.follower_id = ?
  `, [userId]);
  
  return {
    data: posts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: total[0].count,
      hasMore: (page * limit) < total[0].count
    }
  };
});
```

## 🗄️ 3. Tabla user_follows

```sql
CREATE TABLE user_follows (
  id INT PRIMARY KEY AUTO_INCREMENT,
  follower_id INT NOT NULL,
  following_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_follow (follower_id, following_id)
);

-- Índices para performance
CREATE INDEX idx_follower_id ON user_follows(follower_id);
CREATE INDEX idx_following_id ON user_follows(following_id);
```

## ⚙️ 4. Quitar Simulación

Cuando implementes estos endpoints, comenta estas líneas:

```javascript
// En src/services/followService.ts línea 263
// return { following_count: 3, followers_count: 2, posts_count: 5 };

// En src/services/feedService.ts línea 177
// if (error.response?.status === 404) { ... }
```

¡Y todo funcionará con datos reales! 🎉
