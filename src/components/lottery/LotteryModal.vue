<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="px-6 py-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Title -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input 
              v-model="form.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Título de la lotería"
            />
          </div>

          <!-- Description -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea 
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción detallada de la lotería"
            ></textarea>
          </div>

          <!-- Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Lotería *
            </label>
            <div class="flex gap-4">
              <label class="flex items-center">
                <input 
                  v-model="form.is_free"
                  type="radio"
                  :value="true"
                  class="mr-2"
                />
                Gratuita
              </label>
              <label class="flex items-center">
                <input 
                  v-model="form.is_free"
                  type="radio"
                  :value="false"
                  class="mr-2"
                />
                De Pago
              </label>
            </div>
          </div>

          <!-- Ticket Price -->
          <div v-if="!form.is_free">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Precio por Ticket *
            </label>
            <input 
              v-model="form.ticket_price"
              type="number"
              step="0.01"
              min="0"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>

          <!-- Max Tickets -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Máximo de Tickets *
            </label>
            <input 
              v-model="form.max_tickets"
              type="number"
              min="1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="100"
            />
          </div>

          <!-- Min Tickets -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Mínimo de Tickets *
            </label>
            <input 
              v-model="form.min_tickets"
              type="number"
              min="1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1"
            />
          </div>

          <!-- Num Winners -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Número de Ganadores *
            </label>
            <input 
              v-model="form.num_winners"
              type="number"
              min="1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1"
            />
          </div>

          <!-- Start Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio *
            </label>
            <input 
              v-model="form.start_date"
              type="datetime-local"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- End Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Fin *
            </label>
            <input 
              v-model="form.end_date"
              type="datetime-local"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Prize Description -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Descripción del Premio
            </label>
            <textarea 
              v-model="form.prize_description"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción del premio que se otorgará"
            ></textarea>
          </div>

          <!-- Terms and Conditions -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Términos y Condiciones
            </label>
            <textarea 
              v-model="form.terms_conditions"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Términos y condiciones de la lotería"
            ></textarea>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button 
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </span>
            <span v-else>
              {{ isEditing ? 'Actualizar' : 'Crear' }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { lotteryService } from '@/services/lotteryService'
import type { Lottery, CreateLotteryData } from '@/types/lottery'

const props = defineProps<{
  lottery?: Lottery | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

// State
const loading = ref(false)
const form = ref<CreateLotteryData>({
  title: '',
  description: '',
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

// Methods
const handleSubmit = async () => {
  try {
    loading.value = true
    
    // Limpiar el payload y asegurar tipos correctos
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
    
    console.log('LotteryModal payload:', payload)
    
    if (isEditing.value && props.lottery) {
      console.log('Updating lottery ID:', props.lottery.id)
      await lotteryService.updateLottery(props.lottery.id, payload)
    } else {
      console.log('Creating new lottery')
      await lotteryService.createLottery(payload)
    }
    
    emit('saved')
  } catch (error) {
    console.error('Error saving lottery:', error)
    // You can add error handling here
  } finally {
    loading.value = false
  }
}

const initializeForm = () => {
  if (props.lottery) {
    form.value = {
      title: props.lottery.title,
      description: props.lottery.description || '',
      is_free: props.lottery.is_free,
      ticket_price: props.lottery.ticket_price,
      min_tickets: props.lottery.min_tickets,
      max_tickets: props.lottery.max_tickets,
      num_winners: props.lottery.num_winners,
      start_date: props.lottery.start_date.slice(0, 16), // Format for datetime-local
      end_date: props.lottery.end_date.slice(0, 16),
      prize_description: props.lottery.prize_description || '',
      terms_conditions: props.lottery.terms_conditions || ''
    }
  } else {
    // Set default values for new lottery
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    
    form.value = {
      title: '',
      description: '',
      is_free: true,
      ticket_price: 0,
      min_tickets: 1,
      max_tickets: 100,
      num_winners: 1,
      start_date: now.toISOString().slice(0, 16),
      end_date: tomorrow.toISOString().slice(0, 16),
      prize_description: '',
      terms_conditions: ''
    }
  }
}

// Lifecycle
onMounted(() => {
  initializeForm()
})
</script> 