import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth.api'
import { userApi } from '@/api/user.api'
import { useAuthStore } from '@/stores/auth.store'
import { queryKeys } from '@/config/query-keys'
import { ROUTES } from '@/config/routes'
import type { LoginRequest, RegisterRequest } from '@/types/auth'

export function useAuth() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setTokens, setUser, logout: storeLogout, isAuthenticated } = useAuthStore()

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const { data } = await userApi.getMe()
      const user = data.data
      setUser(user)
      return user
    },
    enabled: isAuthenticated,
  })

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: ({ data }) => {
      const tokens = data.data
      setTokens(tokens.accessToken, tokens.refreshToken)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
      navigate(ROUTES.HOME)
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: ({ data }) => {
      const tokens = data.data
      setTokens(tokens.accessToken, tokens.refreshToken)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
      navigate(ROUTES.HOME)
    },
  })

  const logout = () => {
    authApi.logout().catch(() => {})
    storeLogout()
    queryClient.clear()
    navigate(ROUTES.LOGIN)
  }

  return {
    user: meQuery.data,
    isAuthenticated,
    isLoading: meQuery.isLoading,
    login: loginMutation.mutateAsync,
    loginPending: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    registerPending: registerMutation.isPending,
    registerError: registerMutation.error,
    logout,
  }
}
