import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { lotteryService } from '@/services/lotteryService'
import type { 
  Lottery, 
  LotteryTicket, 
  LotteryWinner, 
  CreateLotteryData, 
  UpdateLotteryData, 
  BuyTicketsData, 
  LotteryFilters,
  LotteryStats
} from '@/types/lottery'

export const useLotteryStore = defineStore('lottery', () => {
  // Estado
  const lotteries = ref<Lottery[]>([])
  const currentLottery = ref<Lottery | null>(null)
  const userTickets = ref<LotteryTicket[]>([])
  const winners = ref<LotteryWinner[]>([])
  const stats = ref<LotteryStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<LotteryFilters>({
    page: 1,
    limit: 12,
    status: undefined,
    is_free: undefined
  })

  // Getters
  const activeLotteries = computed(() => 
    lotteries.value.filter(l => l.status === 'active')
  )

  const freeLotteries = computed(() => 
    lotteries.value.filter(l => l.is_free && l.status === 'active')
  )

  const paidLotteries = computed(() => 
    lotteries.value.filter(l => !l.is_free && l.status === 'active')
  )

  const draftLotteries = computed(() => 
    lotteries.value.filter(l => l.status === 'draft')
  )

  const finishedLotteries = computed(() => 
    lotteries.value.filter(l => l.status === 'finished')
  )

  // Acciones
  const fetchLotteries = async (newFilters?: LotteryFilters) => {
    try {
      loading.value = true
      error.value = null
      
      const filtersToUse = newFilters || filters.value
      const response = await lotteryService.getLotteries(filtersToUse)
      
      if (response.success) {
        lotteries.value = Array.isArray(response.data) ? response.data : [response.data]
        filters.value = { ...filtersToUse }
      } else {
        error.value = response.message || 'Error al cargar loterías'
      }
    } catch (err) {
      error.value = 'Error de conexión al cargar loterías'
      console.error('Error fetching lotteries:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchLottery = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await lotteryService.getLottery(id)
      
      if (response.success) {
        currentLottery.value = response.data as Lottery
      } else {
        error.value = response.message || 'Error al cargar lotería'
      }
    } catch (err) {
      error.value = 'Error de conexión al cargar lotería'
      console.error('Error fetching lottery:', err)
    } finally {
      loading.value = false
    }
  }

  const createLottery = async (data: CreateLotteryData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await lotteryService.createLottery(data)
      
      if (response.success) {
        const newLottery = response.data as Lottery
        lotteries.value.unshift(newLottery)
        return { success: true, lottery: newLottery }
      } else {
        error.value = response.message || 'Error al crear lotería'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = 'Error de conexión al crear lotería'
      console.error('Error creating lottery:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateLottery = async (id: number, data: UpdateLotteryData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await lotteryService.updateLottery(id, data)
      
      if (response.success) {
        const updatedLottery = response.data as Lottery
        const index = lotteries.value.findIndex(l => l.id === id)
        if (index !== -1) {
          lotteries.value[index] = updatedLottery
        }
        if (currentLottery.value?.id === id) {
          currentLottery.value = updatedLottery
        }
        return { success: true, lottery: updatedLottery }
      } else {
        error.value = response.message || 'Error al actualizar lotería'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = 'Error de conexión al actualizar lotería'
      console.error('Error updating lottery:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const buyTickets = async (lotteryId: number, data: BuyTicketsData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await lotteryService.buyTickets(lotteryId, data)
      
      if (response.success) {
        // Actualizar lotería actual
        await fetchLottery(lotteryId)
        // Actualizar tickets del usuario
        await fetchUserTickets(lotteryId)
        return { success: true, tickets: response.data }
      } else {
        error.value = response.message || 'Error al comprar tickets'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = 'Error de conexión al comprar tickets'
      console.error('Error buying tickets:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const fetchUserTickets = async (lotteryId: number) => {
    try {
      const response = await lotteryService.getUserTickets(lotteryId)
      
      if (response.success) {
        userTickets.value = response.data
      }
    } catch (err) {
      console.error('Error fetching user tickets:', err)
    }
  }

  const finishLottery = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await lotteryService.finishLottery(id)
      
      if (response.success) {
        const updatedLottery = response.data as Lottery
        const index = lotteries.value.findIndex(l => l.id === id)
        if (index !== -1) {
          lotteries.value[index] = updatedLottery
        }
        if (currentLottery.value?.id === id) {
          currentLottery.value = updatedLottery
        }
        return { success: true, lottery: updatedLottery }
      } else {
        error.value = response.message || 'Error al finalizar lotería'
        return { success: false, error: error.value }
      }
    } catch (err) {
      error.value = 'Error de conexión al finalizar lotería'
      console.error('Error finishing lottery:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const fetchWinners = async (lotteryId: number) => {
    try {
      const response = await lotteryService.getWinners(lotteryId)
      
      if (response.success) {
        winners.value = response.data
      }
    } catch (err) {
      console.error('Error fetching winners:', err)
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    lotteries.value = []
    currentLottery.value = null
    userTickets.value = []
    winners.value = []
    stats.value = null
    loading.value = false
    error.value = null
    filters.value = {
      page: 1,
      limit: 12,
      status: undefined,
      is_free: undefined
    }
  }

  return {
    // Estado
    lotteries,
    currentLottery,
    userTickets,
    winners,
    stats,
    loading,
    error,
    filters,
    
    // Getters
    activeLotteries,
    freeLotteries,
    paidLotteries,
    draftLotteries,
    finishedLotteries,
    
    // Acciones
    fetchLotteries,
    fetchLottery,
    createLottery,
    updateLottery,
    buyTickets,
    fetchUserTickets,
    finishLottery,
    fetchWinners,
    clearError,
    reset
  }
}) 