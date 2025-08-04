<template>
  <div class="lottery-admin">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Administración de Loterías</h1>
        <p class="text-gray-600">Gestiona loterías gratuitas y de pago</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
          <div class="ml-auto pl-3">
            <button @click="clearError" class="text-red-400 hover:text-red-600">
              <span class="sr-only">Cerrar</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Loterías</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.totalLotteries }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Activas</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.activeLotteries }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pendientes</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.pendingLotteries }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Participantes</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.totalParticipants }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <button 
          @click="showCreateModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors duration-200"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Nueva Lotería
        </button>

        <div class="flex gap-2">
          <button 
            @click="filterStatus = 'all'"
            :class="filterStatus === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'"
            class="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Todas
          </button>
          <button 
            @click="filterStatus = 'active'"
            :class="filterStatus === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'"
            class="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Activas
          </button>
          <button 
            @click="filterStatus = 'draft'"
            :class="filterStatus === 'draft' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'"
            class="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Borrador
          </button>
          <button 
            @click="filterStatus = 'finished'"
            :class="filterStatus === 'finished' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'"
            class="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Finalizadas
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Cargando loterías...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredLotteries.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🎰</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No hay loterías</h3>
        <p class="text-gray-500">Crea tu primera lotería para comenzar.</p>
      </div>

      <!-- Lotteries Table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lotería
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tickets
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fechas
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="lottery in filteredLotteries" :key="lottery.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span class="text-white font-bold">🎰</span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ lottery.title }}</div>
                      <div class="text-sm text-gray-500">{{ lottery.is_free ? 'Gratuita' : 'De Pago' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(lottery.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ getStatusText(lottery.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ lottery.tickets_sold || 0 }} / {{ lottery.max_tickets }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>Inicio: {{ formatDate(lottery.start_date) }}</div>
                  <div>Fin: {{ formatDate(lottery.end_date) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex gap-2">
                    <button
                      @click="editLottery(lottery)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                    <button
                      v-if="lottery.status === 'draft'"
                      @click="activateLottery(lottery.id)"
                      class="text-green-600 hover:text-green-900"
                    >
                      Activar
                    </button>
                    <button
                      v-if="lottery.status === 'active'"
                      @click="finishLottery(lottery.id)"
                      class="text-purple-600 hover:text-purple-900"
                    >
                      Finalizar
                    </button>
                    <button
                      @click="viewWinners(lottery)"
                      class="text-orange-600 hover:text-orange-900"
                    >
                      Ganadores
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modals -->
      <LotteryModal
        v-if="showCreateModal || showEditModal"
        :lottery="editingLottery"
        :is-edit="showEditModal"
        @close="closeModals"
        @success="onLotterySuccess"
      />

      <WinnersModal
        v-if="showWinnersModal"
        :lottery="selectedLottery"
        :winners="winners"
        @close="closeModals"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLotteryStore } from '@/store/lottery'
import LotteryModal from '@/components/lottery/LotteryModal.vue'
import WinnersModal from '@/components/lottery/WinnersModal.vue'
import type { Lottery } from '@/types/lottery'

// Store
const store = useLotteryStore()

// Estado local
const filterStatus = ref<'all' | 'active' | 'draft' | 'finished'>('all')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showWinnersModal = ref(false)
const editingLottery = ref<Lottery | null>(null)
const selectedLottery = ref<Lottery | null>(null)

// Computed
const loading = computed(() => store.loading)
const error = computed(() => store.error)
const lotteries = computed(() => store.lotteries)
const winners = computed(() => store.winners)

const stats = computed(() => ({
  totalLotteries: lotteries.value.length,
  activeLotteries: lotteries.value.filter(l => l.status === 'active').length,
  pendingLotteries: lotteries.value.filter(l => l.status === 'draft').length,
  totalParticipants: lotteries.value.reduce((sum, l) => sum + (l.tickets_sold || 0), 0)
}))

const filteredLotteries = computed(() => {
  if (filterStatus.value === 'all') return lotteries.value
  return lotteries.value.filter(l => l.status === filterStatus.value)
})

// Métodos
const clearError = () => {
  store.clearError()
}

const editLottery = (lottery: Lottery) => {
  editingLottery.value = lottery
  showEditModal.value = true
}

const activateLottery = async (id: number) => {
  const result = await store.updateLottery(id, { status: 'active' })
  if (result.success) {
    await store.fetchLotteries()
  }
}

const finishLottery = async (id: number) => {
  const result = await store.finishLottery(id)
  if (result.success) {
    await store.fetchLotteries()
  }
}

const viewWinners = async (lottery: Lottery) => {
  selectedLottery.value = lottery
  await store.fetchWinners(lottery.id)
  showWinnersModal.value = true
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  showWinnersModal.value = false
  editingLottery.value = null
  selectedLottery.value = null
}

const onLotterySuccess = async () => {
  await store.fetchLotteries()
  closeModals()
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
onMounted(async () => {
  await store.fetchLotteries()
})
</script>

<style scoped>
.lottery-admin {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style> 