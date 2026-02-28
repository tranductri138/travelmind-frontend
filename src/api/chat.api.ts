import { apiClient } from './client'
import type { ChatConversation, ChatConversationWithMessages } from '@/types/chat'
import type { ApiResponse } from '@/types/common'

export const chatApi = {
  listConversations() {
    return apiClient.get<ApiResponse<ChatConversation[]>>('/chat/conversations')
  },

  getConversation(id: string) {
    return apiClient.get<ApiResponse<ChatConversationWithMessages>>(`/chat/conversations/${id}`)
  },

  deleteConversation(id: string) {
    return apiClient.delete(`/chat/conversations/${id}`)
  },
}
