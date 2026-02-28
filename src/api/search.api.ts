import { apiClient } from './client'
import type { SearchResult, SemanticSearchRequest } from '@/types/search'
import type { PaginatedResponse, ApiResponse } from '@/types/common'

export const searchApi = {
  fullText(params: { q: string; page?: number; limit?: number }) {
    return apiClient.get<PaginatedResponse<SearchResult>>('/search', { params })
  },

  semantic(data: SemanticSearchRequest) {
    return apiClient.post<ApiResponse<SearchResult[]>>('/search/semantic', data)
  },
}
