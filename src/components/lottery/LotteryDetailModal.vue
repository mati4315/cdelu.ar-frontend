<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            {{ lottery?.title }}
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
          <!-- Lottery Image -->
          <div class="h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg class="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>

          <!-- Description -->
          <div v-if="lottery.description">
            <h4 class="text-lg font-medium text-gray-900 mb-2">Descripción</h4>
            <p class="text-gray-600">{{ lottery.description }}</p>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-2xl font-bold text-blue-600">{{ lottery.tickets_sold || 0 }}</div>
              <div class="text-sm text-gray-600">Tickets Vendidos</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-2xl font-bold text-green-600">{{ lottery.max_tickets }}</div>
              <div class="text-sm text-gray-600">Total de Tickets</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-2xl font-bold text-purple-600">{{ lottery.num_winners }}</div>
              <div class="text-sm text-gray-600">Ganadores</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-2xl font-bold text-orange-600">{{ lottery.is_free ? 'Gratis' : `$${lottery.ticket_price}` }}</div>
              <div class="text-sm text-gray-600">Precio por Ticket</div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div>
            <div class="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progreso de venta</span>
              <span>{{ ((lottery.tickets_sold || 0) / lottery.max_tickets * 100).toFixed(1) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-blue-600 h-3 rounded-full transition-all duration-300"
                :style="{ width: `${((lottery.tickets_sold || 0) / lottery.max_tickets) * 100}%` }"
              ></div>
            </div>
          </div>

          <!-- Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-3">Información de la Lotería</h4>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Estado:</span>
                  <span 
                    :class="getStatusClass(lottery.status)"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ getStatusText(lottery.status) }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Tipo:</span>
                  <span 
                    :class="lottery.is_free ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ lottery.is_free ? 'Gratuita' : 'De Pago' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Fecha de inicio:</span>
                  <span class="font-medium">{{ formatDate(lottery.start_date) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Fecha de fin:</span>
                  <span class="font-medium">{{ formatDate(lottery.end_date) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Mínimo de tickets:</span>
                  <span class="font-medium">{{ lottery.min_tickets }}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-3">Premio</h4>
              <div v-if="lottery.prize_description" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p class="text-gray-800">{{ lottery.prize_description }}</p>
              </div>
              <div v-else class="text-gray-500 italic">
                No se ha especificado el premio
              </div>
            </div>
          </div>

          <!-- Terms and Conditions -->
          <div v-if="lottery.terms_conditions">
            <h4 class="text-lg font-medium text-gray-900 mb-3">Términos y Condiciones</h4>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-32 overflow-y-auto">
              <p class="text-sm text-gray-700 whitespace-pre-line">{{ lottery.terms_conditions }}</p>
            </div>
          </div>

          <!-- Time Remaining -->
          <div v-if="lottery.status === 'active'" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="font-medium text-blue-900">Tiempo restante</span>
            </div>
            <div class="text-2xl font-bold text-blue-600">{{ timeRemaining }}</div>
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
            Cerrar
          </button>
                     <button 
             v-if="canParticipate && lottery"
             @click="$emit('participate', lottery)"
             class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
           >
             Participar Ahora
           </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Lottery } from '@/types/lottery'

const props = defineProps<{
  lottery: Lottery | null
}>()

const emit = defineEmits<{
  close: []
  participate: [lottery: Lottery]
}>()

// State
const timeRemaining = ref('')
let timer: NodeJS.Timeout | null = null

// Computed
const canParticipate = computed(() => {
  if (!props.lottery) return false
  
  return props.lottery.status === 'active' && 
         (props.lottery.tickets_sold || 0) < props.lottery.max_tickets &&
         new Date(props.lottery.end_date) > new Date()
})

// Methods
const updateTimeRemaining = () => {
  if (!props.lottery || props.lottery.status !== 'active') {
    timeRemaining.value = ''
    return
  }

  const now = new Date()
  const endDate = new Date(props.lottery.end_date)
  const diff = endDate.getTime() - now.getTime()

  if (diff <= 0) {
    timeRemaining.value = 'Finalizada'
    return
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  if (days > 0) {
    timeRemaining.value = `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    timeRemaining.value = `${hours}h ${minutes}m ${seconds}s`
  } else {
    timeRemaining.value = `${minutes}m ${seconds}s`
  }
}

const getStatusText = (status: string) => {
  const texts = {
    draft: 'Borrador',
    active: 'Activa',
    finished: 'Finalizada',
    cancelled: 'Cancelada'
  }
  return texts[status as keyof typeof texts] || status
}

const getStatusClass = (status: string) => {
  const classes = {
    draft: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    finished: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  updateTimeRemaining()
  timer = setInterval(updateTimeRemaining, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script> 