import { apiClient } from './client'
import type { Review, CreateReviewRequest, ReviewStats } from '@/types/review'
import type { ApiResponse, PaginatedResponse } from '@/types/common'

export const reviewApi = {
  listByHotel(hotelId: string, params?: { page?: number; limit?: number }) {
    return apiClient.get<PaginatedResponse<Review>>('/reviews', {
      params: { hotelId, ...params },
    })
  },

  stats(hotelId: string) {
    return apiClient.get<ApiResponse<ReviewStats>>(`/reviews/stats/${hotelId}`)
  },

  create(data: CreateReviewRequest) {
    return apiClient.post<ApiResponse<Review>>('/reviews', data)
  },

  delete(id: string) {
    return apiClient.delete(`/reviews/${id}`)
  },
}
