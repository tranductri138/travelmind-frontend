# Context: Auth

## Token storage
- `accessToken` + `refreshToken` → `localStorage`
- Zustand `auth.store.ts`: `{ user, accessToken, isAuthenticated, login(), logout(), setUser() }`

## Axios JWT interceptor (`src/api/client.ts`)
- **Request**: gắn `Authorization: Bearer <accessToken>` tự động
- **Response 401**: silent refresh flow:
  1. `isRefreshing = true`, các request khác xếp vào `failedQueue`
  2. POST `/auth/refresh` với `refreshToken`
  3. Thành công → lưu token mới → drain queue → retry request gốc
  4. Thất bại → `handleLogout()` → redirect `/login`

## Auth API (`src/api/auth.api.ts`)
```
POST /auth/login      → { accessToken, refreshToken, user }
POST /auth/register   → { accessToken, refreshToken, user }
POST /auth/refresh    → { accessToken, refreshToken }
POST /auth/logout
GET  /auth/me
```

## Hooks (`src/hooks/useAuth.ts`)
```ts
useMe()           // GET /auth/me, enabled khi isAuthenticated
useLogin()        // mutation → lưu tokens + user vào store
useRegister()     // mutation
useLogout()       // mutation → clear store + localStorage
```

## Route Guards
- `ProtectedRoute`: check `isAuthenticated` → redirect `/login` nếu chưa login, lưu `state.from`
- `RoleGuard`: check `user.role` trong allowed list → 403 nếu không có quyền
- Sau login thành công → navigate về `state.from` hoặc `/`

## Zod schemas (`src/lib/validators.ts`)
```ts
loginSchema     // { email, password }
registerSchema  // { email, password, name, phone? }
```
