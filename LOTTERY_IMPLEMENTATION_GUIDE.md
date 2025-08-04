# 🎰 Guía Completa de Implementación - Sistema de Lotería Frontend

## 📋 Resumen de lo Implementado

### ✅ Componentes Creados/Actualizados

1. **Store de Lotería** (`store/lottery.ts`)
   - Estado centralizado con Pinia
   - Acciones para CRUD de loterías
   - Getters para filtros y estadísticas
   - Manejo de errores y loading

2. **Composable de Lotería** (`composables/useLottery.ts`)
   - Lógica reutilizable para loterías
   - Validaciones de participación
   - Funciones de formato y utilidades
   - Manejo de modales

3. **Componente LotteryCard** (`components/lottery/LotteryCard.vue`)
   - Tarjeta reutilizable para mostrar loterías
   - Diseño responsivo con Tailwind
   - Estados visuales y progreso
   - Botones de acción

4. **Vistas Actualizadas**
   - `LotteryView.vue`: Vista principal para usuarios
   - `LotteryAdminView.vue`: Dashboard de administración

5. **Navegación**
   - Rutas configuradas en el router
   - Menú de usuario actualizado
   - Protección de rutas por roles

## 🔌 APIs del Backend

### Base URL
```
http://localhost:3001/api/v1
```

### Endpoints de Loterías

| Método | Endpoint | Descripción | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/lotteries` | Listar loterías con paginación | No | No |
| GET | `/lotteries/:id` | Obtener una lotería específica | No | No |
| POST | `/lotteries` | Crear nueva lotería | Sí | Sí |
| PUT | `/lotteries/:id` | Actualizar lotería existente | Sí | Sí |
| DELETE | `/lotteries/:id` | Eliminar lotería | Sí | Sí |
| POST | `/lotteries/:id/buy` | Comprar tickets de lotería | Sí | No |
| GET | `/lotteries/:id/tickets` | Obtener tickets del usuario | Sí | No |
| POST | `/lotteries/:id/finish` | Finalizar lotería y seleccionar ganadores | Sí | Sí |
| GET | `/lotteries/:id/winners` | Obtener ganadores de lotería | No | No |
| GET | `/lotteries/user/history` | Historial de participación del usuario | Sí | No |

### Endpoints de Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/register` | Registrarse |
| GET | `/auth/me` | Obtener perfil del usuario |
| POST | `/auth/logout` | Cerrar sesión |

## 📊 Estructura de Datos (APIs)

