import { apiClient } from './client'
import type { User, UpdateUserRequest } from '@/types/user'
import type { ApiResponse } from '@/types/common'

export const userApi = {
  getMe() {
    return apiClient.get<ApiResponse<User>>('/users/me')
  },

  updateProfile(data: UpdateUserRequest) {
    return apiClient.patch<ApiResponse<User>>('/users/me', data)
  },

  deleteAccount() {
    return apiClient.delete('/users/me')
  },
}
