<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            {{ isEditing ? 'Editar Lotería' : 'Nueva Lotería' }}
          </h3>
          <button 
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <form @submit.prevent="handleSubmit" class="px-6 py-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Información Básica -->
          <div class="space-y-4">
            <h4 class="font-medium text-gray-900">Información Básica</h4>
            
            <!-- Título -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre de la lotería"
              />
            </div>

            <!-- Descripción -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="description"
                v-model="form.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripción de la lotería"
              ></textarea>
            </div>

            <!-- URL de Imagen -->
            <div>
              <label for="image_url" class="block text-sm font-medium text-gray-700 mb-1">
                URL de Imagen
              </label>
              <input
                id="image_url"
                v-model="form.image_url"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <!-- Tipo de Lotería -->
            <div>
              <label for="is_free" class="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Lotería *
              </label>
              <select
                id="is_free"
                v-model="form.is_free"
                :disabled="isRestrictedField('is_free')"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                required
              >
                <option :value="true">Gratuita</option>
                <option :value="false">De Pago</option>
              </select>
            </div>

            <!-- Precio del Ticket -->
            <div v-if="!form.is_free">
              <label for="ticket_price" class="block text-sm font-medium text-gray-700 mb-1">
                Precio por Ticket *
              </label>
              <input
                id="ticket_price"
                v-model.number="form.ticket_price"
                type="number"
                min="0"
                step="0.01"
                :disabled="isRestrictedField('ticket_price')"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="0.00"
              />
            </div>
          </div>

          <!-- Configuración de Tickets -->
          <div class="space-y-4">
            <h4 class="font-medium text-gray-900">Configuración de Tickets</h4>
            
            <!-- Mínimo de Tickets -->
            <div>
              <label for="min_tickets" class="block text-sm font-medium text-gray-700 mb-1">
                Mínimo de Tickets *
              </label>
              <input
                id="min_tickets"
                v-model.number="form.min_tickets"
                type="number"
                min="1"
                :disabled="isRestrictedField('min_tickets')"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                required
              />
            </div>

            <!-- Máximo de Tickets -->
            <div>
              <label for="max_tickets" class="block text-sm font-medium text-gray-700 mb-1">
                Máximo de Tickets *
              </label>
              <input
                id="max_tickets"
                v-model.number="form.max_tickets"
                type="number"
                min="1"
                :disabled="isRestrictedField('max_tickets')"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                required
              />
            </div>

            <!-- Número de Ganadores -->
            <div>
              <label for="num_winners" class="block text-sm font-medium text-gray-700 mb-1">
                Número de Ganadores *
              </label>
              <input
                id="num_winners"
                v-model.number="form.num_winners"
                type="number"
                min="1"
                :disabled="isRestrictedField('num_winners')"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                required
              />
            </div>

            <!-- Fechas -->
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label for="start_date" class="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio *
                </label>
                <input
                  id="start_date"
                  v-model="form.start_date"
                  type="datetime-local"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label for="end_date" class="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Fin *
                </label>
                <input
                  id="end_date"
                  v-model="form.end_date"
                  type="datetime-local"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Información Adicional -->
        <div class="mt-6 space-y-4">
          <h4 class="font-medium text-gray-900">Información Adicional</h4>
          
          <!-- Descripción del Premio -->
          <div>
            <label for="prize_description" class="block text-sm font-medium text-gray-700 mb-1">
              Descripción del Premio
            </label>
            <textarea
              id="prize_description"
              v-model="form.prize_description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe los premios disponibles"
            ></textarea>
          </div>

          <!-- Términos y Condiciones -->
          <div>
            <label for="terms_conditions" class="block text-sm font-medium text-gray-700 mb-1">
              Términos y Condiciones
            </label>
            <textarea
              id="terms_conditions"
              v-model="form.terms_conditions"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Términos y condiciones de la lotería"
            ></textarea>
          </div>
        </div>

        <!-- Advertencia para Loterías Activas -->
        <div v-if="showRestrictionWarning" class="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">
                Lotería Activa con Tickets Vendidos
              </h3>
              <div class="mt-2 text-sm text-yellow-700">
                <p>Esta lotería está activa y tiene {{ lottery?.tickets_sold || 0 }} tickets vendidos.</p>
                <p class="mt-1">Los campos marcados en gris no pueden ser modificados para proteger a los participantes.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-800">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex justify-end gap-3">
          <button 
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            :disabled="loading || !isFormValid"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
            <span v-else>
              {{ isEditing ? 'Actualizar Lotería' : 'Crear Lotería' }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { lotteryService } from '@/services/lotteryService'
import type { Lottery, CreateLotteryData } from '@/types/lottery'

const props = defineProps<{
  lottery?: Lottery | null
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

// State
const loading = ref(false)
const error = ref('')

// Form data
const form = ref<CreateLotteryData>({
  title: '',
  description: '',
  image_url: '',
  is_free: true,
  ticket_price: 0,
  min_tickets: 1,
  max_tickets: 100,
  num_winners: 1,
  start_date: '',
  end_date: '',
  prize_description: '',
  terms_conditions: ''
})

// Computed
const isEditing = computed(() => !!props.lottery)

const showRestrictionWarning = computed(() => {
  return isEditing.value && 
         props.lottery?.status === 'active' && 
         (props.lottery?.tickets_sold || 0) > 0
})

const isFormValid = computed(() => {
  return form.value.title.trim() !== '' &&
         form.value.start_date !== '' &&
         form.value.end_date !== '' &&
         form.value.min_tickets > 0 &&
         form.value.max_tickets >= form.value.min_tickets &&
         form.value.num_winners > 0 &&
         form.value.num_winners <= form.value.max_tickets &&
         (!form.value.is_free ? form.value.ticket_price > 0 : true)
})

// Methods
const isRestrictedField = (fieldName: string): boolean => {
  if (!showRestrictionWarning.value) return false
  
  const restrictedFields = ['is_free', 'ticket_price', 'min_tickets', 'max_tickets', 'num_winners']
  return restrictedFields.includes(fieldName)
}

const formatDateTimeLocal = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

const initializeForm = () => {
  if (props.lottery) {
    form.value = {
      title: props.lottery.title,
      description: props.lottery.description || '',
      image_url: props.lottery.image_url || '',
      is_free: props.lottery.is_free,
      ticket_price: props.lottery.ticket_price,
      min_tickets: props.lottery.min_tickets,
      max_tickets: props.lottery.max_tickets,
      num_winners: props.lottery.num_winners,
      start_date: formatDateTimeLocal(props.lottery.start_date),
      end_date: formatDateTimeLocal(props.lottery.end_date),
      prize_description: props.lottery.prize_description || '',
      terms_conditions: props.lottery.terms_conditions || ''
    }
  } else {
    // Set default dates (1 hour from now for start, 24 hours for end)
    const now = new Date()
    const startDate = new Date(now.getTime() + 60 * 60 * 1000) // +1 hour
    const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // +24 hours
    
    form.value.start_date = formatDateTimeLocal(startDate.toISOString())
    form.value.end_date = formatDateTimeLocal(endDate.toISOString())
  }
}

const validateDates = (): boolean => {
  const startDate = new Date(form.value.start_date)
  const endDate = new Date(form.value.end_date)
  const now = new Date()
  
  if (!isEditing.value && startDate <= now) {
    error.value = 'La fecha de inicio debe ser futura'
    return false
  }
  
  if (endDate <= startDate) {
    error.value = 'La fecha de fin debe ser posterior a la fecha de inicio'
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  error.value = ''
  
  if (!validateDates()) return
  
  try {
    loading.value = true
    
    // Limpiar el payload y asegurar tipos correctos según la documentación
    const payload = {
      title: form.value.title.trim(),
      description: form.value.description?.trim() || undefined,
      image_url: form.value.image_url?.trim() || undefined,
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
    
    // Remover campos undefined para evitar problemas en el backend
    Object.keys(payload).forEach(key => {
      if ((payload as any)[key] === undefined) {
        delete (payload as any)[key]
      }
    })
    
    console.log('Payload being sent:', payload)
    console.log('Is editing:', isEditing.value)
    
    if (isEditing.value && props.lottery) {
      console.log('Updating lottery ID:', props.lottery.id)
      await lotteryService.updateLottery(props.lottery.id, payload)
    } else {
      console.log('Creating new lottery')
      await lotteryService.createLottery(payload)
    }
    
    emit('success')
  } catch (err: any) {
    console.error('Error in handleSubmit:', err)
    if (err.response && err.response.data) {
      console.error('Backend error response:', err.response.data)
      error.value = err.response.data.message || err.response.data.error || 'Error del servidor'
    } else {
      error.value = err.message || `Error al ${isEditing.value ? 'actualizar' : 'crear'} la lotería`
    }
  } finally {
    loading.value = false
  }
}

// Watchers
watch(() => form.value.is_free, (isFree) => {
  if (isFree) {
    form.value.ticket_price = 0
  }
})

watch(() => form.value.max_tickets, (maxTickets) => {
  if (form.value.num_winners > maxTickets) {
    form.value.num_winners = maxTickets
  }
})

// Lifecycle
onMounted(() => {
  initializeForm()
})

watch(() => props.lottery, () => {
  initializeForm()
}, { immediate: true })
</script> 