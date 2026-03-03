import { useEffect, useRef, useCallback } from 'react'
import { Bot, Loader2, PanelLeftClose, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatInput } from '@/components/chat/ChatInput'
import { ConversationList } from '@/components/chat/ConversationList'
import { useConversations, useConversation, useDeleteConversation } from '@/hooks/useChat'
import { useChatSocket } from '@/hooks/useChatSocket'
import { cn } from '@/lib/cn'
import { useState } from 'react'

export function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const loadedConvIdRef = useRef<string | null>(null)

  const { data: conversations = [], refetch: refetchConversations } = useConversations()
  const { data: conversationDetail } = useConversation(selectedConvId)
  const deleteConversation = useDeleteConversation()

  const {
    messages,
    isTyping,
    streamingContent,
    sendMessage,
    activeConversationId,
    setActiveConversationId,
    loadMessages,
    clearMessages,
  } = useChatSocket()

  // When a conversation is loaded from API, sync messages (guard with ref to prevent loops)
  useEffect(() => {
    if (conversationDetail && conversationDetail.id !== loadedConvIdRef.current) {
      loadedConvIdRef.current = conversationDetail.id
      loadMessages(conversationDetail.messages)
      setActiveConversationId(conversationDetail.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationDetail])

  // When AI responds and creates a new conversation, update the active ID
  useEffect(() => {
    if (activeConversationId && activeConversationId !== selectedConvId) {
      setSelectedConvId(activeConversationId)
      refetchConversations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId])

  // Auto-scroll to bottom within the chat scroll area only
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector<HTMLDivElement>(
      '[data-radix-scroll-area-viewport]',
    )
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, streamingContent])

  const handleSend = useCallback(
    (message: string) => {
      sendMessage(message, selectedConvId ?? undefined)
    },
    [sendMessage, selectedConvId],
  )

  const handleNewChat = useCallback(() => {
    setSelectedConvId(null)
    loadedConvIdRef.current = null
    clearMessages()
  }, [clearMessages])

  const handleSelectConversation = useCallback(
    (id: string) => {
      setSelectedConvId(id)
    },
    [],
  )

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      await deleteConversation.mutateAsync(id)
      if (selectedConvId === id) {
        handleNewChat()
      }
    },
    [deleteConversation, selectedConvId, handleNewChat],
  )

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          'border-r bg-muted/30 transition-all duration-300 overflow-hidden',
          sidebarOpen ? 'w-72' : 'w-0',
        )}
      >
        <ConversationList
          conversations={conversations}
          activeId={selectedConvId}
          onSelect={handleSelectConversation}
          onNew={handleNewChat}
          onDelete={handleDeleteConversation}
        />
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">TravelMind AI</h2>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && !isTyping && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">TravelMind AI Assistant</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Ask me about hotels, check availability, get recommendations,
                  or plan your trip. I can search our database and help you find
                  the perfect stay.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
            ))}

            {/* Streaming response */}
            {streamingContent && (
              <ChatMessage role="ASSISTANT" content={streamingContent} />
            )}

            {/* Typing indicator */}
            {isTyping && !streamingContent && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}

          </div>
        </ScrollArea>

        {/* Input */}
        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>
    </div>
  )
}
