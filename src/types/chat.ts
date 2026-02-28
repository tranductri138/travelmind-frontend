export interface ChatConversation {
  id: string
  userId: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  role: 'USER' | 'ASSISTANT'
  content: string
  createdAt: string
}

export interface ChatConversationWithMessages extends ChatConversation {
  messages: ChatMessage[]
}

export interface SendMessagePayload {
  conversationId?: string
  message: string
}
