<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            Ganadores - {{ lottery?.title }}
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
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Cargando ganadores...</p>
        </div>

        <div v-else-if="winners.length === 0" class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay ganadores</h3>
          <p class="mt-1 text-sm text-gray-500">La lotería aún no ha finalizado o no se han seleccionado ganadores.</p>
        </div>

        <div v-else>
          <div class="mb-4">
            <p class="text-sm text-gray-600">
              Se han seleccionado <span class="font-semibold">{{ winners.length }}</span> ganadores
            </p>
          </div>

          <div class="space-y-4">
            <div 
              v-for="winner in winners" 
              :key="winner.id"
              class="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 class="font-medium text-gray-900">
                        {{ winner.username || `Usuario ${winner.user_id}` }}
                      </h4>
                      <p class="text-sm text-gray-600">{{ winner.email }}</p>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-gray-500">Ticket:</span>
                      <span class="font-medium ml-1">#{{ winner.ticket_number }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Fecha:</span>
                      <span class="font-medium ml-1">{{ formatDate(winner.created_at) }}</span>
                    </div>
                  </div>

                  <div v-if="winner.prize_description" class="mt-2">
                    <span class="text-gray-500">Premio:</span>
                    <span class="font-medium ml-1">{{ winner.prize_description }}</span>
                  </div>
                </div>

                <div class="text-right">
                  <span 
                    :class="winner.claimed_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ winner.claimed_at ? 'Reclamado' : 'Pendiente' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="px-6 py-4 border-t border-gray-200">
        <div class="flex justify-end">
          <button 
            @click="$emit('close')"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { lotteryService } from '@/services/lotteryService'
import type { Lottery, LotteryWinner } from '@/types/lottery'

const props = defineProps<{
  lottery: Lottery | null
}>()

const emit = defineEmits<{
  close: []
}>()

// State
const winners = ref<LotteryWinner[]>([])
const loading = ref(false)

// Methods
const loadWinners = async () => {
  if (!props.lottery) return
  
  try {
    loading.value = true
    const response = await lotteryService.getWinners(props.lottery.id)
    winners.value = response.data
  } catch (error) {
    console.error('Error loading winners:', error)
  } finally {
    loading.value = false
  }
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
  loadWinners()
})
</script> 