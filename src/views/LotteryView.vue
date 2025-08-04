<template>
  <div class="lottery-view">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Loterías Disponibles</h1>
            <p class="text-gray-600">Participa en loterías gratuitas y de pago</p>
          </div>
          
          <!-- Admin Controls -->
          <div v-if="isAdmin" class="flex gap-3">
            <button 
              @click="openCreateModal"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Nueva Lotería
            </button>
            <router-link 
              to="/admin/lotteries"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Administrar
            </router-link>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-6 flex flex-wrap gap-4">
        <button 
          @click="filterType = 'all'"
          :class="filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
          class="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          Todas
        </button>
        <button 
          @click="filterType = 'free'"
          :class="filterType === 'free' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'"
          class="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          Gratuitas
        </button>
        <button 
          @click="filterType = 'paid'"
          :class="filterType === 'paid' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'"
          class="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          De Pago
        </button>
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

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Cargando loterías...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredLotteries.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🎰</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No hay loterías disponibles</h3>
        <p class="text-gray-500">Vuelve más tarde para participar en nuevas loterías.</p>
      </div>

      <!-- Lotteries Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <LotteryCard
          v-for="lottery in filteredLotteries"
          :key="lottery.id"
          :lottery="lottery"
          @view-details="openDetailModal"
          @participate="openParticipationModal"
        />
      </div>

      <!-- Modals -->
      <LotteryDetailModal
        v-if="showDetailModal"
        :lottery="currentLotteryForModal"
        @close="closeModals"
        @participate="openParticipationModal"
        @view-winners="openWinnersModal"
      />

      <ParticipationModal
        v-if="showParticipationModal"
        :lottery="currentLotteryForModal"
        @close="closeModals"
        @success="onParticipationSuccess"
      />

      <WinnersModal
        v-if="showWinnersModal"
        :lottery="currentLotteryForModal"
        :winners="winners"
        @close="closeModals"
      />

      <!-- Create/Edit Lottery Modal -->
      <CreateLotteryModal
        v-if="showCreateModal"
        :lottery="editingLottery"
        @close="closeCreateModal"
        @success="onLotteryCreated"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLotteryStore } from '@/store/lottery'
import { useAuthStore } from '@/store/auth'
import { useLottery } from '@/composables/useLottery'
import LotteryCard from '@/components/lottery/LotteryCard.vue'
import LotteryDetailModal from '@/components/lottery/LotteryDetailModal.vue'
import ParticipationModal from '@/components/lottery/ParticipationModal.vue'
import WinnersModal from '@/components/lottery/WinnersModal.vue'
import CreateLotteryModal from '@/components/lottery/CreateLotteryModal.vue'
import type { Lottery } from '@/types/lottery'

// Store y composable
const store = useLotteryStore()
const authStore = useAuthStore()
const {
  showDetailModal,
  showParticipationModal,
  showWinnersModal,
  currentLotteryForModal,
  openDetailModal,
  openParticipationModal,
  openWinnersModal,
  closeModals
} = useLottery()

const winners = computed(() => store.winners)

// Estado local
const filterType = ref<'all' | 'free' | 'paid'>('all')
const showCreateModal = ref(false)
const editingLottery = ref<Lottery | null>(null)

// Computed
const loading = computed(() => store.loading)
const error = computed(() => store.error)
const lotteries = computed(() => store.lotteries)
const isAdmin = computed(() => authStore.user?.rol === 'administrador')

const filteredLotteries = computed(() => {
  const allLotteries = lotteries.value.filter(l => l.status === 'active')
  
  switch (filterType.value) {
    case 'free':
      return allLotteries.filter(l => l.is_free)
    case 'paid':
      return allLotteries.filter(l => !l.is_free)
    default:
      return allLotteries
  }
})

// Métodos
const clearError = () => {
  store.clearError()
}

const onParticipationSuccess = () => {
  // Recargar loterías para actualizar estadísticas
  store.fetchLotteries()
}

// Métodos para el modal de creación
const openCreateModal = () => {
  editingLottery.value = null
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  editingLottery.value = null
}

const onLotteryCreated = () => {
  closeCreateModal()
  store.fetchLotteries()
}

// Lifecycle
onMounted(async () => {
  await store.fetchLotteries()
})
</script>

<style scoped>
.lottery-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style> 