import { useCallback, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth.store'
import type { ChatMessage } from '@/types/chat'

interface UseChatSocketReturn {
  messages: ChatMessage[]
  isConnected: boolean
  isTyping: boolean
  streamingContent: string
  sendMessage: (message: string, conversationId?: string) => void
  activeConversationId: string | null
  setActiveConversationId: (id: string | null) => void
  loadMessages: (messages: ChatMessage[]) => void
  clearMessages: () => void
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function useChatSocket(): UseChatSocketReturn {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streamingContent, setStreamingContent] = useState('')
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const { accessToken } = useAuthStore()

  useEffect(() => {
    if (!accessToken) return

    const socket = io(`${API_URL}/chat`, {
      auth: { token: accessToken },
      transports: ['websocket'],
    })

    socketRef.current = socket

    socket.on('connect', () => setIsConnected(true))
    socket.on('disconnect', () => setIsConnected(false))

    socket.on('connected', () => {
      setIsConnected(true)
    })

    socket.on('typing', ({ status }: { status: boolean }) => {
      setIsTyping(status)
    })

    socket.on('messageChunk', ({ chunk }: { chunk: string }) => {
      setStreamingContent((prev) => prev + chunk)
    })

    socket.on('messageComplete', ({ conversationId, content }: { conversationId: string; content: string }) => {
      setStreamingContent('')
      setIsTyping(false)
      setActiveConversationId(conversationId)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          conversationId,
          role: 'ASSISTANT',
          content,
          createdAt: new Date().toISOString(),
        },
      ])
    })

    socket.on('error', ({ message }: { message: string }) => {
      setStreamingContent('')
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          conversationId: activeConversationId ?? '',
          role: 'ASSISTANT',
          content: `Error: ${message}`,
          createdAt: new Date().toISOString(),
        },
      ])
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  const sendMessage = useCallback(
    (message: string, conversationId?: string) => {
      if (!socketRef.current) return

      // Add user message to local state
      const convId = conversationId ?? activeConversationId ?? undefined
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          conversationId: convId ?? '',
          role: 'USER',
          content: message,
          createdAt: new Date().toISOString(),
        },
      ])

      socketRef.current.emit('sendMessage', {
        conversationId: convId,
        message,
      })
    },
    [activeConversationId],
  )

  const loadMessages = useCallback((msgs: ChatMessage[]) => {
    setMessages(msgs)
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setStreamingContent('')
    setActiveConversationId(null)
  }, [])

  return {
    messages,
    isConnected,
    isTyping,
    streamingContent,
    sendMessage,
    activeConversationId,
    setActiveConversationId,
    loadMessages,
    clearMessages,
  }
}
