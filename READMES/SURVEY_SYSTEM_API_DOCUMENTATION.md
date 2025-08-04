# Sistema de Encuestas - Documentación API

## Descripción General

El sistema de encuestas permite a los administradores crear encuestas con múltiples opciones de respuesta y a los usuarios votar en ellas. El sistema incluye:

- ✅ Creación de encuestas por administradores
- ✅ Múltiples opciones de respuesta
- ✅ Votación pública (con control de duplicados por IP)
- ✅ Votación para usuarios registrados
- ✅ Estadísticas en tiempo real
- ✅ Encuestas de selección única o múltiple
- ✅ Fechas de expiración
- ✅ Control de votos por usuario

## Estructura de Base de Datos

### Tablas Principales

1. **surveys** - Encuestas principales
2. **survey_options** - Opciones de respuesta
3. **survey_votes** - Registro de votos
4. **survey_stats** - Estadísticas cacheadas

## Endpoints de la API

### 🔓 Endpoints Públicos (Sin Autenticación)

#### 1. Obtener Todas las Encuestas
```
GET /api/v1/surveys
```

**Parámetros de consulta:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, max: 100)
- `status` (opcional): Estado de encuestas ('active', 'inactive', 'completed', 'all')

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Encuesta de Ejemplo",
      "description": "Descripción de la encuesta",
      "question": "¿Cuál es tu color favorito?",
      "status": "active",
      "is_multiple_choice": false,
      "max_votes_per_user": 1,
      "total_votes": 15,
      "options_count": 4,
      "created_at": "2024-01-15T10:30:00.000Z",
      "options": [
        {
          "id": 1,
          "option_text": "Rojo",
          "votes_count": 5,
          "display_order": 1
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### 2. Obtener Encuestas Activas
```
GET /api/v1/surveys/active
```

**Parámetros de consulta:**
- `limit` (opcional): Número de encuestas (default: 5, max: 20)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Encuesta Activa",
      "question": "¿Cuál es tu color favorito?",
      "is_multiple_choice": false,
      "max_votes_per_user": 1,
      "total_votes": 15,
      "options_count": 4,
      "options": [
        {
          "id": 1,
          "option_text": "Rojo"
        }
      ]
    }
  ]
}
```

#### 3. Obtener Encuesta Específica
```
GET /api/v1/surveys/:id
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Encuesta de Ejemplo",
    "description": "Descripción de la encuesta",
    "question": "¿Cuál es tu color favorito?",
    "status": "active",
    "is_multiple_choice": false,
    "max_votes_per_user": 1,
    "total_votes": 15,
    "user_voted": false,
    "user_votes": [],
    "options": [
      {
        "id": 1,
        "option_text": "Rojo",
        "votes_count": 5,
        "percentage": 33.33,
        "display_order": 1
      }
    ]
  }
}
```

#### 4. Obtener Estadísticas de Encuesta
```
GET /api/v1/surveys/:id/stats
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Encuesta de Ejemplo",
    "question": "¿Cuál es tu color favorito?",
    "total_votes": 15,
    "registered_voters": 8,
    "unique_ips": 12,
    "options": [
      {
        "id": 1,
        "option_text": "Rojo",
        "votes_count": 5,
        "percentage": 33.33
      }
    ]
  }
}
```

#### 5. Votar en Encuesta
```
POST /api/v1/surveys/:id/vote
```

**Body:**
```json
{
  "option_ids": [1, 2]
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Voto registrado exitosamente"
}
```

### 🔐 Endpoints de Administrador (Requieren Autenticación)

#### 6. Crear Nueva Encuesta
```
POST /api/v1/surveys
```

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "Nueva Encuesta",
  "description": "Descripción opcional",
  "question": "¿Cuál es tu deporte favorito?",
  "options": ["Fútbol", "Básquet", "Tenis", "Otro"],
  "is_multiple_choice": false,
  "max_votes_per_user": 1,
  "expires_at": "2024-02-15T23:59:59.000Z"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Encuesta creada exitosamente",
  "data": {
    "id": 2
  }
}
```

