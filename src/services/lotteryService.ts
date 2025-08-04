import axios from 'axios'
import type { 
  Lottery, 
  LotteryTicket, 
  LotteryWinner, 
  CreateLotteryData, 
  UpdateLotteryData, 
  BuyTicketsData, 
  LotteryFilters,
  LotteryResponse,
  TicketsResponse,
  WinnersResponse
} from '@/types/lottery'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'

// Create axios instance for lottery API
const lotteryApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
lotteryApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

class LotteryService {
  private baseUrl = '/lotteries'

  async getLotteries(filters?: LotteryFilters): Promise<LotteryResponse> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }

    const response = await lotteryApi.get(`${this.baseUrl}?${params.toString()}`)
    return response.data
  }

  async getLottery(id: number): Promise<LotteryResponse> {
    const response = await lotteryApi.get(`${this.baseUrl}/${id}`)
    return response.data
  }

  async createLottery(data: CreateLotteryData): Promise<LotteryResponse> {
    const response = await lotteryApi.post(this.baseUrl, data)
    return response.data
  }

  async updateLottery(id: number, data: UpdateLotteryData): Promise<LotteryResponse> {
    const response = await lotteryApi.put(`${this.baseUrl}/${id}`, data)
    return response.data
  }

  async activateLottery(id: number): Promise<LotteryResponse> {
    const response = await lotteryApi.put(`${this.baseUrl}/${id}`, { status: 'active' })
    return response.data
  }

  async cancelLottery(id: number): Promise<LotteryResponse> {
    const response = await lotteryApi.put(`${this.baseUrl}/${id}/cancel`, {})
    return response.data
  }

  async deleteLottery(id: number): Promise<LotteryResponse> {
    const response = await lotteryApi.delete(`${this.baseUrl}/${id}`)
    return response.data
  }

  async buyTickets(lotteryId: number, data: BuyTicketsData): Promise<TicketsResponse> {
    const response = await lotteryApi.post(`${this.baseUrl}/${lotteryId}/buy`, data)
    return response.data
  }

  async getUserTickets(lotteryId: number): Promise<TicketsResponse> {
    const response = await lotteryApi.get(`${this.baseUrl}/${lotteryId}/tickets`)
    return response.data
  }

  async getSoldTickets(lotteryId: number): Promise<number[]> {
    try {
      // Try to get user tickets as a fallback until backend implements sold-tickets endpoint
      const userTicketsResponse = await this.getUserTickets(lotteryId)
      if (userTicketsResponse.data && Array.isArray(userTicketsResponse.data)) {
        return userTicketsResponse.data.map((ticket: any) => ticket.ticket_number).filter(Boolean)
      }
      return []
    } catch (error) {
      console.warn('Could not fetch sold tickets:', error)
      return []
    }
  }

  async finishLottery(id: number): Promise<LotteryResponse> {
    // Según la documentación, finalizar una lotería es cambiar su status a 'finished'
    const response = await lotteryApi.put(`${this.baseUrl}/${id}`, { status: 'finished' })
    return response.data
  }

  async getWinners(lotteryId: number): Promise<WinnersResponse> {
    const response = await lotteryApi.get(`${this.baseUrl}/${lotteryId}/winners`)
    return response.data
  }

  async getUserHistory(page = 1, limit = 10): Promise<TicketsResponse> {
    const response = await lotteryApi.get(`${this.baseUrl}/user/history?page=${page}&limit=${limit}`)
    return response.data
  }

  // Helper methods
  async getAvailableTicketNumbers(lotteryId: number): Promise<number[]> {
    try {
      const lottery = await this.getLottery(lotteryId)
      const lotteryData = lottery.data as Lottery
      
      // Generate all possible ticket numbers
      const allNumbers: number[] = []
      for (let i = 1; i <= lotteryData.max_tickets; i++) {
        allNumbers.push(i)
      }
      
      // TODO: Later you can fetch sold tickets and filter them out
      // For now, return all numbers as available
      return allNumbers
    } catch (error) {
      console.error('Error getting available ticket numbers:', error)
      return []
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  getStatusText(status: string): string {
    const texts = {
      draft: 'Borrador',
      active: 'Activa',
      finished: 'Finalizada',
      cancelled: 'Cancelada'
    }
    return texts[status as keyof typeof texts] || status
  }

  getStatusClass(status: string): string {
    const classes = {
      draft: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      finished: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
  }
}

export const lotteryService = new LotteryService() 