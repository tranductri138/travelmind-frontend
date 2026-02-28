import { apiClient } from './client'
import type { SearchResult } from '@/types/search'
import type { PaginatedResponse } from '@/types/common'

export const searchApi = {
  search(params: { q: string; page?: number; limit?: number }) {
    return apiClient.get<PaginatedResponse<SearchResult>>('/search', { params })
  },
}
