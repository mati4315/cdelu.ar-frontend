<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            Participar en {{ lottery?.title }}
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
      <div class="px-6 py-4">
        <div v-if="!lottery" class="text-center py-8">
          <p class="text-gray-600">No se encontró la lotería</p>
        </div>

        <div v-else class="space-y-6">
          <!-- Lottery Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h4 class="font-medium text-blue-900">{{ lottery.title }}</h4>
                <p class="text-sm text-blue-700">{{ lottery.is_free ? 'Lotería Gratuita' : `Precio: $${lottery.ticket_price}` }}</p>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-blue-700">Tickets disponibles:</span>
                <span class="font-medium ml-1">{{ getAvailableCount() }}</span>
              </div>
              <div>
                <span class="text-blue-700">Ganadores:</span>
                <span class="font-medium ml-1">{{ lottery.num_winners }}</span>
              </div>
            </div>
          </div>

          <!-- Ticket Selection -->
          <div>
            <h4 class="text-lg font-medium text-gray-900 mb-3">Seleccionar Tickets</h4>
            
            <!-- Number Grid - Always show for both free and paid lotteries -->
            <div class="mb-4">
              <p class="text-sm text-gray-600 mb-3">
                {{ lottery.is_free ? 'Selecciona los números que quieres obtener gratis:' : 'Selecciona los números de ticket que quieres comprar:' }}
              </p>
              
              <!-- Quick Selection for Free Lotteries -->
              <div v-if="lottery.is_free" class="mb-4">
                <p class="text-xs text-gray-500 mb-2">Selección rápida:</p>
                <div class="flex gap-2 flex-wrap">
                  <button 
                    v-for="num in [1, 2, 3, 5, 10]"
                    :key="num"
                    @click="selectRandomNumbers(num)"
                    class="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    {{ num }} al azar
                  </button>
                  <button 
                    @click="clearSelection"
                    class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
              
              <!-- Number Grid -->
              <div class="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                <div class="grid grid-cols-10 gap-2">
                  <button 
                    v-for="num in getNumberRange()"
                    :key="num"
                    @click="toggleTicketNumber(num)"
                    :class="[
                      selectedNumbers.includes(num) ? 'bg-blue-600 text-white' : 
                      isNumberSold(num) ? 'bg-red-500 text-white cursor-not-allowed' :
                      'bg-gray-100 text-gray-700 hover:bg-gray-200',
                      !isNumberAvailable(num) && !isNumberSold(num) ? 'opacity-50 cursor-not-allowed' : ''
                    ]"
                    class="w-8 h-8 rounded text-sm font-medium transition-colors"
                    :disabled="!isNumberAvailable(num)"
                    :title="isNumberSold(num) ? 'Número ya vendido' : isNumberAvailable(num) ? 'Disponible' : 'No disponible'"
                  >
                    {{ num }}
                  </button>
                </div>
              </div>
              
              <!-- Legend -->
              <div class="mt-3 flex gap-4 text-xs text-gray-600">
                <div class="flex items-center gap-1">
                  <div class="w-3 h-3 bg-gray-100 rounded"></div>
                  <span>Disponible</span>
                </div>
                <div class="flex items-center gap-1">
                  <div class="w-3 h-3 bg-blue-600 rounded"></div>
                  <span>Seleccionado</span>
                </div>
                <div class="flex items-center gap-1">
                  <div class="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Ya vendido</span>
                </div>
              </div>
              
              <div class="mt-3 text-sm text-gray-600">
                <div>
                  Seleccionados: {{ selectedNumbers.length }} tickets
                  <span v-if="!lottery.is_free && selectedNumbers.length > 0">
                    (Total: {{ getTotalPrice() }})
                  </span>
                </div>
                <div class="mt-1 text-xs">
                  Disponibles: {{ getAvailableCount() }} | Vendidos: {{ soldTickets.length }}
                </div>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div v-if="selectedNumbers.length > 0" class="bg-gray-50 rounded-lg p-4">
            <h5 class="font-medium text-gray-900 mb-3">Resumen de compra</h5>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Números seleccionados:</span>
                <span class="font-medium">{{ selectedNumbers.sort((a, b) => a - b).join(', ') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Cantidad de tickets:</span>
                <span class="font-medium">{{ getSelectedCount() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Precio por ticket:</span>
                <span class="font-medium">{{ lottery.is_free ? 'Gratis' : `$${lottery.ticket_price}` }}</span>
              </div>
              <div class="flex justify-between border-t pt-2">
                <span class="text-gray-900 font-medium">Total a pagar:</span>
                <span class="text-gray-900 font-medium">{{ getTotalPrice() }}</span>
              </div>
            </div>
          </div>
          
          <!-- Selection prompt -->
          <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <span class="text-yellow-800 text-sm">Selecciona al menos un número para continuar</span>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="text-red-800">{{ error }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="px-6 py-4 border-t border-gray-200">
        <div class="flex justify-between">
          <button 
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="handleParticipation"
            :disabled="loading || !canParticipate()"
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
            <span v-else>
              {{ lottery?.is_free ? 'Obtener Tickets' : 'Comprar Tickets' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { lotteryService } from '@/services/lotteryService'
import type { Lottery } from '@/types/lottery'

const props = defineProps<{
  lottery: Lottery | null
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

// State
const loading = ref(false)
const error = ref('')
const selectedQuantity = ref(1)
const selectedNumbers = ref<number[]>([])
const availableNumbers = ref<number[]>([])
const soldTickets = ref<number[]>([])

// Computed
const availableTickets = computed(() => {
  if (!props.lottery) return 0
  return props.lottery.max_tickets - (props.lottery.tickets_sold || 0)
})

// Methods
const loadAvailableNumbers = async () => {
  if (!props.lottery) return
  
  try {
    const numbers = await lotteryService.getAvailableTicketNumbers(props.lottery.id)
    availableNumbers.value = numbers
    
    // Load sold tickets (fallback to localStorage for now)
    try {
      const sold = await lotteryService.getSoldTickets(props.lottery.id)
      soldTickets.value = sold
    } catch (error) {
      // Fallback: use localStorage to track sold tickets temporarily
      const localSoldKey = `sold_tickets_lottery_${props.lottery.id}`
      const localSold = JSON.parse(localStorage.getItem(localSoldKey) || '[]')
      soldTickets.value = localSold
    }
  } catch (error) {
    console.error('Error loading available numbers:', error)
    // Fallback: generate numbers from 1 to max_tickets
    if (props.lottery) {
      availableNumbers.value = Array.from({ length: props.lottery.max_tickets }, (_, i) => i + 1)
    }
  }
}

const getNumberRange = () => {
  if (!props.lottery) return []
  return Array.from({ length: props.lottery.max_tickets }, (_, i) => i + 1)
}

const toggleTicketNumber = (num: number) => {
  if (!isNumberAvailable(num)) return
  
  const index = selectedNumbers.value.indexOf(num)
  if (index > -1) {
    selectedNumbers.value.splice(index, 1)
  } else {
    selectedNumbers.value.push(num)
  }
}

const isNumberAvailable = (num: number) => {
  if (num < 1 || num > (props.lottery?.max_tickets || 0)) return false
  return !soldTickets.value.includes(num)
}

const isNumberSold = (num: number) => {
  return soldTickets.value.includes(num)
}

const selectRandomNumbers = (count: number) => {
  if (!props.lottery) return
  
  clearSelection()
  const available = getNumberRange().filter(num => isNumberAvailable(num))
  const shuffled = available.sort(() => 0.5 - Math.random())
  selectedNumbers.value = shuffled.slice(0, Math.min(count, available.length))
}

const getAvailableCount = () => {
  return getNumberRange().filter(num => isNumberAvailable(num)).length
}

const clearSelection = () => {
  selectedNumbers.value = []
}

const getSelectedCount = () => {
  return selectedNumbers.value.length
}

const getTotalPrice = () => {
  if (!props.lottery) return '$0'
  
  if (props.lottery.is_free) {
    return 'Gratis'
  }
  
  const total = selectedNumbers.value.length * props.lottery.ticket_price
  return lotteryService.formatCurrency(total)
}

const canParticipate = () => {
  if (!props.lottery) return false
  return selectedNumbers.value.length > 0 && selectedNumbers.value.length <= getAvailableCount()
}

const handleParticipation = async () => {
  if (!props.lottery || selectedNumbers.value.length === 0) {
    error.value = 'Debes seleccionar al menos un número'
    return
  }
  
  try {
    loading.value = true
    error.value = ''
    
    // Always use the selected numbers
    const ticketNumbers = [...selectedNumbers.value].sort((a, b) => a - b)
    
    console.log('Buying tickets:', {
      lotteryId: props.lottery.id,
      ticketNumbers: ticketNumbers,
      isFreeLottery: props.lottery.is_free
    })
    
    // Simplified payload - try basic format first
    const payload = {
      ticket_numbers: ticketNumbers
    }
    
    console.log('Payload being sent:', payload)
    
    await lotteryService.buyTickets(props.lottery.id, payload)
    
    // Save purchased tickets to localStorage as fallback
    const localSoldKey = `sold_tickets_lottery_${props.lottery.id}`
    const currentSold = JSON.parse(localStorage.getItem(localSoldKey) || '[]')
    const newSold = [...new Set([...currentSold, ...ticketNumbers])]
    localStorage.setItem(localSoldKey, JSON.stringify(newSold))
    
    // Refresh sold tickets after successful purchase
    await loadAvailableNumbers()
    
    // Clear selection
    clearSelection()
    
    emit('success')
  } catch (err: any) {
    console.error('Error buying tickets:', err)
    if (err.response && err.response.data && err.response.data.message) {
      error.value = err.response.data.message
    } else {
      error.value = err.message || 'Error al participar en la lotería'
    }
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadAvailableNumbers()
})
</script> 