#### 7. Actualizar Encuesta
```
PUT /api/v1/surveys/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "Título actualizado",
  "status": "inactive",
  "expires_at": "2024-02-20T23:59:59.000Z"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Encuesta actualizada exitosamente"
}
```

#### 8. Eliminar Encuesta
```
DELETE /api/v1/surveys/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Encuesta eliminada exitosamente"
}
```

## Códigos de Error

### Errores Comunes

```json
{
  "success": false,
  "error": "Encuesta no encontrada",
  "message": "La encuesta solicitada no existe"
}
```

```json
{
  "success": false,
  "error": "Ya votaste",
  "message": "Ya has votado en esta encuesta"
}
```

```json
{
  "success": false,
  "error": "Demasiados votos",
  "message": "Solo se permiten 1 voto(s) por usuario"
}
```

```json
{
  "success": false,
  "error": "Datos inválidos",
  "message": "Se requiere título, pregunta y al menos 2 opciones"
}
```

## Estados de Encuesta

- **active**: Encuesta activa y disponible para votar
- **inactive**: Encuesta pausada temporalmente
- **completed**: Encuesta finalizada

## Tipos de Votación

- **Selección única**: `is_multiple_choice: false`
- **Selección múltiple**: `is_multiple_choice: true`

## Control de Votos

- **Usuarios registrados**: Control por `user_id`
- **Usuarios anónimos**: Control por `user_ip`
- **Límite configurable**: `max_votes_per_user`

## Ejemplos de Uso Frontend

### 1. Mostrar Encuestas Activas en el Feed

```javascript
// Obtener encuestas activas
const response = await fetch('/api/v1/surveys/active?limit=3');
const data = await response.json();

if (data.success) {
  data.data.forEach(survey => {
    // Renderizar encuesta en el feed
    renderSurveyInFeed(survey);
  });
}
```

### 2. Mostrar Encuesta Completa con Resultados

```javascript
// Obtener encuesta específica
const response = await fetch('/api/v1/surveys/1');
const data = await response.json();

if (data.success) {
  const survey = data.data;
  
  // Mostrar pregunta y opciones
  renderSurveyQuestion(survey);
  
  // Mostrar resultados si el usuario ya votó
  if (survey.user_voted) {
    renderSurveyResults(survey);
  } else {
    renderSurveyOptions(survey);
  }
}
```

### 3. Procesar Voto de Usuario

```javascript
// Votar en encuesta
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

const result = await response.json();

if (result.success) {
  // Mostrar confirmación y actualizar resultados
  showVoteConfirmation();
  refreshSurveyResults();
} else {
  // Mostrar error
  showError(result.message);
}
```

### 4. Panel de Administración

```javascript
// Obtener todas las encuestas para admin
const response = await fetch('/api/v1/surveys?status=all&limit=50', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const data = await response.json();

if (data.success) {
  // Renderizar lista de encuestas
  renderAdminSurveyList(data.data);
}
```

## Configuración Inicial

### 1. Ejecutar Migración de Base de Datos

```bash
node setup-surveys-database.js
```

### 2. Verificar Instalación

```bash
# Verificar que las tablas se crearon
mysql -u usuario -p base_datos -e "SHOW TABLES LIKE 'survey%';"

# Verificar datos de ejemplo
mysql -u usuario -p base_datos -e "SELECT * FROM surveys;"
```

## Notas Importantes

1. **Seguridad**: Los votos se controlan por IP para usuarios anónimos y por user_id para usuarios registrados
2. **Rendimiento**: Las estadísticas se calculan en tiempo real pero se pueden cachear
3. **Escalabilidad**: El sistema está diseñado para manejar múltiples encuestas simultáneas
4. **Compatibilidad**: Funciona con usuarios registrados y anónimos
5. **Flexibilidad**: Soporta encuestas de selección única y múltiple

## Próximos Pasos para el Frontend

1. **Crear componente de encuesta** para mostrar en el feed
2. **Implementar modal de votación** con opciones
3. **Mostrar resultados** con barras de progreso
4. **Panel de administración** para crear/editar encuestas
5. **Integración con el sistema de autenticación** existente
6. **Diseño responsive** para móviles y desktop

## Contacto

Para dudas sobre la implementación, consultar con el equipo de backend. 