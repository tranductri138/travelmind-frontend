# Context: API Layer & Data Fetching

## Axios client (`src/api/client.ts`)
- `baseURL = env.VITE_API_URL` (validated bởi Zod khi khởi động)
- Tự gắn Bearer token (request interceptor)
- Silent refresh on 401 (response interceptor) — xem `context-auth.md`

## Domain API files
| File | Endpoints chính |
|------|----------------|
| `auth.api.ts` | login, register, refresh, logout, me |
| `hotel.api.ts` | list, detail, create, update, delete, hardDelete |
| `room.api.ts` | listByHotel, detail, checkAvailability, create, update, delete |
| `booking.api.ts` | create, myList, detail, cancel, adminList |
| `payment.api.ts` | initiate(bookingId), confirm(transactionId) |
| `review.api.ts` | listByHotel, create, update, delete |
| `search.api.ts` | fullText (GET /search), semantic (POST /search/semantic) |
| `chat.api.ts` | listConversations, getConversation, deleteConversation |
| `user.api.ts` | getProfile, updateProfile, deleteAccount |

## TanStack Query hooks (`src/hooks/`)
- `staleTime: 5 min`, `retry: 1`, `refetchOnWindowFocus: false`
- Pattern: `useQuery` cho reads, `useMutation` + `invalidateQueries` cho writes

```ts
// Query key factory (src/config/query-keys.ts)
queryKeys.hotels.list(params)      // ['hotels', 'list', params]
queryKeys.hotels.detail(id)        // ['hotels', 'detail', id]
queryKeys.bookings.detail(id)      // ['bookings', 'detail', id]
queryKeys.chat.conversations       // ['chat', 'conversations']

// Invalidate tất cả hotels sau mutation:
queryClient.invalidateQueries({ queryKey: queryKeys.hotels.all })
```

## Type system (`src/types/`)
- Mỗi domain 1 file, mirror backend DTOs
- `common.ts`: `ApiResponse<T>`, `PaginatedResponse<T>`, `PaginationMeta`
- Import: `import type { Hotel } from '@/types/hotel'`

## Env config (`src/config/env.ts`)
```ts
export const env = z.object({ VITE_API_URL: z.string().url() }).parse(import.meta.env)
```
App crash ngay khi khởi động nếu `VITE_API_URL` thiếu hoặc sai format.
