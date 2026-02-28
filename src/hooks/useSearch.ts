import { useQuery } from '@tanstack/react-query'
import { searchApi } from '@/api/search.api'
import { queryKeys } from '@/config/query-keys'

export function useSearch(query: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.search.query(query),
    queryFn: () => searchApi.search({ q: query, ...params }).then((r) => r.data),
    enabled: query.length > 0,
  })
}
