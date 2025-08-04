# Sistema de Encuestas - Frontend Vue.js

## 🎯 Descripción

Implementación completa del sistema de encuestas en el frontend Vue.js para el portal CdelU. El sistema permite a los usuarios votar en encuestas y a los administradores gestionarlas.

## ✨ Características Implementadas

### Para Usuarios
- ✅ **Votación en encuestas** con interfaz intuitiva
- ✅ **Encuestas de selección única y múltiple**
- ✅ **Visualización de resultados** con barras de progreso
- ✅ **Control de votos** (no se puede votar dos veces)
- ✅ **Integración en el feed** principal
- ✅ **Diseño responsive** para móviles y desktop
- ✅ **Tema oscuro/claro** compatible

### Para Administradores
- ✅ **Panel de administración** completo
- ✅ **Creación de encuestas** con formulario avanzado
- ✅ **Edición de encuestas** existentes
- ✅ **Eliminación de encuestas**
- ✅ **Gestión de estados** (activa, inactiva, completada)
- ✅ **Estadísticas en tiempo real**

## 🚀 Instalación y Configuración

### 1. Verificar Dependencias

El sistema utiliza las siguientes dependencias que ya están en el proyecto:

```json
{
  "vue": "^3.x",
  "pinia": "^2.x",
  "axios": "^1.x",
  "tailwindcss": "^3.x"
}
```

### 2. Configurar Variables de Entorno

Asegúrate de que tu archivo `.env` tenga la URL de la API:

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

### 3. Verificar Backend

El sistema requiere que el backend esté configurado con las tablas de encuestas. Ejecuta:

```bash
# En el backend
node setup-surveys-database.js
node test-survey-system.js
```

## 📁 Estructura de Archivos

```
src/
├── types/
│   └── survey.ts              # Tipos TypeScript para encuestas
├── services/
│   └── surveyService.ts       # Servicio para API de encuestas
├── store/
│   └── survey.ts              # Store Pinia para estado de encuestas
├── components/
│   └── survey/
│       ├── SurveyCard.vue     # Componente de encuesta individual
│       ├── SurveyList.vue     # Lista de encuestas
│       └── SurveyForm.vue     # Formulario de creación/edición
├── views/
│   ├── SurveyView.vue         # Vista principal de encuestas
│   └── SurveyAdminView.vue    # Panel de administración
├── composables/
│   └── useSurveys.ts          # Composable para lógica de encuestas
└── components/feed/
    └── FeedSurveyItem.vue     # Componente de encuesta para el feed
```

## 🔧 Uso del Sistema

### Para Usuarios

#### 1. Ver Encuestas en el Feed

Las encuestas se muestran automáticamente en el feed principal:

```vue
<template>
  <FeedMain />
</template>
```

#### 2. Ver Todas las Encuestas

Navega a `/surveys` para ver todas las encuestas disponibles:

```vue
<template>
  <SurveyView />
</template>
```

#### 3. Votar en una Encuesta

```vue
<template>
  <SurveyCard 
    :survey="survey"
    @vote-success="handleVoteSuccess"
  />
</template>

<script setup>
import { useSurveyStore } from '@/store/survey';

const surveyStore = useSurveyStore();

const handleVoteSuccess = (surveyId) => {
  console.log('Voto registrado en encuesta:', surveyId);
};
</script>
```

### Para Administradores

#### 1. Acceder al Panel de Administración

Navega a `/surveys/admin` (requiere autenticación de administrador).

#### 2. Crear Nueva Encuesta

```vue
<template>
  <SurveyForm @submit="handleCreateSurvey" />
</template>

<script setup>
const handleCreateSurvey = async (formData) => {
  const result = await surveyStore.createSurvey(formData);
  if (result.success) {
    console.log('Encuesta creada:', result.id);
  }
};
</script>
```

#### 3. Editar Encuesta Existente

```vue
<template>
  <SurveyForm 
    :survey="survey"
    @submit="handleUpdateSurvey"
  />
</template>
```

## 🎨 Componentes Principales

### SurveyCard

Componente para mostrar una encuesta individual con opciones de votación:

```vue
<SurveyCard 
  :survey="survey"
  @vote-success="handleVoteSuccess"
/>
```

**Props:**
- `survey`: Objeto Survey con toda la información

**Events:**
- `vote-success`: Emitido cuando se registra un voto exitosamente

### SurveyList

Componente para mostrar una lista de encuestas:

```vue
<SurveyList 
  type="active"
  :limit="10"
  @vote-success="handleVoteSuccess"
/>
```

**Props:**
- `type`: 'active' | 'all' | 'completed'
- `limit`: Número máximo de encuestas a mostrar
- `autoLoad`: Si debe cargar automáticamente

### SurveyForm

Formulario para crear y editar encuestas:

