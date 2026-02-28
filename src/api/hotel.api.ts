import { apiClient } from './client'
import type {
  Hotel,
  CreateHotelRequest,
  UpdateHotelRequest,
  SearchHotelParams,
} from '@/types/hotel'
import type { ApiResponse, PaginatedResponse } from '@/types/common'

export const hotelApi = {
  list(params?: SearchHotelParams) {
    return apiClient.get<PaginatedResponse<Hotel>>('/hotels', { params })
  },

  detail(id: string) {
    return apiClient.get<ApiResponse<Hotel>>(`/hotels/${id}`)
  },

  nearby(params: { latitude: number; longitude: number; radius?: number }) {
    return apiClient.get<ApiResponse<Hotel[]>>('/hotels/nearby', { params })
  },

  create(data: CreateHotelRequest) {
    return apiClient.post<ApiResponse<Hotel>>('/hotels', data)
  },

  update(id: string, data: UpdateHotelRequest) {
    return apiClient.patch<ApiResponse<Hotel>>(`/hotels/${id}`, data)
  },

  delete(id: string) {
    return apiClient.delete(`/hotels/${id}`)
  },

  hardDelete(id: string) {
    return apiClient.delete(`/hotels/${id}/permanent`)
  },

  uploadImages(files: File[]) {
    const formData = new FormData()
    files.forEach((file) => formData.append('images', file))
    return apiClient.post<{ success: boolean; data: string[] }>(
      '/upload/hotel-images',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
  },
}
