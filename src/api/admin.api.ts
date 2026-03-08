import { apiClient } from './client'

export interface DashboardStats {
  totalHotels: number
  totalBookings: number
  totalUsers: number
  totalReviews: number
  revenue: number
}

export const adminApi = {
  stats() {
    return apiClient.get<DashboardStats>('/admin/stats')
  },
}