```vue
<SurveyForm 
  :survey="survey" // Opcional, para edición
  @submit="handleSubmit"
  @cancel="handleCancel"
/>
```

## 🔌 Integración con el Feed

### 1. Cargar Encuestas en el Feed

```javascript
import { useSurveys } from '@/composables/useSurveys';

const { loadFeedSurveys, getSurveysForFeed } = useSurveys();

// Cargar encuestas al inicializar
await loadFeedSurveys(3);

// Obtener encuestas para insertar en el feed
const surveys = getSurveysForFeed(2);
```

### 2. Insertar Encuestas en el Feed

```javascript
const { insertSurveysInFeed } = useSurveys();

// Insertar encuestas cada 4 items del feed
const feedWithSurveys = insertSurveysInFeed(feedItems, surveys, 4);
```

### 3. Renderizar Encuestas en el Feed

```vue
<template>
  <div v-for="item in feedItems" :key="item.id">
    <!-- Contenido normal -->
    <FeedItem v-if="!item.is_survey" :item="item" />
    
    <!-- Encuesta -->
    <FeedSurveyItem 
      v-else-if="item.is_survey"
      :survey="item.survey"
      @view-details="handleSurveyDetails"
    />
  </div>
</template>
```

## 📊 Estado y Store

### SurveyStore (Pinia)

```javascript
import { useSurveyStore } from '@/store/survey';

const surveyStore = useSurveyStore();

// Cargar encuestas activas
await surveyStore.loadActiveSurveys(5);

// Votar en encuesta
const result = await surveyStore.voteSurvey(id, { option_ids: [1, 2] });

// Crear encuesta (admin)
const result = await surveyStore.createSurvey(surveyData);
```

### Estado Disponible

```javascript
// Encuestas activas
const activeSurveys = surveyStore.activeSurveys;

// Encuesta actual
const currentSurvey = surveyStore.currentSurvey;

// Estado de carga
const loading = surveyStore.loading;

// Errores
const error = surveyStore.error;
```

## 🎯 Rutas Disponibles

### Rutas Públicas

- `/surveys` - Vista principal de encuestas
- `/surveys/:id` - Detalle de encuesta específica

### Rutas de Administrador

- `/surveys/admin` - Panel de administración (requiere auth)

## 🔒 Seguridad

### Autenticación

- Las rutas de administración requieren autenticación
- Los votos se controlan por IP (usuarios anónimos) o user_id (registrados)
- Validación de formularios en frontend y backend

### Validaciones

- Título y pregunta requeridos
- Mínimo 2 opciones de respuesta
- Máximo 10 opciones por encuesta
- Control de votos por usuario configurable

## 🎨 Personalización

### Temas

El sistema es compatible con el tema oscuro/claro:

```css
/* Clases automáticas para tema oscuro */
.dark .survey-card {
  @apply bg-gray-800 border-gray-700;
}

.dark .survey-card h3 {
  @apply text-white;
}
```

### Estilos

Los componentes usan Tailwind CSS y son completamente personalizables:

```vue
<SurveyCard 
  class="custom-survey-card"
  :survey="survey"
/>
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Encuestas no se cargan**
   ```bash
   # Verificar que el backend esté corriendo
   # Verificar la URL de la API en .env
   # Verificar que las tablas existan en la BD
   ```

2. **Errores de autenticación**
   ```bash
   # Verificar que el token esté en localStorage
   # Verificar que el usuario tenga permisos de admin
   ```

3. **Votos no se registran**
   ```bash
   # Verificar que la encuesta esté activa
   # Verificar que el usuario no haya votado antes
   # Verificar la conexión a la API
   ```

### Debug

```javascript
// Habilitar logs detallados
localStorage.setItem('debug', 'survey:*');

// Verificar estado del store
console.log('Survey Store:', surveyStore.$state);

// Verificar encuestas activas
console.log('Active Surveys:', surveyStore.activeSurveys);
```

## 📈 Próximas Mejoras

- [ ] **Notificaciones push** cuando hay nuevas encuestas
- [ ] **Encuestas programadas** con fechas automáticas
- [ ] **Exportación de resultados** en PDF/Excel
- [ ] **Encuestas temáticas** por categorías
- [ ] **Análisis avanzado** de resultados
- [ ] **Integración con redes sociales** para compartir encuestas

## 🤝 Contribución

Para contribuir al sistema de encuestas:

1. Crear una rama para tu feature
2. Implementar los cambios
3. Agregar tests si es necesario
4. Crear un pull request

## 📞 Soporte

- **Documentación**: Este README
- **Backend**: Ver `README_SURVEY_SYSTEM.md`
- **API**: Ver `SURVEY_SYSTEM_API_DOCUMENTATION.md`
- **Pruebas**: Ejecutar `test-survey-system.js`

---

**Sistema de Encuestas Frontend** - Versión 1.0.0 