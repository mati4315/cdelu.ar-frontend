# Sistema de Encuestas - CdelU

## 🎯 Descripción

Sistema completo de encuestas para el portal CdelU que permite a los administradores crear encuestas con múltiples opciones de respuesta y a los usuarios votar en ellas.

## ✨ Características

- ✅ **Creación de encuestas** por administradores
- ✅ **Múltiples opciones** de respuesta
- ✅ **Votación pública** con control de duplicados por IP
- ✅ **Votación para usuarios registrados** con control por user_id
- ✅ **Estadísticas en tiempo real** con porcentajes
- ✅ **Encuestas de selección única o múltiple**
- ✅ **Fechas de expiración** configurables
- ✅ **Control de votos por usuario** (1-N votos)
- ✅ **API REST completa** con documentación
- ✅ **Validaciones robustas** y manejo de errores
- ✅ **Triggers automáticos** para estadísticas

## 🚀 Instalación

### 1. Configurar Base de Datos

```bash
# Ejecutar el script de configuración
node setup-surveys-database.js
```

### 2. Verificar Instalación

```bash
# Probar el sistema
node test-survey-system.js
```

### 3. Reiniciar Servidor

```bash
# Reiniciar el servidor para cargar las nuevas rutas
npm restart
```

## 📊 Estructura de Base de Datos

### Tablas Creadas

1. **`surveys`** - Encuestas principales
   - `id`, `title`, `description`, `question`
   - `status` (active/inactive/completed)
   - `is_multiple_choice`, `max_votes_per_user`
   - `created_by`, `created_at`, `updated_at`
   - `expires_at`, `total_votes`

2. **`survey_options`** - Opciones de respuesta
   - `id`, `survey_id`, `option_text`
   - `votes_count`, `display_order`
   - `created_at`, `updated_at`

3. **`survey_votes`** - Registro de votos
   - `id`, `survey_id`, `option_id`
   - `user_id` (NULL para anónimos)
   - `user_ip`, `user_agent`, `voted_at`

4. **`survey_stats`** - Estadísticas cacheadas
   - `id`, `survey_id`, `total_votes`
   - `unique_voters`, `last_updated`

### Triggers Automáticos

- **`update_option_votes_count`** - Actualiza contadores al votar
- **`update_option_votes_count_delete`** - Actualiza contadores al eliminar voto
- **`create_survey_stats`** - Crea estadísticas al crear encuesta

## 🔌 Endpoints de la API

### Endpoints Públicos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/surveys` | Obtener todas las encuestas |
| GET | `/api/v1/surveys/active` | Obtener encuestas activas |
| GET | `/api/v1/surveys/:id` | Obtener encuesta específica |
| GET | `/api/v1/surveys/:id/stats` | Obtener estadísticas |
| POST | `/api/v1/surveys/:id/vote` | Votar en encuesta |

### Endpoints de Administrador

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/surveys` | Crear nueva encuesta |
| PUT | `/api/v1/surveys/:id` | Actualizar encuesta |
| DELETE | `/api/v1/surveys/:id` | Eliminar encuesta |

## 📝 Ejemplos de Uso

### Crear Encuesta (Admin)

```javascript
const surveyData = {
  title: "Encuesta de Deportes",
  description: "¿Cuál es tu deporte favorito?",
  question: "¿Qué deporte prefieres ver?",
  options: ["Fútbol", "Básquet", "Tenis", "Otro"],
  is_multiple_choice: false,
  max_votes_per_user: 1,
  expires_at: "2024-02-15T23:59:59.000Z"
};

const response = await fetch('/api/v1/surveys', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify(surveyData)
});
```

### Votar en Encuesta

```javascript
const voteData = {
  option_ids: [1, 2] // Para selección múltiple
};

const response = await fetch('/api/v1/surveys/1/vote', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(voteData)
});
```

### Obtener Encuestas Activas

```javascript
const response = await fetch('/api/v1/surveys/active?limit=5');
const data = await response.json();

