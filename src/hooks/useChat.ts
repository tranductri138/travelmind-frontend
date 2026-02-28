import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '@/api/chat.api'
import { queryKeys } from '@/config/query-keys'
import { useAuthStore } from '@/stores/auth.store'

export function useConversations() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: queryKeys.chat.conversations,
    queryFn: async () => {
      const { data } = await chatApi.listConversations()
      return data.data
    },
    enabled: isAuthenticated,
  })
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: queryKeys.chat.conversation(id ?? ''),
    queryFn: async () => {
      const { data } = await chatApi.getConversation(id!)
      return data.data
    },
    enabled: !!id,
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => chatApi.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations })
    },
  })
}
