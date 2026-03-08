import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/api/admin.api'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.stats().then((r) => r.data.data),
  })
}
