import { useQuery } from '@tanstack/react-query'
import { searchApi } from '@/api/search.api'
import { queryKeys } from '@/config/query-keys'

export function useFullTextSearch(query: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.search.fullText(query),
    queryFn: () => searchApi.fullText({ q: query, ...params }).then((r) => r.data),
    enabled: query.length > 0,
  })
}

export function useSemanticSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.search.semantic(query),
    queryFn: () => searchApi.semantic({ query }).then((r) => r.data.data),
    enabled: query.length > 0,
  })
}
