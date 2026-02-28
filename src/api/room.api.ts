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

  create(hotelId: string, data: Omit<CreateRoomRequest, 'hotelId'>) {
    return apiClient.post<ApiResponse<Room>>(`/hotels/${hotelId}/rooms`, data)
  },

  delete(hotelId: string, roomId: string) {
    return apiClient.delete(`/hotels/${hotelId}/rooms/${roomId}`)
  },

  hardDelete(hotelId: string, roomId: string) {
    return apiClient.delete(`/hotels/${hotelId}/rooms/${roomId}/permanent`)
  },
}
