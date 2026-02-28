# TravelMind Frontend

React 19 + TypeScript strict + Vite 7 SPA → NestJS backend :3000. Path alias `@/` = `src/`.

## Commands
```
npm run dev      # localhost:5173, /api proxied → :3000
npm run build    # tsc --noEmit + vite build
npm run lint     # eslint
```

## Structure
```
src/
├── api/         # client.ts (Axios+JWT) + auth/hotel/room/booking/payment/review/search/chat/user.api.ts
├── types/       # auth/hotel/room/booking/payment/review/search/chat/user/common.ts
├── stores/      # auth.store.ts, ui.store.ts (Zustand)
├── hooks/       # useAuth, useHotels, useRooms, useBookings, useReviews, useSearch, useChat, useChatSocket, useDebounce
├── config/      # env.ts, routes.ts, query-keys.ts
├── lib/         # cn.ts, format.ts, validators.ts
├── components/  # ui/(shadcn) | layout/ | auth/ | hotel/ | room/ | booking/ | payment/ | review/ | search/ | chat/ | common/
└── pages/       # public/ | user/ | admin/
```

## Context files — tự đọc trước khi làm việc

Trước mỗi task, đọc các file phù hợp trong `docs/claude/`:

| Khi task liên quan đến... | Đọc file |
|--------------------------|----------|
| auth, JWT, token, login, register, guard, role | `context-auth.md` |
| API, Axios, fetch, hook, useQuery, useMutation, type, DTO | `context-api.md` |
| chat, socket, message, stream, conversation, AI | `context-chat.md` |
| payment, booking flow, LianLian, transaction | `context-payment.md` |
| search, Elasticsearch, semantic, vector | `context-search.md` |
| route, page, component, UI, layout, form, build, docker | `context-ui.md` |

**Quy tắc:** Đọc file trước, sau đó mới bắt đầu viết code. Nếu task liên quan nhiều mảng thì đọc nhiều file.
