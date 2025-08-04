export interface Lottery {
  id: number
  title: string
  description?: string
  image_url?: string
  is_free: boolean
  ticket_price: number
  min_tickets: number
  max_tickets: number
  num_winners: number
  start_date: string
  end_date: string
  status: 'draft' | 'active' | 'finished' | 'cancelled'
  created_by: number
  created_by_name?: string
  tickets_sold?: number
  winners_selected?: number
  current_status?: string
  prize_description?: string
  terms_conditions?: string
  created_at: string
  updated_at: string
}

export interface LotteryTicket {
  id: number
  lottery_id: number
  user_id: number
  ticket_number: number
  purchase_date: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_amount: number
  payment_method?: string
  transaction_id?: string
  is_winner: boolean
  created_at: string
}

export interface LotteryWinner {
  id: number
  lottery_id: number
  ticket_id: number
  user_id: number
  ticket_number: number
  prize_description?: string
  notified_at?: string
  claimed_at?: string
  created_at: string
  username?: string
  email?: string
  lottery_title?: string
}

export interface LotteryStats {
  totalLotteries: number
  activeLotteries: number
  pendingLotteries: number
  totalParticipants: number
}

export interface CreateLotteryData {
  title: string
  description?: string
  image_url?: string
  is_free: boolean
  ticket_price: number
  min_tickets: number
  max_tickets: number
  num_winners: number
  start_date: string
  end_date: string
  prize_description?: string
  terms_conditions?: string
}

export interface UpdateLotteryData {
  title?: string
  description?: string
  image_url?: string
  is_free?: boolean
  ticket_price?: number
  min_tickets?: number
  max_tickets?: number
  num_winners?: number
  start_date?: string
  end_date?: string
  status?: string
  prize_description?: string
  terms_conditions?: string
}

export interface BuyTicketsData {
  ticket_numbers: number[]
  payment_method?: string
  quantity?: number
}

export interface LotteryFilters {
  page?: number
  limit?: number
  status?: string
  is_free?: boolean
  created_by?: number
}

export interface LotteryResponse {
  success: boolean
  data: Lottery | Lottery[]
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface TicketsResponse {
  success: boolean
  data: LotteryTicket[]
  message?: string
}

export interface WinnersResponse {
  success: boolean
  data: LotteryWinner[]
  message?: string
} 