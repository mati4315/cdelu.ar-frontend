import { ref, computed } from 'vue'
import { useLotteryStore } from '@/store/lottery'
import type { Lottery, BuyTicketsData } from '@/types/lottery'

export function useLottery() {
  const store = useLotteryStore()
  
  // Estado local
  const selectedTicketNumbers = ref<number[]>([])
  const ticketQuantity = ref(1)
  const showParticipationModal = ref(false)
  const showDetailModal = ref(false)
  const showWinnersModal = ref(false)
  const currentLotteryForModal = ref<Lottery | null>(null)

  // Computed
  const canParticipate = computed(() => {
    if (!currentLotteryForModal.value) return false
    
    const lottery = currentLotteryForModal.value
    return lottery.status === 'active' && lottery.tickets_sold! < lottery.max_tickets
  })

  const availableTickets = computed(() => {
    if (!currentLotteryForModal.value) return 0
    return currentLotteryForModal.value.max_tickets - (currentLotteryForModal.value.tickets_sold || 0)
  })

  const totalPrice = computed(() => {
    if (!currentLotteryForModal.value) return 0
    return currentLotteryForModal.value.ticket_price * ticketQuantity.value
  })

  const isFreeLottery = computed(() => {
    return currentLotteryForModal.value?.is_free || false
  })

  // Funciones
  const openParticipationModal = (lottery: Lottery) => {
    currentLotteryForModal.value = lottery
    selectedTicketNumbers.value = []
    ticketQuantity.value = 1
    showParticipationModal.value = true
  }

  const openDetailModal = (lottery: Lottery) => {
    currentLotteryForModal.value = lottery
    showDetailModal.value = true
  }

  const openWinnersModal = async (lottery: Lottery) => {
    currentLotteryForModal.value = lottery
    await store.fetchWinners(lottery.id)
    showWinnersModal.value = true
  }

  const closeModals = () => {
    showParticipationModal.value = false
    showDetailModal.value = false
    showWinnersModal.value = false
    currentLotteryForModal.value = null
    selectedTicketNumbers.value = []
    ticketQuantity.value = 1
  }

  const selectTicketNumber = (number: number) => {
    const index = selectedTicketNumbers.value.indexOf(number)
    if (index > -1) {
      selectedTicketNumbers.value.splice(index, 1)
    } else {
      if (selectedTicketNumbers.value.length < ticketQuantity.value) {
        selectedTicketNumbers.value.push(number)
      }
    }
  }

  const isTicketSelected = (number: number) => {
    return selectedTicketNumbers.value.includes(number)
  }

  const canSelectMoreTickets = computed(() => {
    return selectedTicketNumbers.value.length < ticketQuantity.value
  })

  const validateParticipation = () => {
    if (!currentLotteryForModal.value) return 'Lotería no válida'
    
    const lottery = currentLotteryForModal.value
    
    if (lottery.status !== 'active') {
      return 'Esta lotería no está activa'
    }
    
    if (lottery.tickets_sold! >= lottery.max_tickets) {
      return 'Esta lotería está completa'
    }
    
    if (isFreeLottery.value) {
      if (ticketQuantity.value < 1) {
        return 'Debe seleccionar al menos 1 ticket'
      }
      if (ticketQuantity.value > availableTickets.value) {
        return `Solo quedan ${availableTickets.value} tickets disponibles`
      }
    } else {
      if (selectedTicketNumbers.value.length !== ticketQuantity.value) {
        return `Debe seleccionar exactamente ${ticketQuantity.value} números`
      }
    }
    
    return null
  }

  const participateInLottery = async () => {
    const error = validateParticipation()
    if (error) {
      store.error = error
      return { success: false, error }
    }

    if (!currentLotteryForModal.value) {
      return { success: false, error: 'Lotería no válida' }
    }

    const lottery = currentLotteryForModal.value
    const data: BuyTicketsData = {
      ticket_numbers: isFreeLottery.value 
        ? Array.from({ length: ticketQuantity.value }, (_, i) => i + 1)
        : selectedTicketNumbers.value
    }

    const result = await store.buyTickets(lottery.id, data)
    
    if (result.success) {
      closeModals()
      return { success: true }
    } else {
      return { success: false, error: result.error }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
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

  return {
    // Estado
    selectedTicketNumbers,
    ticketQuantity,
    showParticipationModal,
    showDetailModal,
    showWinnersModal,
    currentLotteryForModal,
    
    // Computed
    canParticipate,
    availableTickets,
    totalPrice,
    isFreeLottery,
    canSelectMoreTickets,
    
    // Funciones
    openParticipationModal,
    openDetailModal,
    openWinnersModal,
    closeModals,
    selectTicketNumber,
    isTicketSelected,
    validateParticipation,
    participateInLottery,
    formatCurrency,
    formatDate,
    getStatusText,
    getStatusClass,
    getProgressPercentage,
    getTimeRemaining
  }
} 