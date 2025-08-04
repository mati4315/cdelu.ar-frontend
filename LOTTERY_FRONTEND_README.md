# Sistema de Lotería - Frontend Vue.js

## Descripción

Sistema completo de loterías implementado en Vue.js 3 con TypeScript, que permite a los administradores crear y gestionar loterías, y a los usuarios participar en ellas.

## Características Implementadas

### ✅ Funcionalidades de Usuario
- **Vista de Loterías**: Lista todas las loterías disponibles
- **Filtros**: Por tipo (gratuitas/de pago)
- **Detalles de Lotería**: Modal con información completa
- **Participación**: Sistema de compra/selección de tickets
- **Interfaz Responsiva**: Diseño adaptativo para móviles

### ✅ Funcionalidades de Administrador
- **Dashboard de Administración**: Estadísticas y gestión
- **Crear/Editar Loterías**: Formulario completo
- **Gestionar Estados**: Activar, finalizar loterías
- **Ver Ganadores**: Modal con lista de ganadores
- **Estadísticas**: Métricas en tiempo real

### 🎯 Características Técnicas
- **Vue.js 3**: Composition API
- **TypeScript**: Tipado completo
- **Tailwind CSS**: Estilos modernos
- **Vue Router**: Navegación SPA
- **Axios**: Cliente HTTP
- **Componentes Modulares**: Reutilizables

## Estructura del Proyecto

```
frontend/src/
├── views/
│   ├── LotteryView.vue              # Vista principal de loterías
│   └── LotteryAdminView.vue         # Dashboard de administración
├── components/lottery/
│   ├── LotteryModal.vue             # Modal crear/editar lotería
│   ├── LotteryDetailModal.vue       # Modal detalles de lotería
│   ├── ParticipationModal.vue       # Modal participación
│   └── WinnersModal.vue             # Modal ganadores
├── services/
│   └── lotteryService.ts            # Servicio API loterías
├── types/
│   └── lottery.ts                   # Tipos TypeScript
└── router/
    └── index.ts                     # Rutas de lotería
```

## Instalación y Configuración

### 1. Dependencias

El sistema utiliza las dependencias existentes del proyecto:
- Vue.js 3
- TypeScript
- Tailwind CSS
- Axios
- Vue Router

### 2. Variables de Entorno

```bash
# .env
VITE_API_BASE_URL=http://localhost:3001
```

### 3. Configuración del Router

Las rutas están configuradas en `src/router/index.ts`:

```typescript
{
  path: '/lotteries',
  name: 'Lottery',
  component: LotteryView,
},
{
  path: '/lotteries/admin',
  name: 'LotteryAdmin',
  component: LotteryAdminView,
  meta: { requiresAuth: true, requiresAdmin: true }
}
```

## Uso

### Para Usuarios

1. **Acceder a Loterías**:
   - Navegar a `/lotteries`
   - O usar el menú de usuario → "Loterías"

2. **Participar**:
   - Ver loterías disponibles
   - Hacer clic en "Ver Detalles"
   - Seleccionar "Participar Ahora"
   - Elegir tickets (gratuitos o de pago)

3. **Filtros**:
   - "Todas": Ver todas las loterías
   - "Gratuitas": Solo loterías sin costo
   - "De Pago": Solo loterías con tickets pagos

### Para Administradores

1. **Acceder al Dashboard**:
   - Navegar a `/lotteries/admin`
   - O usar el menú de usuario → "Administrar Loterías"

2. **Crear Lotería**:
   - Hacer clic en "Nueva Lotería"
   - Completar formulario
   - Seleccionar tipo (gratuita/de pago)
   - Configurar fechas y premios

3. **Gestionar Loterías**:
   - Ver estadísticas en tiempo real
   - Activar loterías en borrador
   - Finalizar loterías vencidas
   - Ver ganadores y resultados

## Componentes Principales

### LotteryView.vue
Vista principal para usuarios que muestra:
- Grid de loterías disponibles
- Filtros por tipo
- Estados de carga y vacío
- Modales de detalles y participación