### Lotería (Lottery)
```json
{
  "id": 1,
  "title": "Lotería de Prueba",
  "description": "Descripción de la lotería",
  "image_url": "https://example.com/image.jpg",
  "is_free": true,
  "ticket_price": 0,
  "min_tickets": 1,
  "max_tickets": 100,
  "num_winners": 3,
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-12-31T23:59:59Z",
  "status": "active",
  "created_by": 1,
  "created_by_name": "Admin",
  "tickets_sold": 25,
  "winners_selected": 0,
  "prize_description": "Premios especiales",
  "terms_conditions": "Términos y condiciones",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Ticket de Lotería (LotteryTicket)
```json
{
  "id": 1,
  "lottery_id": 1,
  "user_id": 1,
  "ticket_number": 5,
  "purchase_date": "2024-01-01T00:00:00Z",
  "payment_status": "paid",
  "payment_amount": 100,
  "payment_method": "credit_card",
  "transaction_id": "txn_123456",
  "is_winner": false,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Ganador (LotteryWinner)
```json
{
  "id": 1,
  "lottery_id": 1,
  "ticket_id": 1,
  "user_id": 1,
  "ticket_number": 5,
  "prize_description": "Premio principal",
  "notified_at": "2024-01-01T00:00:00Z",
  "claimed_at": null,
  "created_at": "2024-01-01T00:00:00Z",
  "username": "usuario1",
  "email": "usuario@example.com",
  "lottery_title": "Lotería de Prueba"
}
```

## 🔧 Ejemplos de Llamadas a la API

### 1. Obtener Loterías
```javascript
// GET /api/v1/lotteries?page=1&limit=12&status=active&is_free=true
const response = await fetch('http://localhost:3001/api/v1/lotteries?page=1&limit=12&status=active&is_free=true');
const data = await response.json();

// Respuesta esperada:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Lotería Gratuita",
      "is_free": true,
      "status": "active"
      // ... más campos
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 1,
    "pages": 1
  }
}
```

### 2. Crear Lotería (Admin)
```javascript
// POST /api/v1/lotteries
const response = await fetch('http://localhost:3001/api/v1/lotteries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    "title": "Nueva Lotería",
    "description": "Descripción de la lotería",
    "is_free": false,
    "ticket_price": 100,
    "min_tickets": 10,
    "max_tickets": 100,
    "num_winners": 3,
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-12-31T23:59:59Z",
    "prize_description": "Premios en efectivo",
    "terms_conditions": "Términos y condiciones"
  })
});
```

### 3. Comprar Tickets
```javascript
// POST /api/v1/lotteries/1/buy
const response = await fetch('http://localhost:3001/api/v1/lotteries/1/buy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    "ticket_numbers": [1, 5, 10],
    "payment_method": "credit_card"
  })
});
```

### 4. Finalizar Lotería (Admin)
```javascript
// POST /api/v1/lotteries/1/finish
const response = await fetch('http://localhost:3001/api/v1/lotteries/1/finish', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

## 🚀 Configuración del Servicio Frontend

### Configuración de Axios (lotteryService.ts)
```typescript
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// Create axios instance for lottery API
const lotteryApi = axios.create({
  baseURL: `${BASE_URL}/api/v1`,  // ✅ URL Correcta
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
lotteryApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

class LotteryService {
  private baseUrl = '/lotteries'  // ✅ Sin /v1 porque ya está en baseURL

  async getLotteries(filters?: LotteryFilters): Promise<LotteryResponse> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }

    const response = await lotteryApi.get(`${this.baseUrl}?${params.toString()}`)
    return response.data
  }

  // ... más métodos
}
```

## 🔐 Autenticación y Autorización

### Headers Requeridos
```javascript
// Para rutas que requieren autenticación
headers: {
  'Authorization': 'Bearer ' + localStorage.getItem('token'),
  'Content-Type': 'application/json'
}
```

### Roles de Usuario
- **`usuario`**: Puede ver y participar en loterías
- **`administrador`**: Puede crear, editar y gestionar loterías

### Verificación de Permisos
```javascript
// En el router guard
if (to.meta.requiresAdmin && user.rol !== 'administrador') {
  next({ name: 'Home' });
  return;
}
```

## 📁 Estructura Completa de Archivos

```
frontend/src/
├── store/
│   ├── lottery.ts                    # ✅ Store de Pinia (IMPLEMENTADO)
│   └── index.ts                      # ✅ Exportaciones (ACTUALIZADO)
├── composables/
│   └── useLottery.ts                 # ✅ Composable (IMPLEMENTADO)
├── components/lottery/
│   ├── LotteryCard.vue               # ✅ Tarjeta (IMPLEMENTADO)
│   ├── LotteryModal.vue              # ✅ Ya existía
│   ├── LotteryDetailModal.vue        # ✅ Ya existía
│   ├── ParticipationModal.vue        # ✅ Ya existía
│   └── WinnersModal.vue              # ✅ Ya existía
├── views/
│   ├── LotteryView.vue               # ✅ Vista principal (ACTUALIZADA)
│   └── LotteryAdminView.vue          # ✅ Dashboard admin (ACTUALIZADA)
├── services/
│   └── lotteryService.ts             # ✅ Servicio API (CORREGIDO)
├── types/
│   └── lottery.ts                    # ✅ Ya existía
└── router/
    └── index.ts                      # ✅ Ya configurado
```

## 🎯 Estados de Lotería

### Estados Posibles
- **`draft`**: Borrador (solo admin puede ver)
- **`active`**: Activa (usuarios pueden participar)
- **`running`**: En curso (entre fechas de inicio y fin)
- **`overdue`**: Vencida (pasó fecha de fin)
- **`finished`**: Finalizada (ganadores seleccionados)
- **`cancelled`**: Cancelada (no alcanzó mínimo)

### Estados de Ticket
- **`pending`**: Pendiente de pago
- **`paid`**: Pagado
- **`failed`**: Pago fallido
- **`refunded`**: Reembolsado

## 🎨 Características de UI/UX

### Diseño Responsivo
- Grid adaptativo: 1 columna en móvil, 2 en tablet, 3-4 en desktop
- Tarjetas con hover effects y transiciones suaves
- Modales con backdrop blur y animaciones

### Estados Visuales
- **Loading**: Spinner con mensaje descriptivo
- **Empty State**: Icono y mensaje amigable
- **Error**: Banner rojo con opción de cerrar
- **Success**: Feedback visual en acciones

### Componentes Reutilizables
- `LotteryCard`: Tarjeta con toda la información
- Modales: Reutilizables para diferentes contextos
- Botones: Estados consistentes y accesibles

## 🔧 Variables de Entorno

### .env (Crear en la raíz del frontend)
```bash
# Variables de entorno para el frontend
VITE_API_BASE_URL=http://localhost:3001
```

### Uso en el código
```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
```

## 🚀 Pasos de Implementación

### 1. Verificar Backend
```bash
# Verificar que el backend responde
curl http://localhost:3001/api/v1/lotteries
# Debería devolver: {"success":true,"data":[],"pagination":{...}}
```

### 2. Instalar Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Crear Usuario Administrador
```bash
# Ejecutar script de creación de datos de prueba
node frontend/create-test-lotteries.js
```

### 4. Probar Conexión
```bash
# Ejecutar script de verificación
node frontend/quick-test.js
```

## 🐛 Solución de Problemas

### ❌ Error 404 en API
**Problema**: `GET http://localhost:3001/api/v1/api/v1/lotteries 404`
**Solución**: Verificar configuración de URLs en `lotteryService.ts`

```typescript
// ✅ Configuración correcta
const lotteryApi = axios.create({
  baseURL: `${BASE_URL}/api/v1`,  // Sin duplicación
})

class LotteryService {
  private baseUrl = '/lotteries'   // Sin /v1
}
```

### ❌ Error de CORS
**Problema**: CORS policy error
**Solución**: Configurar CORS en el backend

```javascript
// En el backend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### ❌ Error de Autenticación
**Problema**: 401 Unauthorized
**Solución**: Verificar token JWT

```javascript
// Verificar que el token esté en localStorage
const token = localStorage.getItem('token');
console.log('Token:', token);
```

## 📋 Checklist de Implementación

### Backend
- [ ] Servidor corriendo en puerto 3001
- [ ] Base de datos MySQL conectada
- [ ] Tablas de lotería creadas
- [ ] Rutas de API configuradas
- [ ] CORS habilitado para localhost:5173
- [ ] Usuario administrador creado
- [ ] JWT configurado

### Frontend
- [ ] Servidor de desarrollo corriendo en puerto 5173
- [ ] Store de Pinia implementado (`store/lottery.ts`)
- [ ] Composable implementado (`composables/useLottery.ts`)
- [ ] Componente LotteryCard creado
- [ ] Vistas actualizadas (LotteryView, LotteryAdminView)
- [ ] Servicio de API corregido (`lotteryService.ts`)
- [ ] Rutas configuradas en router
- [ ] Variables de entorno configuradas

### Pruebas
- [ ] API responde correctamente
- [ ] Frontend se conecta sin errores 404
- [ ] Login de administrador funciona
- [ ] Creación de loterías funciona
- [ ] Participación de usuarios funciona
- [ ] Modales se abren correctamente
- [ ] Filtros funcionan
- [ ] Responsive design en móvil

## 🎯 Funcionalidades Implementadas

### ✅ Usuarios
- [x] Ver loterías disponibles
- [x] Filtrar por tipo (gratuitas/de pago)
- [x] Ver detalles de lotería
- [x] Participar en loterías gratuitas
- [x] Comprar tickets de pago
- [x] Ver progreso de loterías
- [x] Ver ganadores

### ✅ Administradores
- [x] Dashboard con estadísticas
- [x] Crear nuevas loterías
- [x] Editar loterías existentes
- [x] Activar loterías en borrador
- [x] Finalizar loterías
- [x] Ver ganadores
- [x] Filtrar por estado

### ✅ Sistema
- [x] Autenticación y autorización
- [x] Validaciones en tiempo real
- [x] Manejo de errores
- [x] Estados de carga
- [x] Diseño responsivo
- [x] Animaciones y transiciones

## 🎨 Temas y Estilos

### Colores
- **Primario**: Blue-600 (#2563eb)
- **Secundario**: Purple-600 (#9333ea)
- **Éxito**: Green-600 (#16a34a)
- **Error**: Red-600 (#dc2626)
- **Advertencia**: Yellow-600 (#ca8a04)

### Gradientes
- **Header**: `from-blue-500 to-purple-600`
- **Cards**: `from-blue-500 to-purple-600`
- **Botones**: `from-blue-600 to-purple-600`

## 📱 Responsive Design

### Breakpoints
- **Móvil**: < 768px (1 columna)
- **Tablet**: 768px - 1024px (2 columnas)
- **Desktop**: > 1024px (3-4 columnas)

### Componentes Adaptativos
- Grid responsivo con Tailwind
- Modales centrados en móvil
- Botones apilados en pantallas pequeñas

## 🧪 Scripts de Prueba

### 1. Verificar API
```bash
node frontend/test-lottery-api.js
```

### 2. Crear Datos de Prueba
```bash
node frontend/create-test-lotteries.js
```

### 3. Verificar URLs
```bash
node frontend/quick-test.js
```

## 📞 Contacto y Soporte

### Para el Desarrollador Frontend

1. **Verificar Configuración**:
   - Backend en puerto 3001
   - Frontend en puerto 5173
   - Base de datos conectada

2. **Archivos Clave**:
   - `frontend/src/services/lotteryService.ts` - Configuración de API
   - `frontend/src/store/lottery.ts` - Estado global
   - `frontend/src/views/LotteryView.vue` - Vista principal

3. **Comandos Útiles**:
   ```bash
   # Desarrollo
   npm run dev
   
   # Verificar tipos
   npm run type-check
   
   # Linting
   npm run lint
   ```

4. **URLs Importantes**:
   - Vista usuarios: `http://localhost:5173/lotteries`
   - Dashboard admin: `http://localhost:5173/lotteries/admin`
   - API backend: `http://localhost:3001/api/v1/lotteries`

### Problemas Comunes y Soluciones

1. **Error 404**: Verificar URL en `lotteryService.ts`
2. **Error CORS**: Configurar backend para aceptar localhost:5173
3. **Error Auth**: Verificar token JWT en localStorage
4. **Componentes no se muestran**: Verificar importaciones en `store/index.ts`

---

**✅ Sistema Completamente Implementado y Listo para Uso**  
**Versión**: 1.0.0  
**Última actualización**: Enero 2024  
**Desarrollado por**: Equipo CdelU 