# 🐛 Troubleshooting - Sistema de Loterías

## 🚨 Problemas Identificados y Soluciones

### 1. **Error 400 en POST/PUT `/api/v1/lotteries`**

#### **Problema:**
```
POST http://localhost:3001/api/v1/lotteries 400 (Bad Request)
PUT http://localhost:3001/api/v1/lotteries/15 400 (Bad Request)
```

#### **Causa:**
El backend no acepta el formato de datos que envía el frontend.

#### **Solución Implementada:**
✅ **Limpieza del payload** en ambos modales:
- Conversión explícita de tipos (Boolean, Number)
- Eliminación de campos `undefined`
- Trimming de strings
- Formato correcto de fechas ISO

```javascript
const payload = {
  title: form.value.title.trim(),
  description: form.value.description?.trim() || undefined,
  is_free: Boolean(form.value.is_free),
  ticket_price: form.value.is_free ? 0 : Number(form.value.ticket_price),
  min_tickets: Number(form.value.min_tickets),
  max_tickets: Number(form.value.max_tickets),
  num_winners: Number(form.value.num_winners),
  start_date: new Date(form.value.start_date).toISOString(),
  end_date: new Date(form.value.end_date).toISOString(),
  prize_description: form.value.prize_description?.trim() || undefined,
  terms_conditions: form.value.terms_conditions?.trim() || undefined
}

// Remover campos undefined
Object.keys(payload).forEach(key => {
  if ((payload as any)[key] === undefined) {
    delete (payload as any)[key]
  }
})
```

#### **Debugging Agregado:**
✅ Console logs para ver el payload exacto enviado
✅ Error handling mejorado con respuestas del backend

---

### 2. **Error 400 en POST `/api/v1/lotteries/15/finish`**

#### **Problema:**
```
POST http://localhost:3001/api/v1/lotteries/15/finish 400 (Bad Request)
```

#### **Causa:**
El endpoint `/finish` no existe en el backend.

#### **Solución Implementada:**
✅ **Cambio de método**: Según la documentación, finalizar una lotería es cambiar su `status` a `'finished'`

```javascript
// ❌ ANTES (incorrecto)
async finishLottery(id: number): Promise<LotteryResponse> {
  const response = await lotteryApi.post(`${this.baseUrl}/${id}/finish`)
  return response.data
}

// ✅ DESPUÉS (correcto)
async finishLottery(id: number): Promise<LotteryResponse> {
  const response = await lotteryApi.put(`${this.baseUrl}/${id}`, { status: 'finished' })
  return response.data
}
```

---

### 3. **Errores de WebSocket (No Críticos)**

#### **Problema:**
```
WebSocket connection to 'ws://localhost:5173/?token=...' failed
Failed to construct 'WebSocket': The URL 'ws://localhost:undefined/?token=...' is invalid
```

#### **Causa:**
Problemas de configuración del desarrollo de Vite/HMR.

#### **Solución:**
⚠️ **No crítico para funcionalidad** - Solo afecta hot reload en desarrollo.

**Para corregir (opcional):**
```javascript
// En vite.config.ts
export default defineConfig({
  server: {
    hmr: {
      port: 5173
    }
  }
})
```

---

## 🔧 Verificaciones Requeridas en el Backend

### 1. **Endpoints que DEBEN existir:**
```javascript
// ✅ Básicos (probablemente funcionan)
GET    /api/v1/lotteries
GET    /api/v1/lotteries/:id
POST   /api/v1/lotteries
PUT    /api/v1/lotteries/:id
DELETE /api/v1/lotteries/:id

// ❓ Específicos (verificar si existen)
PUT    /api/v1/lotteries/:id/cancel
GET    /api/v1/lotteries/:id/sold-tickets
GET    /api/v1/lotteries/:id/my-tickets
GET    /api/v1/lotteries/:id/stats
POST   /api/v1/lotteries/:id/buy
```

### 2. **Formato de datos que espera el backend:**

#### **Para crear/editar lotería:**
```json
{
  "title": "string (requerido)",
  "description": "string (opcional)",
  "image_url": "string (opcional)",
  "is_free": "boolean (requerido)",
  "ticket_price": "number (requerido, 0 si is_free=true)",
  "min_tickets": "number (requerido, ≥1)",
  "max_tickets": "number (requerido, ≥min_tickets)",
  "num_winners": "number (requerido, ≤max_tickets)",
  "start_date": "string ISO (requerido)",
  "end_date": "string ISO (requerido)",
  "prize_description": "string (opcional)",
  "terms_conditions": "string (opcional)"
}
```

#### **Para cambiar estado:**
```json
{
  "status": "draft" | "active" | "cancelled" | "finished"
}
```

#### **Para comprar tickets:**
```json
{
  "ticket_numbers": [1, 2, 3, 4]
}
```

---

## 🧪 Testing Manual Recomendado

### 1. **Crear Lotería Nueva**
```javascript
// Abrir consola del navegador y verificar:
console.log('Payload being sent:', payload)

// Datos mínimos de prueba:
{
  title: "Test Lotería",
  is_free: true,
  ticket_price: 0,
  min_tickets: 1,
  max_tickets: 10,
  num_winners: 1,
  start_date: "2024-12-20T10:00:00.000Z",
  end_date: "2024-12-21T10:00:00.000Z"
}
```

### 2. **Verificar Respuestas del Backend**
```javascript
// En catch blocks, verificar:
console.error('Backend error response:', err.response.data)

// Buscar mensajes como:
// - "Campo requerido: xxx"
// - "Formato inválido: xxx"
// - "Validation error"
```

### 3. **Probar Estados de Lotería**
```javascript
// Secuencia de prueba:
1. Crear lotería (status: 'draft')
2. Activar lotería (status: 'active')
3. Finalizar lotería (status: 'finished')
4. Verificar que no se puede editar campos restringidos
```

---

## 📝 Checklist de Verificación

### Backend Requirements:
- [ ] ✅ Endpoint `POST /api/v1/lotteries` acepta el formato de datos correcto
- [ ] ✅ Endpoint `PUT /api/v1/lotteries/:id` acepta el formato de datos correcto
- [ ] ✅ Endpoint `PUT /api/v1/lotteries/:id` acepta `{ status: 'finished' }`
- [ ] ❓ Endpoint `PUT /api/v1/lotteries/:id/cancel` existe
- [ ] ❓ Endpoint `GET /api/v1/lotteries/:id/sold-tickets` existe
- [ ] ❓ Validaciones del backend coinciden con las del frontend

### Frontend Fixes Applied:
- [x] ✅ Payload cleanup en CreateLotteryModal.vue
- [x] ✅ Payload cleanup en LotteryModal.vue
- [x] ✅ Corrección del método finishLottery()
- [x] ✅ Debugging mejorado con console logs
- [x] ✅ Error handling mejorado

### Testing:
- [ ] ⏳ Crear lotería nueva funciona
- [ ] ⏳ Editar lotería existente funciona
- [ ] ⏳ Finalizar lotería funciona
- [ ] ⏳ Campos restringidos se comportan correctamente

---

## 🎯 Próximos Pasos

1. **Probar las correcciones** implementadas
2. **Verificar endpoints del backend** según la lista
3. **Ajustar validaciones** si es necesario
4. **Documentar APIs finales** una vez que funcionen

¡Las correcciones principales ya están implementadas! 🚀 