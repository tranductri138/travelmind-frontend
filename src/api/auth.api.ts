import { apiClient } from './client'
import type { LoginRequest, RegisterRequest, TokenResponse } from '@/types/auth'
import type { ApiResponse } from '@/types/common'

export const authApi = {
  login(data: LoginRequest) {
    return apiClient.post<ApiResponse<TokenResponse>>('/auth/login', data)
  },

  register(data: RegisterRequest) {
    return apiClient.post<ApiResponse<TokenResponse>>('/auth/register', data)
  },

  refresh(refreshToken: string) {
    return apiClient.post<ApiResponse<TokenResponse>>('/auth/refresh', { refreshToken })
  },

  logout() {
    return apiClient.post('/auth/logout')
  },
}
