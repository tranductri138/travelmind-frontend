# Context: Chat & Socket.io

## Kiến trúc
- Backend: NestJS WebSocket gateway tại namespace `/chat`
- Frontend: `socket.io-client` kết nối với JWT auth
- AI stream từng chunk về, không chờ full response

## Hook chính: `useChatSocket` (`src/hooks/useChatSocket.ts`)
```ts
const {
  messages,            // ChatMessage[] — toàn bộ messages hiện tại
  isConnected,         // boolean
  isTyping,            // boolean — AI đang generate
  streamingContent,    // string — chunk đang stream chưa hoàn tất
  sendMessage,         // (message, conversationId?) => void
  activeConversationId,
  setActiveConversationId,
  loadMessages,        // load history từ API vào state
  clearMessages,
} = useChatSocket()
```

## Socket events
| Event | Chiều | Payload |
|-------|-------|---------|
| `sendMessage` | emit | `{ conversationId?, message }` |
| `connected` | on | — |
| `typing` | on | `{ status: boolean }` |
| `messageChunk` | on | `{ chunk: string }` — append vào `streamingContent` |
| `messageComplete` | on | `{ conversationId, content }` — flush streaming → push vào `messages` |
| `error` | on | `{ message: string }` — push error message |

## Kết nối
```ts
const socket = io(`${VITE_API_URL}/chat`, {
  auth: { token: accessToken },   // JWT xác thực
  transports: ['websocket'],
})
// reconnect tự động khi accessToken thay đổi (useEffect dependency)
```

## HTTP API (`src/api/chat.api.ts`)
```
GET    /chat/conversations          → ChatConversation[]
GET    /chat/conversations/:id      → ChatConversationWithMessages
DELETE /chat/conversations/:id
```
Dùng để load history, list sidebar — không dùng để gửi tin nhắn (dùng socket).

## TanStack Query hooks (`src/hooks/useChat.ts`)
```ts
useConversations()         // list sidebar, enabled khi isAuthenticated
useConversation(id)        // load messages của 1 conversation
useDeleteConversation()    // mutation + invalidate conversations list
```

## Types (`src/types/chat.ts`)
```ts
interface ChatMessage {
  id: string
  conversationId: string
  role: 'USER' | 'ASSISTANT'
  content: string
  createdAt: string
}
interface ChatConversation { id, title, createdAt, updatedAt }
interface ChatConversationWithMessages extends ChatConversation { messages: ChatMessage[] }
```

## Components (`src/components/chat/`)
- `ChatInput` — textarea + send button, gọi `sendMessage()`
- `ChatMessage` — render 1 message (user/AI, markdown support)
- `ConversationList` — sidebar danh sách conversations, gọi `useConversations()`

## Page: `src/pages/user/ChatPage.tsx`
- Route: `/chat` (ProtectedRoute)
- Dùng cả `useChatSocket` (realtime) + `useConversations` (list) + `useConversation` (load history)
- Khi chọn conversation → `loadMessages(history)` → `setActiveConversationId(id)`
- Khi gửi tin nhắn mới không có conversationId → backend tạo conversation mới → `messageComplete` trả về `conversationId` → `setActiveConversationId`