if (data.success) {
  data.data.forEach(survey => {
    console.log(`Encuesta: ${survey.title}`);
    console.log(`Pregunta: ${survey.question}`);
    console.log(`Opciones: ${survey.options.length}`);
  });
}
```

## 🔒 Seguridad

### Control de Votos

- **Usuarios registrados**: Control por `user_id`
- **Usuarios anónimos**: Control por `user_ip`
- **Prevención de duplicados**: Restricciones únicas en base de datos
- **Límite configurable**: `max_votes_per_user`

### Validaciones

- ✅ Título y pregunta requeridos
- ✅ Mínimo 2 opciones de respuesta
- ✅ Máximo 10 opciones por encuesta
- ✅ Validación de fechas de expiración
- ✅ Control de estados de encuesta
- ✅ Validación de opciones existentes

## 📈 Estadísticas

### Métricas Disponibles

- **Total de votos** por encuesta
- **Votantes registrados** vs anónimos
- **IPs únicas** para usuarios anónimos
- **Porcentajes** por opción
- **Opciones más votadas**
- **Tendencias** de participación

### Ejemplo de Respuesta de Estadísticas

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Encuesta de Ejemplo",
    "question": "¿Cuál es tu color favorito?",
    "total_votes": 150,
    "registered_voters": 80,
    "unique_ips": 120,
    "options": [
      {
        "id": 1,
        "option_text": "Rojo",
        "votes_count": 45,
        "percentage": 30.0
      }
    ]
  }
}
```

## 🛠️ Mantenimiento

### Comandos Útiles

```bash
# Verificar estado de las tablas
mysql -u usuario -p base_datos -e "SHOW TABLES LIKE 'survey%';"

# Ver encuestas activas
mysql -u usuario -p base_datos -e "SELECT id, title, status, total_votes FROM surveys WHERE status = 'active';"

# Ver estadísticas de votos
mysql -u usuario -p base_datos -e "SELECT survey_id, COUNT(*) as votes FROM survey_votes GROUP BY survey_id;"

# Limpiar encuestas expiradas
mysql -u usuario -p base_datos -e "UPDATE surveys SET status = 'completed' WHERE expires_at < NOW() AND status = 'active';"
```

### Logs y Monitoreo

- Los logs del sistema incluyen información de encuestas
- Monitorear endpoints `/api/v1/surveys/*` para métricas
- Verificar triggers automáticos funcionando correctamente

## 🔧 Troubleshooting

### Problemas Comunes

1. **Error "Table doesn't exist"**
   ```bash
   node setup-surveys-database.js
   ```

2. **Error de conexión a base de datos**
   ```bash
   # Verificar configuración en src/config/database.js
   # Verificar variables de entorno
   ```

3. **Endpoints no responden**
   ```bash
   # Verificar que las rutas estén registradas en app.js
   # Reiniciar el servidor
   ```

4. **Votos no se registran**
   ```bash
   # Verificar triggers de base de datos
   # Verificar restricciones únicas
   ```

## 📚 Documentación Adicional

- **API Documentation**: `SURVEY_SYSTEM_API_DOCUMENTATION.md`
- **Base de Datos**: `sql/create_surveys_tables.sql`
- **Pruebas**: `test-survey-system.js`
- **Configuración**: `setup-surveys-database.js`

## 🤝 Contribución

Para reportar bugs o solicitar nuevas características:

1. Verificar que el problema no esté documentado
2. Probar con los scripts de prueba
3. Revisar logs del servidor
4. Contactar al equipo de desarrollo

## 📞 Soporte

- **Documentación**: Ver archivos `.md` incluidos
- **Pruebas**: Ejecutar `test-survey-system.js`
- **Configuración**: Ejecutar `setup-surveys-database.js`
- **Logs**: Revisar logs del servidor para errores

---

**Sistema de Encuestas CdelU** - Versión 1.0.0 