import { apiClient } from './client'
import type { Room, CreateRoomRequest, CheckAvailabilityRequest, CheckAvailabilityResponse } from '@/types/room'
import type { ApiResponse } from '@/types/common'

export const roomApi = {
  listByHotel(hotelId: string) {
    return apiClient.get<ApiResponse<Room[]>>(`/hotels/${hotelId}/rooms`)
  },

  checkAvailability(data: CheckAvailabilityRequest) {
    return apiClient.post<ApiResponse<CheckAvailabilityResponse>>('/rooms/availability', data)
  },

  create(data: CreateRoomRequest) {
    return apiClient.post<ApiResponse<Room>>('/rooms', data)
  },

  delete(id: string) {
    return apiClient.delete(`/rooms/${id}`)
  },

  hardDelete(id: string) {
    return apiClient.delete(`/rooms/${id}/permanent`)
  },
}
