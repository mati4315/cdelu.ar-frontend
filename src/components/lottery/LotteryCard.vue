<template>
  <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
    <!-- Imagen de la lotería -->
    <div class="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
      <img 
        v-if="lottery.image_url" 
        :src="lottery.image_url" 
        :alt="lottery.title"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <div class="text-white text-4xl font-bold">🎰</div>
      </div>
      
      <!-- Badge de estado -->
      <div class="absolute top-3 left-3">
        <span :class="getStatusClass(lottery.status)" class="px-2 py-1 rounded-full text-xs font-medium">
          {{ getStatusText(lottery.status) }}
        </span>
      </div>
      
      <!-- Badge de tipo -->
      <div class="absolute top-3 right-3">
        <span :class="lottery.is_free ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'" 
              class="px-2 py-1 rounded-full text-xs font-medium">
          {{ lottery.is_free ? 'Gratuita' : 'De Pago' }}
        </span>
      </div>
    </div>

    <!-- Contenido -->
    <div class="p-4">
      <!-- Título -->
      <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {{ lottery.title }}
      </h3>
      
      <!-- Descripción -->
      <p v-if="lottery.description" class="text-gray-600 text-sm mb-3 line-clamp-2">
        {{ lottery.description }}
      </p>
      
      <!-- Información de premios -->
      <div class="mb-3">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">Premios:</span>
          <span class="font-medium text-gray-900">{{ lottery.num_winners }} ganadores</span>
        </div>
        <div v-if="lottery.prize_description" class="text-xs text-gray-500 mt-1">
          {{ lottery.prize_description }}
        </div>
      </div>
      
      <!-- Progreso de tickets -->
      <div class="mb-3">
        <div class="flex items-center justify-between text-sm mb-1">
          <span class="text-gray-600">Tickets vendidos:</span>
          <span class="font-medium text-gray-900">
            {{ lottery.tickets_sold || 0 }} / {{ lottery.max_tickets }}
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${getProgressPercentage(lottery)}%` }"
          ></div>
        </div>
      </div>
      
      <!-- Precio y tiempo restante -->
      <div class="flex items-center justify-between mb-4">
        <div class="text-sm">
          <span class="text-gray-600">Precio:</span>
          <span class="font-medium text-gray-900 ml-1">
            {{ lottery.is_free ? 'Gratis' : formatCurrency(lottery.ticket_price) }}
          </span>
        </div>
        <div class="text-sm">
          <span class="text-gray-600">Termina:</span>
          <span class="font-medium text-gray-900 ml-1">
            {{ getTimeRemaining(lottery.end_date) }}
          </span>
        </div>
      </div>
      
      <!-- Botones de acción -->
      <div class="flex gap-2">
        <router-link
          :to="`/lotteries/${lottery.id}`"
          class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-center"
        >
          Ver Detalles
        </router-link>
        
        <router-link
          v-if="canParticipate"
          :to="`/lotteries/${lottery.id}`"
          class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-center"
        >
          Participar
        </router-link>
        
        <button
          v-else
          disabled
          class="flex-1 bg-gray-300 text-gray-500 px-3 py-2 rounded-md text-sm font-medium cursor-not-allowed"
        >
          {{ getDisabledText() }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Lottery } from '@/types/lottery'

interface Props {
  lottery: Lottery
}

const props = defineProps<Props>()

// Computed
const canParticipate = computed(() => {
  return props.lottery.status === 'active' && 
         (props.lottery.tickets_sold || 0) < props.lottery.max_tickets
})

// Funciones
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

const getProgressPercentage = (lottery: Lottery) => {
  const sold = lottery.tickets_sold || 0
  const max = lottery.max_tickets
  return Math.round((sold / max) * 100)
}

const getTimeRemaining = (endDate: string) => {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end.getTime() - now.getTime()
  
  if (diff <= 0) return 'Finalizada'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount)
}

const getDisabledText = () => {
  if (props.lottery.status === 'finished') return 'Finalizada'
  if (props.lottery.status === 'cancelled') return 'Cancelada'
  if ((props.lottery.tickets_sold || 0) >= props.lottery.max_tickets) return 'Completa'
  return 'No disponible'
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 