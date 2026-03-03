import { Navigate, Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import { userApi } from '@/api/user.api'
import { queryKeys } from '@/config/query-keys'
import { ROUTES } from '@/config/routes'
import type { UserRole } from '@/types/user'

interface RoleGuardProps {
  allowedRoles: UserRole[]
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuthStore()

  // Reuse the same query key as AppLayout — no setUser here, AppLayout handles sync
  const { isLoading } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const { data } = await userApi.getMe()
      return data.data
    },
    enabled: isAuthenticated && !user,
    staleTime: 5 * 60 * 1000,
  })

  if (isAuthenticated && isLoading) {
    return null
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <Outlet />
}
