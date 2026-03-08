import { apiClient } from './client'
import type { Booking, CreateBookingRequest, CreateBookingResponse } from '@/types/booking'
import type { ApiResponse, PaginatedResponse } from '@/types/common'

export const bookingApi = {
  create(data: CreateBookingRequest) {
    return apiClient.post<ApiResponse<CreateBookingResponse>>('/bookings', data)
  },

  list(params?: { page?: number; limit?: number; status?: string }) {
    return apiClient.get<PaginatedResponse<Booking>>('/bookings', { params })
  },

  listAdmin(params?: { page?: number; limit?: number; status?: string }) {
    return apiClient.get<PaginatedResponse<Booking>>('/bookings/admin', { params })
  },

  detail(id: string) {
    return apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`)
  },

  cancel(id: string) {
    return apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`)
  },

  delete(id: string) {
    return apiClient.delete(`/bookings/${id}`)
  },
}