### LotteryAdminView.vue
Dashboard de administración con:
- Estadísticas en tiempo real
- Lista de todas las loterías
- Acciones de gestión (editar, activar, finalizar)
- Filtros por estado

### LotteryModal.vue
Formulario para crear/editar loterías:
- Campos obligatorios y opcionales
- Validación de fechas
- Selección de tipo (gratuita/de pago)
- Configuración de premios

### ParticipationModal.vue
Interfaz de participación:
- Selección de cantidad (gratuitas)
- Selección de números (de pago)
- Resumen de compra
- Manejo de errores

## Servicios

### lotteryService.ts
Cliente HTTP para la API de loterías:

```typescript
// Métodos principales
getLotteries(filters?: LotteryFilters): Promise<LotteryResponse>
createLottery(data: CreateLotteryData): Promise<LotteryResponse>
buyTickets(lotteryId: number, data: BuyTicketsData): Promise<TicketsResponse>
finishLottery(id: number): Promise<LotteryResponse>
getWinners(lotteryId: number): Promise<WinnersResponse>
```

## Tipos TypeScript

### lottery.ts
Definiciones de tipos para el sistema:

```typescript
interface Lottery {
  id: number
  title: string
  is_free: boolean
  ticket_price: number
  max_tickets: number
  num_winners: number
  status: 'draft' | 'active' | 'finished' | 'cancelled'
  // ... más propiedades
}
```

## Estados y Validaciones

### Estados de Lotería
- **draft**: Borrador (solo admin)
- **active**: Activa (usuarios pueden participar)
- **finished**: Finalizada (ganadores seleccionados)
- **cancelled**: Cancelada

### Validaciones
- Fechas de inicio y fin válidas
- Números de tickets disponibles
- Límites de participación por usuario
- Autenticación para acciones administrativas

## Navegación

### Rutas Públicas
- `/lotteries`: Vista de loterías para usuarios

### Rutas Protegidas
- `/lotteries/admin`: Dashboard de administración (requiere admin)

### Guard de Autenticación
El router incluye protección para:
- Rutas que requieren autenticación
- Rutas que requieren rol de administrador
- Redirección automática al login

## Estilos y UI

### Tailwind CSS
- Diseño responsivo
- Componentes modernos
- Animaciones suaves
- Tema oscuro/claro

### Componentes Reutilizables
- Modales con transiciones
- Botones con estados
- Indicadores de progreso
- Mensajes de error/éxito

## Integración con Backend

### API Endpoints
El frontend se conecta con los endpoints del backend:
- `GET /api/lotteries`: Listar loterías
- `POST /api/lotteries`: Crear lotería
- `POST /api/lotteries/:id/buy`: Comprar tickets
- `POST /api/lotteries/:id/finish`: Finalizar lotería

### Autenticación
- JWT tokens en localStorage
- Interceptor de Axios para headers
- Manejo de errores 401/403

## Desarrollo

### Comandos Útiles

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build de producción
npm run build

# Linting
npm run lint

# Type checking
npm run type-check
```

### Estructura de Desarrollo

1. **Componentes**: Modulares y reutilizables
2. **Servicios**: Lógica de negocio separada
3. **Tipos**: TypeScript para seguridad
4. **Rutas**: Configuración centralizada
5. **Estilos**: Tailwind para consistencia

## Pruebas

### Pruebas Manuales
1. Crear lotería como administrador
2. Participar como usuario
3. Verificar estados y transiciones
4. Probar filtros y búsquedas

### Casos de Uso
- Loterías gratuitas vs de pago
- Límites de tickets
- Fechas de vencimiento
- Selección de ganadores
- Manejo de errores

## Mantenimiento

### Actualizaciones
- Mantener dependencias actualizadas
- Revisar compatibilidad con Vue.js
- Actualizar tipos TypeScript según API

### Monitoreo
- Errores de consola
- Performance de componentes
- Uso de memoria
- Tiempo de carga

## Licencia

Este sistema es parte del proyecto CdelU y está bajo la misma licencia del proyecto principal.

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2024  
**Desarrollado por**: Equipo CdelU 