# TravelMind Frontend - Giải thích kiến trúc chi tiết

> File này giải thích tường minh từng module trong project, cách chúng hoạt động bên trong,
> cách chúng giao tiếp với nhau, và các pattern quan trọng như event queue, interceptor, state subscription.

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Luồng khởi động ứng dụng (Bootstrap)](#2-luồng-khởi-động-ứng-dụng)
3. [Config Layer](#3-config-layer)
4. [Library Utilities](#4-library-utilities)
5. [API Layer - Axios Client & JWT Interceptor](#5-api-layer---axios-client--jwt-interceptor)
6. [API Layer - Domain API Files](#6-api-layer---domain-api-files)
7. [Type Definitions](#7-type-definitions)
8. [State Management (Zustand)](#8-state-management-zustand)
9. [TanStack Query Hooks](#9-tanstack-query-hooks)
10. [Routing & Guards](#10-routing--guards)
11. [Layout Components](#11-layout-components)
12. [Auth Components](#12-auth-components)
13. [Hotel Components](#13-hotel-components)
14. [Room Components](#14-room-components)
15. [Booking Components](#15-booking-components)
16. [Payment Components (LianLian Bank)](#16-payment-components-lianlian-bank)
17. [Review Components](#17-review-components)
18. [Search Components](#18-search-components)
19. [Common/Shared Components](#19-commonshared-components)
20. [Pages - Public](#20-pages---public)
21. [Pages - User (Protected)](#21-pages---user-protected)
22. [Pages - Admin](#22-pages---admin)
23. [Luồng nghiệp vụ chính (Business Flows)](#23-luồng-nghiệp-vụ-chính)
24. [Build & Deployment](#24-build--deployment)
25. [Sơ đồ tổng quan kết nối](#25-sơ-đồ-tổng-quan-kết-nối)

---

## 1. Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (User)                           │
├─────────────────────────────────────────────────────────────────┤
│  main.tsx  →  App.tsx (Router)  →  Pages  →  Components        │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Zustand   │  │ TanStack     │  │ React Hook   │              │
│  │ Stores    │  │ Query Hooks  │  │ Form + Zod   │              │
│  │ (client)  │  │ (server)     │  │ (validation)  │              │
│  └──────────┘  └──────┬───────┘  └──────────────┘              │
│                        │                                        │
│              ┌─────────▼──────────┐                             │
│              │  API Layer (Axios)  │                             │
│              │  + JWT Interceptor  │                             │
│              └─────────┬──────────┘                             │
│                        │ HTTP                                   │
├────────────────────────┼────────────────────────────────────────┤
│              ┌─────────▼──────────┐                             │
│              │  Vite Dev Proxy    │  /api → localhost:3000       │
│              │  (hoặc Nginx)      │                             │
│              └─────────┬──────────┘                             │
│                        │                                        │
│              ┌─────────▼──────────┐                             │
│              │  NestJS Backend    │  Port 3000                  │
│              └────────────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

**Stack chính:**
- **React 19** + **TypeScript strict** + **Vite 7** (build tool)
- **TailwindCSS 4** + **shadcn/ui** (UI components dựa trên Radix UI)
- **TanStack Query v5** (quản lý server state: fetch, cache, invalidate)
- **Zustand** (quản lý client state: auth, theme, sidebar)
- **Axios** (HTTP client với JWT interceptor)
- **React Router 7** (routing, protected routes)
- **React Hook Form + Zod** (form + validation)
- **LianLian Bank payment form** (thanh toán)
- **Leaflet** (bản đồ)

---

## 2. Luồng khởi động ứng dụng

File: `src/main.tsx`

Khi user mở trình duyệt truy cập app, đây là thứ tự khởi động:

```
1. Browser tải index.html → load main.tsx
2. main.tsx tạo QueryClient (cấu hình cache/retry)
3. main.tsx đọc theme từ localStorage → apply class 'dark' lên <html>
4. React render:
   QueryClientProvider (bọc toàn app, cung cấp query cache)
     └── App (chứa BrowserRouter + tất cả Routes)
         └── Toaster (sonner - hiển thị toast notifications)
```

**Giải thích chi tiết:**

```typescript
// 1. Tạo QueryClient - đây là "bộ não" quản lý tất cả API calls
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // Data "tươi" trong 5 phút, không fetch lại
      retry: 1,                         // Nếu API fail, thử lại 1 lần
      refetchOnWindowFocus: false,      // Không tự fetch lại khi user switch tab
    },
  },
});

// 2. Khôi phục theme từ lần truy cập trước
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');  // Thêm class 'dark' vào <html>
}

// 3. Render React tree
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>  {/* Cung cấp cache cho toàn app */}
    <App />                                    {/* Router + Pages */}
    <Toaster position="top-right" richColors /> {/* Toast notifications */}
  </QueryClientProvider>
);
```

**Tại sao QueryClientProvider phải bọc ngoài cùng?**
- Vì tất cả hooks `useQuery()` / `useMutation()` bên trong cần truy cập vào cache chung.
- Nếu không có Provider này, hooks sẽ throw error.

---

## 3. Config Layer

### 3.1 `src/config/env.ts` - Validation biến môi trường

**Làm gì:** Dùng Zod để validate các biến môi trường lúc app khởi động. Nếu thiếu hoặc sai format → app crash ngay với lỗi rõ ràng thay vì lỗi runtime khó debug.

```typescript
const envSchema = z.object({
  VITE_API_URL: z.string().url(),                    // Phải là URL hợp lệ
});

// .parse() sẽ throw ZodError nếu validation fail
export const env = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
});
```

**Khi nào chạy:** Ngay khi module được import lần đầu (module-level execution).
**Ai dùng:** `src/api/client.ts` dùng `env.VITE_API_URL` làm baseURL cho Axios.

### 3.2 `src/config/routes.ts` - Định nghĩa routes tập trung

**Làm gì:** Tập trung tất cả đường dẫn vào 1 file thay vì hard-code string rải rác.

```typescript
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  HOTELS: '/hotels',
  HOTEL_DETAIL: '/hotels/:id',      // :id là dynamic param
  HOTEL_BOOK: '/hotels/:id/book',
  BOOKINGS: '/bookings',
  BOOKING_DETAIL: '/bookings/:id',
  ADMIN: '/admin',
  // ...
} as const;

// Path generator: thay :id bằng giá trị thực
export const hotelDetailPath = (id: string) => `/hotels/${id}`;
export const bookingDetailPath = (id: string) => `/bookings/${id}`;
```

**Lợi ích:**
- Đổi URL 1 chỗ, cả app update theo.
- TypeScript autocomplete khi dùng `ROUTES.XXX`.
- Path generator tạo URL cụ thể từ template.

### 3.3 `src/config/query-keys.ts` - Factory pattern cho cache keys

**Làm gì:** Tạo key có cấu trúc cho TanStack Query cache.

```typescript
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  hotels: {
    all: ['hotels'] as const,
    list: (params?: SearchHotelParams) => ['hotels', 'list', params] as const,
    detail: (id: string) => ['hotels', 'detail', id] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    list: (params?: any) => ['bookings', 'list', params] as const,
    detail: (id: string) => ['bookings', 'detail', id] as const,
  },
  // ...
};
```

**Tại sao cần factory pattern?**

TanStack Query dùng array key để xác định cache entry. Ví dụ:

```
queryKeys.hotels.list({ page: 1 })  → ['hotels', 'list', { page: 1 }]
queryKeys.hotels.list({ page: 2 })  → ['hotels', 'list', { page: 2 }]
queryKeys.hotels.detail('abc')      → ['hotels', 'detail', 'abc']
```

Khi cần invalidate (xóa cache cũ để fetch lại):
```typescript
queryClient.invalidateQueries({ queryKey: queryKeys.hotels.all });
// → Invalidate TẤT CẢ query bắt đầu bằng ['hotels']
// → Cả list page 1, page 2, detail 'abc' đều bị invalidate
```

Đây là cách TanStack Query biết "data nào cần fetch lại" sau khi mutation thành công.

---

## 4. Library Utilities

### 4.1 `src/lib/cn.ts` - Merge CSS classes

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Làm gì:** Kết hợp CSS class names một cách thông minh.

**Vấn đề nó giải quyết:**
```typescript
// Không dùng cn() - class bị xung đột:
className="p-4 p-8"  // TailwindCSS không biết dùng cái nào

// Dùng cn() - tự động resolve:
cn("p-4", "p-8")     // → "p-8"  (class sau ghi đè class trước)
cn("text-red-500", condition && "text-blue-500")  // → conditional class
```

**Ai dùng:** Mọi component cần conditional styling (hầu hết tất cả components).

### 4.2 `src/lib/format.ts` - Formatting utilities

```typescript
export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  // 1234.5 → "$1,234.50"
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'MMM dd, yyyy');
  // "2024-03-15" → "Mar 15, 2024"
}

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
  // → "3 days ago", "in 2 hours"
}
```

### 4.3 `src/lib/validators.ts` - Zod validation schemas

**Làm gì:** Định nghĩa rules validation cho tất cả forms, đồng thời export TypeScript types.

```typescript
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// z.infer tự động tạo TypeScript type từ schema
export type LoginInput = z.infer<typeof loginSchema>;
// → { email: string; password: string }

export const createBookingSchema = z.object({
  roomId: z.string().min(1),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  guests: z.number().min(1).max(10),
});
```

**Cách hoạt động với React Hook Form:**
```typescript
const form = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),  // Zod làm validator
});
// → Khi user submit, Zod tự validate → nếu fail, hiện lỗi tại field tương ứng
```

---

## 5. API Layer - Axios Client & JWT Interceptor

File: `src/api/client.ts`

**Đây là module phức tạp nhất - giải thích từng phần:**

### 5.1 Tạo Axios instance

```typescript
export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,   // http://localhost:3000
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 5.2 Request Interceptor - Tự động gắn JWT token

```
                ┌──────────────────────────────────┐
                │  Component gọi API               │
                │  apiClient.get('/hotels')         │
                └──────────────┬───────────────────┘
                               │
                ┌──────────────▼───────────────────┐
                │  REQUEST INTERCEPTOR              │
                │  1. Đọc accessToken từ localStorage│
                │  2. Nếu có → gắn vào header:     │
                │     Authorization: Bearer xxx     │
                │  3. Return config                 │
                └──────────────┬───────────────────┘
                               │
                ┌──────────────▼───────────────────┐
                │  Gửi HTTP request đến Backend    │
                └──────────────────────────────────┘
```

```typescript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Tại sao dùng interceptor thay vì gắn token trong mỗi API call?**
- DRY (Don't Repeat Yourself): Chỉ viết logic 1 lần.
- Mọi request đều tự động có token mà không cần developer nhớ gắn.

### 5.3 Response Interceptor - Silent Refresh & Failed Queue

Đây là phần phức tạp nhất. Giải thích từng bước:

**Bối cảnh:** JWT accessToken có thời hạn ngắn (ví dụ 15 phút). Khi hết hạn, backend trả 401.
Thay vì bắt user login lại, ta dùng refreshToken để lấy accessToken mới một cách "im lặng" (silent refresh).

**Vấn đề:** Nếu 5 request đồng thời đều nhận 401, ta không muốn gửi 5 lần refresh.
→ Giải pháp: **Failed Request Queue Pattern**

```
Tình huống: 5 request cùng nhận 401

Request A ──401──→ isRefreshing = false
                   → Set isRefreshing = true
                   → Gọi refresh API
                   → Đợi response...

Request B ──401──→ isRefreshing = true (đang refresh rồi)
                   → Thêm B vào failedQueue
                   → Return Promise (B đợi)

Request C ──401──→ isRefreshing = true
                   → Thêm C vào failedQueue
                   → Return Promise (C đợi)

                   ← Refresh API trả về token mới!
                   → processQueue(null, newToken)
                   → B resolve với newToken → retry B
                   → C resolve với newToken → retry C
                   → A cũng retry với newToken
                   → isRefreshing = false
```

```typescript
// Biến global (ngoài interceptor)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

// Hàm xử lý queue
function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);     // Refresh thất bại → reject tất cả
    } else {
      prom.resolve(token!);   // Refresh thành công → resolve với token mới
    }
  });
  failedQueue = [];  // Reset queue
}

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,  // Response OK → trả về bình thường

  async (error) => {
    const originalRequest = error.config;

    // Chỉ xử lý 401 (Unauthorized) và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;  // Đánh dấu đã retry

      // Nếu ĐANG refresh → xếp hàng chờ
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          // Khi queue được process → gắn token mới → retry
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      // Nếu CHƯA refresh → bắt đầu refresh
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // Không có refreshToken → logout
        processQueue(new Error('No refresh token'));
        handleLogout();
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh
        const response = await axios.post(`${env.VITE_API_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = response.data.data?.accessToken
                            || response.data.accessToken;
        const newRefreshToken = response.data.data?.refreshToken
                             || response.data.refreshToken;

        // Lưu token mới
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        // Giải phóng queue
        processQueue(null, newAccessToken);

        // Retry request gốc
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Refresh thất bại → reject tất cả → logout
        processQueue(refreshError);
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function handleLogout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';  // Hard redirect
}
```

**Tóm lại flow:**

```
Request → [Request Interceptor: gắn token] → Backend
                                                 │
         ┌───────────────────────────────────────┘
         │
    200 OK? ─────────────→ Trả data về component
         │
    401? ─────────────→ Đang refresh?
                           │
                      ┌────┴─────┐
                    Chưa         Rồi
                      │            │
                  Gọi refresh   Xếp hàng (queue)
                      │            │
                  Thành công?     Đợi...
                   ┌──┴──┐         │
                  Có    Không     ←──── processQueue
                   │      │              │
             Retry all  Logout     Retry all
```

---

## 6. API Layer - Domain API Files

Mỗi "domain" (lĩnh vực nghiệp vụ) có 1 file API riêng. Tất cả đều import `apiClient` từ `client.ts`.

### 6.1 `src/api/auth.api.ts`

```typescript
export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<TokenResponse>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<TokenResponse>>('/auth/register', data),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<TokenResponse>>('/auth/refresh', { refreshToken }),

  logout: () => apiClient.post('/auth/logout'),
};
```

### 6.2 `src/api/hotel.api.ts`

```typescript
export const hotelApi = {
  list: (params?: SearchHotelParams) =>
    apiClient.get<PaginatedResponse<Hotel>>('/hotels', { params }),
    // params tự động serialize thành query string: /hotels?page=1&limit=10

  detail: (id: string) =>
    apiClient.get<ApiResponse<Hotel>>(`/hotels/${id}`),

  create: (data: CreateHotelRequest) =>
    apiClient.post<ApiResponse<Hotel>>('/hotels', data),

  update: (id: string, data: UpdateHotelRequest) =>
    apiClient.patch<ApiResponse<Hotel>>(`/hotels/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/hotels/${id}`),         // Soft delete (đánh dấu xóa)

  hardDelete: (id: string) =>
    apiClient.delete(`/hotels/${id}/permanent`), // Xóa vĩnh viễn
};
```

### 6.3 `src/api/booking.api.ts`

```typescript
export const bookingApi = {
  create: (data: CreateBookingRequest) =>
    apiClient.post<ApiResponse<CreateBookingResponse>>('/bookings', data),
    // Response chứa booking — sau đó gọi initiate để lấy transactionId

  cancel: (id: string) =>
    apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`),
};
```

### 6.4 `src/api/search.api.ts`

```typescript
export const searchApi = {
  fullText: (params: SearchQuery) =>
    apiClient.get<PaginatedResponse<SearchResult>>('/search', { params }),
    // PostgreSQL full-text search

  semantic: (data: SemanticSearchRequest) =>
    apiClient.post<ApiResponse<SearchResult[]>>('/search/semantic', data),
    // AI semantic search
};
```

**Pattern chung:**
- Mỗi API function return `Promise<AxiosResponse<TypedResponse>>`.
- Generic type (`ApiResponse<Hotel>`) đảm bảo TypeScript biết chính xác shape của response.
- apiClient tự gắn JWT token (nhờ interceptor) → developer không cần lo.

---

## 7. Type Definitions

File: `src/types/*.ts`

### 7.1 Common types (`common.ts`)

```typescript
// Response wrapper - mọi API response đều có dạng này
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Response có phân trang
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];            // Mảng items
  meta: {
    total: number;      // Tổng số records
    page: number;       // Trang hiện tại
    limit: number;      // Số items mỗi trang
    totalPages: number; // Tổng số trang
  };
}
```

### 7.2 Booking types (`booking.ts`)

```typescript
type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

interface Booking {
  id: string;
  userId: string;
  hotelId: string;
  roomId: string;
  checkIn: string;       // ISO date string
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  hotel?: Hotel;         // Populated khi backend join
  room?: Room;
}

// Response khi tạo booking
interface CreateBookingResponse {
  booking: Booking;
}

// Response khi initiate payment - chứa transactionId cho LianLian Bank
interface InitiatePaymentResponse {
  transactionId: string;  // LianLian Bank transaction ID
  amount: number;
  currency: string;
  bankInfo: object;
}
```

**Tại sao types quan trọng?**
- TypeScript strict mode bắt buộc khai báo type cho mọi thứ.
- Nếu backend đổi response shape → TypeScript báo lỗi compile time, không phải runtime.
- IDE autocomplete chính xác khi truy cập `booking.hotel?.name`.

---

## 8. State Management (Zustand)

Zustand là thư viện quản lý state đơn giản hơn Redux. Nó tạo "store" = object chứa state + actions.

### 8.1 `src/stores/auth.store.ts` - Authentication State

```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // === State khởi tạo ===
  // Đọc tokens từ localStorage (khôi phục session sau khi refresh page)
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),

  // === Actions ===
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));
```

**Cách hoạt động:**

```
1. User mở app lần đầu:
   - localStorage trống → isAuthenticated = false → user thấy Login button

2. User login thành công:
   - setTokens() gọi → lưu vào localStorage + set isAuthenticated = true
   - Component re-render (vì Zustand trigger re-render khi state thay đổi)
   - Header hiện user dropdown thay vì Login button

3. User refresh page (F5):
   - Store khởi tạo lại → đọc tokens từ localStorage
   - isAuthenticated = true (vì tokens vẫn còn trong localStorage)
   - meQuery chạy (fetch user info) → setUser()
   - User vẫn logged in!

4. Token hết hạn:
   - API trả 401 → interceptor cố refresh
   - Refresh thất bại → handleLogout() xóa localStorage
   - Lần sau store khởi tạo → isAuthenticated = false
```

**Zustand subscription mechanism:**
```
Component dùng useAuthStore() → Zustand tạo subscription
                                    │
                        set() thay đổi state
                                    │
                        Zustand notify tất cả subscribers
                                    │
                        Component re-render với state mới
```

### 8.2 `src/stores/ui.store.ts` - UI State

```typescript
export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: false,
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    // Trực tiếp thao tác DOM để toggle dark mode
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },
}));
```

**DOM interaction:**
- `document.documentElement.classList.toggle('dark', ...)` thêm/xóa class `dark` trên thẻ `<html>`.
- TailwindCSS dark mode dùng selector `dark:` sẽ active/deactive theo class này.
- Ví dụ: `className="bg-white dark:bg-gray-900"` → nền trắng light mode, đen dark mode.

---

## 9. TanStack Query Hooks

TanStack Query quản lý "server state" - data từ API. Nó tự động:
- **Cache** data để không fetch lại liên tục
- **Invalidate** cache khi data thay đổi (sau mutation)
- **Retry** khi request fail
- **Track loading/error state** tự động

### 9.1 `src/hooks/useAuth.ts` - Hook phức tạp nhất

```typescript
export function useAuth() {
  const { setTokens, setUser, isAuthenticated, user, logout: storeLogout } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // === AUTO-FETCH USER INFO ===
  // Query này TỰ ĐỘNG chạy khi isAuthenticated = true
  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,           // Cache key: ['auth', 'me']
    queryFn: async () => {
      const response = await userApi.getMe();
      setUser(response.data.data);          // Lưu user vào Zustand store
      return response.data.data;
    },
    enabled: isAuthenticated,               // Chỉ chạy khi đã login
  });

  // === LOGIN MUTATION ===
  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (response) => {
      const { accessToken, refreshToken } = response.data.data;
      setTokens(accessToken, refreshToken);  // Lưu tokens
      queryClient.invalidateQueries({        // Trigger meQuery chạy lại
        queryKey: queryKeys.auth.me,
      });
      navigate(ROUTES.HOME);                 // Redirect về trang chủ
    },
  });

  // === LOGOUT ===
  const logout = () => {
    authApi.logout().catch(() => {});  // Fire-and-forget (không care kết quả)
    storeLogout();                     // Xóa state + localStorage
    queryClient.clear();               // Xóa TOÀN BỘ cache
    navigate(ROUTES.LOGIN);            // Redirect về login
  };

  return {
    user,
    isAuthenticated,
    isLoading: meQuery.isLoading,
    login: loginMutation.mutateAsync,
    loginPending: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    logout,
  };
}
```

**Flow chi tiết:**

```
Login button click
    │
    ▼
loginMutation.mutateAsync({ email, password })
    │
    ▼
authApi.login() → POST /auth/login → Backend
    │
    ▼
onSuccess:
    ├── setTokens() → localStorage + Zustand state
    │                    │
    │              isAuthenticated = true
    │                    │
    │              meQuery.enabled = true
    │                    │
    │              meQuery tự động chạy!
    │                    │
    │              userApi.getMe() → GET /users/me
    │                    │
    │              setUser(userData) → Zustand
    │
    ├── invalidateQueries(['auth', 'me'])
    │   (đảm bảo fetch fresh data)
    │
    └── navigate('/') → Redirect về Home
```

### 9.2 `src/hooks/useHotels.ts` - Hotel queries & mutations

```typescript
// === QUERY: Lấy danh sách hotels (có phân trang, filter) ===
export function useHotels(params?: SearchHotelParams) {
  return useQuery({
    queryKey: queryKeys.hotels.list(params),
    // Cache key thay đổi khi params thay đổi
    // → page=1 và page=2 có cache riêng

    queryFn: () => hotelApi.list(params).then(res => res.data),

    placeholderData: keepPreviousData,
    // Khi chuyển trang: giữ data cũ hiển thị trong khi fetch data mới
    // → UX mượt, không thấy loading spinner mỗi lần chuyển trang

    staleTime: 5 * 60 * 1000,  // 5 phút
  });
}

// === MUTATION: Tạo hotel mới ===
export function useCreateHotel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHotelRequest) =>
      hotelApi.create(data).then(res => res.data.data),

    onSuccess: () => {
      // Invalidate tất cả query có key bắt đầu bằng ['hotels']
      // → Danh sách hotels sẽ tự fetch lại với hotel mới
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels.all });
    },
  });
}

// === MUTATION: Update hotel ===
export function useUpdateHotel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHotelRequest }) =>
      hotelApi.update(id, data).then(res => res.data.data),

    onSuccess: (_data, variables) => {
      // Invalidate cả list VÀ detail cụ thể
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.hotels.detail(variables.id),
      });
    },
  });
}
```

**Cache invalidation flow:**

```
Admin update hotel "ABC"
    │
    ▼
useUpdateHotel().mutateAsync({ id: 'abc', data: {...} })
    │
    ▼
PATCH /hotels/abc → Backend cập nhật DB
    │
    ▼
onSuccess:
    ├── invalidateQueries(['hotels'])
    │   → Cache entry ['hotels', 'list', { page: 1 }] bị đánh dấu "stale"
    │   → Cache entry ['hotels', 'list', { page: 2 }] bị đánh dấu "stale"
    │   → Nếu component đang mount → tự động refetch
    │
    └── invalidateQueries(['hotels', 'detail', 'abc'])
        → Cache entry chi tiết hotel abc cũng bị đánh dấu "stale"
        → Nếu HotelDetailPage đang hiện → tự động refetch
```

### 9.3 `src/hooks/useSearch.ts` - Dual search

```typescript
export function useFullTextSearch(query: string, params?: any) {
  return useQuery({
    queryKey: queryKeys.search.fullText(query),
    queryFn: () => searchApi.fullText({ q: query, ...params }).then(res => res.data),
    enabled: query.length > 0,  // Không search khi query rỗng
  });
}

export function useSemanticSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.search.semantic(query),
    queryFn: () => searchApi.semantic({ query }).then(res => res.data),
    enabled: query.length > 0,
  });
}
```

### 9.4 `src/hooks/useDebounce.ts`

```typescript
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);  // Cleanup nếu value thay đổi trước khi hết delay
  }, [value, delay]);

  return debouncedValue;
}
```

**Cách hoạt động:**

```
User gõ: "h" → "ha" → "han" → "hano" → "hanoi"
                  │       │       │        │
                 50ms    50ms    50ms     300ms (hết delay!)
                                           │
                                    setDebouncedValue("hanoi")
                                           │
                                    useFullTextSearch("hanoi") chạy

→ Chỉ gọi API 1 lần thay vì 5 lần!
```

---

## 10. Routing & Guards

File: `src/App.tsx`

### 10.1 Route structure

```typescript
<BrowserRouter>
  <Routes>
    <Route element={<AppLayout />}>
      {/* === PUBLIC: Ai cũng vào được === */}
      <Route path="/" element={<HomePage />} />
      <Route path="/hotels" element={<HotelListPage />} />
      <Route path="/hotels/:id" element={<HotelDetailPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* === PROTECTED: Phải login === */}
      <Route element={<ProtectedRoute />}>
        <Route path="/hotels/:id/book" element={<BookingPage />} />
        <Route path="/bookings" element={<MyBookingsPage />} />
        <Route path="/bookings/:id" element={<BookingDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* === ADMIN: Phải login + role ADMIN === */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/hotels" element={<HotelManagePage />} />
          <Route path="/admin/hotels/new" element={<HotelFormPage />} />
          <Route path="/admin/bookings" element={<BookingManagePage />} />
          <Route path="/admin/crawler" element={<CrawlerPage />} />
        </Route>
      </Route>
    </Route>
  </Routes>
</BrowserRouter>
```

### 10.2 ProtectedRoute - Guard kiểm tra đăng nhập

```typescript
function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect về login, lưu lại URL hiện tại để sau login quay lại
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;  // Render child routes
}
```

**Flow:**

```
User chưa login → click "Book Now" → /hotels/abc/book
    │
    ▼
ProtectedRoute kiểm tra: isAuthenticated = false
    │
    ▼
Navigate to="/login" state={{ from: "/hotels/abc/book" }}
    │
    ▼
User login thành công
    │
    ▼
Có thể redirect về "/hotels/abc/book" (dùng state.from)
```

### 10.3 RoleGuard - Guard kiểm tra quyền

```typescript
function RoleGuard({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
}
```

**Nested guards:**

```
/admin/hotels
    │
    ▼
ProtectedRoute: isAuthenticated? ──No──→ Redirect /login
    │ Yes
    ▼
RoleGuard(['ADMIN']): user.role === 'ADMIN'? ──No──→ Redirect /
    │ Yes
    ▼
HotelManagePage renders
```

---

## 11. Layout Components

### 11.1 `src/components/layout/AppLayout.tsx`

```typescript
function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <MobileNav />

      <div className="flex flex-1">
        {isAdmin && <Sidebar />}    {/* Sidebar chỉ hiện cho admin pages */}

        <main className="flex-1">
          <ErrorBoundary>
            <Outlet />              {/* Page content renders here */}
          </ErrorBoundary>
        </main>
      </div>

      {!isAdmin && <Footer />}      {/* Footer ẩn trong admin pages */}
    </div>
  );
}
```

**Outlet pattern:** React Router render page component vào vị trí `<Outlet />`.

```
AppLayout
├── Header (luôn hiện)
├── MobileNav (Sheet sidebar cho mobile)
├── Sidebar (chỉ khi /admin/*)
├── <Outlet /> ← Page component render ở đây
│   ├── / → HomePage
│   ├── /hotels → HotelListPage
│   ├── /admin/hotels → HotelManagePage
│   └── ...
└── Footer (ẩn khi /admin/*)
```

### 11.2 `src/components/layout/Header.tsx`

```
┌─────────────────────────────────────────────────────────┐
│  🏨 TravelMind    Hotels  Search    🔍  🌙  [Avatar ▼] │
│                                              │          │
│  (sticky top, backdrop blur)                 DropdownMenu│
│                                              ├─ Profile │
│                                              ├─ Bookings│
│                                              ├─ Admin*  │
│                                              └─ Logout  │
└─────────────────────────────────────────────────────────┘
* Admin link chỉ hiện nếu user.role === 'ADMIN'
```

**Theme toggle:**
```typescript
<Button onClick={() => toggleTheme()}>
  {theme === 'light' ? <Moon /> : <Sun />}   {/* Icon đổi theo theme */}
</Button>
// Click → toggleTheme() → setTheme() → DOM classList.toggle + localStorage
```

### 11.3 `src/components/layout/MobileNav.tsx`

Dùng Radix UI Sheet (slide-in panel):

```typescript
function MobileNav() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="left">
        {/* Navigation links */}
        <Link to="/" onClick={() => setSidebarOpen(false)}>Home</Link>
        {/* Đóng sheet khi click link */}
      </SheetContent>
    </Sheet>
  );
}
```

**State flow:**
```
Hamburger button (Header) → setSidebarOpen(true)
    │
    ▼
Sheet open={true} → Slide-in từ bên trái
    │
Click link → setSidebarOpen(false) → Sheet đóng
```

---

## 12. Auth Components

### 12.1 LoginForm

```typescript
function LoginForm() {
  const { login, loginPending, loginError } = useAuth();

  // React Hook Form + Zod validation
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),  // Zod validate khi submit
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginInput) => {
    await login(data);  // Gọi useAuth().login()
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('email')} />
      {form.formState.errors.email && <p>{form.formState.errors.email.message}</p>}

      <Input type="password" {...form.register('password')} />
      {form.formState.errors.password && <p>{...}</p>}

      {loginError && <p>Login failed: {loginError.message}</p>}

      <Button type="submit" disabled={loginPending}>
        {loginPending ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
```

**Validation flow:**
```
User click Submit
    │
    ▼
form.handleSubmit(onSubmit) gọi
    │
    ▼
zodResolver(loginSchema) validate data
    │
    ├── Fail: form.formState.errors có lỗi → hiện error message tại field
    │
    └── Pass: onSubmit(validData) gọi
             │
             ▼
        useAuth().login({ email, password })
             │
             ▼
        authApi.login() → POST /auth/login
             │
             ├── 200: setTokens → navigate HOME
             └── 401: loginError có giá trị → hiện "Login failed"
```

---

## 13. Hotel Components

### 13.1 HotelCard - Card hiển thị hotel

```
┌─────────────────────┐
│  [Hotel Image]      │  ← ImageWithFallback (fallback nếu ảnh lỗi)
│                     │
│  Hotel Name         │
│  📍 City, Country   │
│  ★★★★☆  (42 reviews)│  ← StarRating component
│  From $120/night    │  ← PriceTag component
└─────────────────────┘
  ↑ Cả card là Link → /hotels/{id}
```

### 13.2 HotelFilters - Bộ lọc sidebar

```typescript
function HotelFilters({ filters, onFilterChange }) {
  return (
    <div>
      {/* Price range */}
      <Input
        type="number"
        value={filters.minPrice}
        onChange={(e) => onFilterChange({ ...filters, minPrice: e.target.value })}
      />

      {/* Rating filter */}
      <StarRating
        rating={filters.rating || 0}
        interactive                    // Click được
        onChange={(rating) => onFilterChange({ ...filters, rating })}
      />

      {/* Sort */}
      <Select
        value={filters.sort}
        onValueChange={(sort) => onFilterChange({ ...filters, sort })}
      >
        <SelectItem value="rating:desc">Highest Rated</SelectItem>
        <SelectItem value="priceMin:asc">Price: Low to High</SelectItem>
      </Select>
    </div>
  );
}
```

**Filter → Query flow:**
```
User chọn filter "rating: 4"
    │
    ▼
onFilterChange({ ...filters, rating: 4, page: 1 })  // Reset page về 1
    │
    ▼
HotelListPage setState: filters = { rating: 4, page: 1 }
    │
    ▼
useHotels(filters) → queryKey thay đổi
    │
    ▼
TanStack Query: key mới → không có cache → fetch API
    │
    ▼
GET /hotels?rating=4&page=1
    │
    ▼
HotelGrid re-render với kết quả mới
```

### 13.3 HotelGallery - Gallery ảnh với lightbox

```
Layout bình thường:
┌──────────────┬───────┐
│              │  Img2 │
│   Main Img   ├───────┤
│  (col-span-2)│  Img3 │
│  (row-span-2)├───────┤
│              │  Img4 │
└──────────────┴───────┘

Click vào ảnh → mở Dialog (lightbox):
┌─────────────────────────────┐
│  ◄  [Full-size Image]  ►   │
│         3 / 8               │
└─────────────────────────────┘
```

### 13.4 HotelMap - Bản đồ Leaflet

```typescript
function HotelMap({ latitude, longitude, name }) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      style={{ height: '300px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[latitude, longitude]}>
        <Popup>{name}</Popup>
      </Marker>
    </MapContainer>
  );
}
```

---

## 14. Room Components

### 14.1 AvailabilityCalendar - Chọn ngày check-in/out

```
┌─────────────────┐  ┌─────────────────┐
│  Check-in       │  │  Check-out      │
│  📅 Mar 15, 2024│  │  📅 Mar 18, 2024│
│                 │  │                 │
│  [Calendar      │  │  [Calendar      │
│   Popover]      │  │   Popover]      │
│  (disabled:     │  │  (disabled:     │
│   past dates)   │  │   dates <=      │
│                 │  │   checkIn)      │
└─────────────────┘  └─────────────────┘
```

### 14.2 PriceBreakdown - Chi tiết giá

```
┌───────────────────────────┐
│ $120 × 3 nights    $360   │  ← subtotal
│ Taxes & fees (10%)   $36   │  ← subtotal × 0.1
│ ────────────────────────  │
│ Total               $396   │  ← subtotal + taxes
└───────────────────────────┘
```

---

## 15. Booking Components

### 15.1 BookingForm - Form đặt phòng

```typescript
function BookingForm({ room, onSubmit, isPending }) {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);

  const nights = checkIn && checkOut
    ? differenceInDays(checkOut, checkIn)
    : 0;

  const handleSubmit = () => {
    onSubmit({
      roomId: room.id,
      checkIn: format(checkIn!, 'yyyy-MM-dd'),
      checkOut: format(checkOut!, 'yyyy-MM-dd'),
      guests,
    });
  };

  return (
    <>
      <AvailabilityCalendar ... />
      <Input type="number" value={guests} min={1} max={room.capacity} />
      {nights > 0 && <PriceBreakdown pricePerNight={room.price} nights={nights} />}
      <Button onClick={handleSubmit} disabled={isPending || nights === 0}>
        Book Now
      </Button>
    </>
  );
}
```

### 15.2 BookingTimeline - Hiển thị trạng thái booking

```
PENDING          CONFIRMED        COMPLETED
  ●────────────────●────────────────●
  🕐               ✓                ✓

Nếu CANCELLED:
  ●────────── ✗ Booking Cancelled
  🕐         (đỏ)
```

### 15.3 CancelDialog - Xác nhận hủy booking

```typescript
function CancelDialog({ onConfirm, isPending }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Cancel Booking</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. Cancellation policy may apply.
        </AlertDialogDescription>
        <AlertDialogCancel>Keep Booking</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} disabled={isPending}>
          Yes, Cancel
        </AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

## 16. Payment Components (LianLian Bank)

### 16.1 LianLianCheckout - Form thanh toán

```typescript
function LianLianCheckout({ transactionId, amount, currency, bankInfo, onSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await paymentApi.confirm(transactionId);
      onSuccess();  // Thanh toán thành công → redirect
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <h3>LianLian Bank Payment</h3>
      <p>Amount: {formatCurrency(amount, currency)}</p>
      <p>Bank: {bankInfo.bankName}</p>
      <p>Transaction ID: {transactionId}</p>
      <Button onClick={handleConfirm} disabled={isProcessing}>
        Confirm Payment
      </Button>
    </div>
  );
}
```

**Payment flow:**

```
1. BookingPage tạo booking → POST /bookings
2. POST /payments/initiate/:bookingId → returns { transactionId, amount, currency, bankInfo }
3. User sees bank details in LianLianCheckout
4. User clicks "Confirm Payment"
5. POST /payments/confirm/:transactionId → payment confirmed
6. onSuccess() → Navigate đến BookingDetailPage
```

---

## 17. Review Components

### 17.1 ReviewStats - Thống kê đánh giá

```
┌────────────────────────────────┐
│  4.5  ★★★★½   42 reviews      │
│                                │
│  5 ★ ████████████████  60%  25 │  ← Progress bar
│  4 ★ ████████         20%   8 │
│  3 ★ █████            12%   5 │
│  2 ★ ██                5%   2 │
│  1 ★ █                 3%   2 │
└────────────────────────────────┘
```

### 17.2 ReviewForm - Form viết đánh giá

```typescript
function ReviewForm({ hotelId, bookingId, onSubmit, isPending }) {
  const form = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: { hotelId, bookingId, rating: 0, comment: '' },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* StarRating interactive - click chọn sao */}
      <Controller
        name="rating"
        control={form.control}
        render={({ field }) => (
          <StarRating
            rating={field.value}
            interactive
            onChange={field.onChange}  // Cập nhật form state khi click sao
          />
        )}
      />

      <Textarea {...form.register('comment')} placeholder="Share your experience..." />

      <Button type="submit" disabled={isPending}>Submit Review</Button>
    </form>
  );
}
```

**Controller pattern:**
- `register()` dùng cho input HTML chuẩn (text, email...).
- `Controller` dùng cho component custom (StarRating) mà cần truyền value + onChange theo cách riêng.

---

## 18. Search Components

### 18.1 SearchBar

```typescript
function SearchBar({ defaultValue, size = 'default' }) {
  const [query, setQuery] = useState(defaultValue || '');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Search className="absolute left-3 ..." />  {/* Icon */}
      <Input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Button type="submit">Search</Button>
    </form>
  );
}
```

### 18.2 SemanticBadge

```
┌──────────────┐
│ ✨ AI-powered │  ← Badge màu tím, icon Sparkles
└──────────────┘
```

Hiển thị trên kết quả tìm kiếm semantic (AI), phân biệt với keyword search.

---

## 19. Common/Shared Components

### 19.1 ErrorBoundary - Bắt lỗi React

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
    // React gọi method này khi child component throw error
    // → Thay vì crash cả app, hiện UI lỗi
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Log lỗi (có thể gửi lên error tracking service)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong</h2>
          <Button onClick={() => this.setState({ hasError: false })}>
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;  // Render children bình thường
  }
}
```

**Vị trí đặt:** Bọc quanh `<Outlet />` trong AppLayout. Nếu bất kỳ page nào crash → hiện "Try again" thay vì trắng xóa.

### 19.2 Pagination

```
◄ Prev  [1] [2] [3] ... [10] [11]  Next ►
              ↑ current page (highlighted)
```

Logic hiển thị page numbers:
- Luôn hiện page 1 và page cuối.
- Hiện ±1 quanh page hiện tại.
- Dùng "..." cho khoảng trống.

### 19.3 ImageWithFallback

```typescript
function ImageWithFallback({ src, alt, fallback, ...props }) {
  const [error, setError] = useState(false);

  if (error) {
    return fallback || <div className="bg-muted flex items-center justify-center">
      <ImageIcon />  {/* SVG placeholder */}
    </div>;
  }

  return <img src={src} alt={alt} onError={() => setError(true)} {...props} />;
}
```

---

## 20. Pages - Public

### 20.1 HomePage

```
┌─────────────────────────────────────────┐
│         Find Your Perfect Stay          │
│   [══════════ Search Bar ══════════]    │  ← SearchBar size="lg"
│                                         │
│   Featured Hotels                       │
│   ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│   │Card│ │Card│ │Card│ │Card│         │  ← useHotels({ featured: true })
│   └────┘ └────┘ └────┘ └────┘         │
│   ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│   │Card│ │Card│ │Card│ │Card│         │
│   └────┘ └────┘ └────┘ └────┘         │
└─────────────────────────────────────────┘
```

### 20.2 HotelDetailPage

```
┌─────────────────────────────────────────────────┐
│  [Gallery - 5 images grid]                      │
│                                                 │
│  ┌─────────────────────┐  ┌──────────────┐     │
│  │ Hotel Name          │  │ From $120    │     │
│  │ ★★★★☆ 42 reviews    │  │ /night       │     │
│  │ 📍 Hanoi, Vietnam   │  │              │     │
│  │                     │  │ [Book Now]    │     │  ← Sticky sidebar
│  │ Description text... │  │              │     │
│  │                     │  └──────────────┘     │
│  │ Amenities:          │                       │
│  │ [WiFi] [Pool] [Gym] │                       │
│  │                     │                       │
│  │ ┌─Rooms─┬─Reviews─┬─Map─┐                  │  ← Tabs
│  │ │ RoomList         │    │                  │
│  │ │ ┌──────────────┐ │    │                  │
│  │ │ │ Deluxe Room  │ │    │                  │
│  │ │ │ $150/night   │ │    │                  │
│  │ │ │ [Book Now]   │ │    │                  │
│  │ │ └──────────────┘ │    │                  │
│  │ └──────────────────┘    │                  │
│  └─────────────────────────┘                   │
└─────────────────────────────────────────────────┘
```

### 20.3 SearchResultsPage - Dual search

```typescript
function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const debouncedQuery = useDebounce(query, 300);

  // HAI query chạy SONG SONG
  const { data: keywordData } = useFullTextSearch(debouncedQuery);
  const { data: semanticData } = useSemanticSearch(debouncedQuery);

  // MERGE kết quả
  const mergedResults = useMemo(() => {
    const results: SearchResult[] = [];
    const seenIds = new Set<string>();

    // Semantic results trước (ưu tiên AI)
    semanticData?.data?.forEach((result) => {
      if (!seenIds.has(result.hotel.id)) {
        seenIds.add(result.hotel.id);
        results.push(result);  // source = 'semantic' → hiện SemanticBadge
      }
    });

    // Keyword results sau (bỏ trùng)
    keywordData?.data?.forEach((result) => {
      if (!seenIds.has(result.hotel.id)) {
        seenIds.add(result.hotel.id);
        results.push(result);  // source = 'keyword' → không có badge
      }
    });

    return results;
  }, [keywordData, semanticData]);

  return <SearchResults results={mergedResults} query={query} />;
}
```

**Merge + dedup flow:**

```
Query: "beach resort bali"
    │
    ├── PostgreSQL:     [Hotel A, Hotel B, Hotel C, Hotel D]
    │                   source='keyword'
    │
    └── AI Semantic:   [Hotel B, Hotel E, Hotel F]
                       source='semantic'

Merge (semantic trước):
  1. Hotel B (semantic) ← có SemanticBadge "AI-powered"
  2. Hotel E (semantic) ← có SemanticBadge
  3. Hotel F (semantic) ← có SemanticBadge
  4. Hotel A (keyword)  ← không badge
  5. Hotel C (keyword)
  6. Hotel D (keyword)
  * Hotel B (keyword) bị bỏ vì đã có từ semantic
```

---

## 21. Pages - User (Protected)

### 21.1 BookingPage - State machine 3 bước

```typescript
function BookingPage() {
  const { id: hotelId } = useParams();
  const { data: rooms } = useRoomsByHotel(hotelId!);
  const createBooking = useCreateBooking();

  // STATE MACHINE
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<InitiatePaymentResponse | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Bước 2 → Bước 3: Submit booking → initiate payment → lấy transactionId
  const handleBookingSubmit = async (data: CreateBookingRequest) => {
    const result = await createBooking.mutateAsync(data);
    setBookingId(result.booking.id);
    const payment = await paymentApi.initiate(result.booking.id);
    setTransactionId(payment.transactionId);
    setPaymentInfo(payment);
  };

  // RENDER theo state
  if (transactionId && paymentInfo) {
    // BƯỚC 3: Thanh toán LianLian Bank
    return (
      <LianLianCheckout
        transactionId={transactionId}
        amount={paymentInfo.amount}
        currency={paymentInfo.currency}
        bankInfo={paymentInfo.bankInfo}
        onSuccess={() => navigate(bookingDetailPath(bookingId!))}
      />
    );
  }

  if (selectedRoom) {
    // BƯỚC 2: Form đặt phòng
    return <BookingForm room={selectedRoom} onSubmit={handleBookingSubmit} />;
  }

  // BƯỚC 1: Chọn phòng
  return <RoomList rooms={rooms} onBook={setSelectedRoom} />;
}
```

**State machine flow:**

```
State 1: selectedRoom=null, transactionId=null
  → Hiện RoomList
  → User click "Book Now" trên RoomCard
  → setSelectedRoom(room)

State 2: selectedRoom=Room, transactionId=null
  → Hiện BookingForm
  → User chọn ngày, số khách, submit
  → createBooking → POST /bookings
  → paymentApi.initiate(bookingId) → returns transactionId
  → setTransactionId(id)

State 3: transactionId="txn_xxx"
  → Hiện LianLianCheckout (bank details + confirm button)
  → User xem thông tin ngân hàng, click "Confirm Payment"
  → paymentApi.confirm(transactionId)
  → Thành công → navigate("/bookings/{id}")
```

### 21.2 ProfilePage - CRUD profile + delete account

```
┌─────────────────────────────────┐
│  Profile Settings               │
│                                 │
│  Name: [_______________]        │
│  Email: [______________]        │
│  [Save Changes]                 │
│                                 │
│  ────── Danger Zone ──────     │
│  [🗑 Delete Account]            │  ← AlertDialog xác nhận
│                                 │
└─────────────────────────────────┘
```

---

## 22. Pages - Admin

### 22.1 DashboardPage

```
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│🏨 25 │ │📋 142│ │👤 500│ │💰$50k│
│Hotels│ │Books │ │Users │ │Rev.  │
└──────┘ └──────┘ └──────┘ └──────┘
```

Dùng `useHotels({ limit: 1 })` và `useBookings({ limit: 1 })` chỉ để lấy `meta.total` (tổng số).

### 22.2 HotelFormPage - Create/Edit

```typescript
function HotelFormPage() {
  const { id } = useParams();
  const isEdit = !!id;

  // Nếu edit → fetch data hiện tại
  const { data: hotel } = useHotelDetail(id || '');

  const createHotel = useCreateHotel();
  const updateHotel = useUpdateHotel();

  const form = useForm({
    resolver: zodResolver(createHotelSchema),
    values: isEdit && hotel ? hotel : undefined,  // Pre-fill form khi edit
  });

  const onSubmit = async (data) => {
    if (isEdit) {
      await updateHotel.mutateAsync({ id: id!, data });
    } else {
      await createHotel.mutateAsync(data);
    }
    toast.success(isEdit ? 'Hotel updated' : 'Hotel created');
    navigate(ROUTES.ADMIN_HOTELS);
  };
}
```

### 22.3 CrawlerPage - Điều khiển web crawler

```
┌──────────────────────────────────────┐
│  Hotel Data Crawler                  │
│                                      │
│  Status: 🟢 idle / 🟡 running       │
│                                      │
│  [Trigger Crawl]  [Refresh Status]   │
└──────────────────────────────────────┘
```

```typescript
// Trigger crawl
const triggerMutation = useMutation({
  mutationFn: () => apiClient.post('/crawler/trigger'),
  onSuccess: () => setStatus('running'),
});

// Check status
const checkStatus = async () => {
  const res = await apiClient.get('/crawler/status');
  setStatus(res.data.data.status);
};
```

---

## 23. Luồng nghiệp vụ chính

### 23.1 Authentication Flow (toàn bộ)

```
┌─ USER ──────────────────────────────────────────────────────────┐
│                                                                 │
│  1. Mở app → main.tsx render                                    │
│  2. auth.store khởi tạo → đọc tokens từ localStorage           │
│     ├── Có tokens → isAuthenticated = true                      │
│     │   └── meQuery enabled → GET /users/me → setUser()         │
│     └── Không có → isAuthenticated = false → hiện Login button  │
│                                                                 │
│  3. User click Login → LoginPage → LoginForm                    │
│  4. Submit → POST /auth/login → Backend                         │
│  5. Backend validate → trả { accessToken, refreshToken }        │
│  6. setTokens() → localStorage + Zustand                        │
│  7. invalidateQueries(['auth', 'me']) → meQuery refetch          │
│  8. navigate('/') → HomePage                                     │
│                                                                 │
│  9. User dùng app → mỗi API call đều gắn Bearer token          │
│                                                                 │
│ 10. Token hết hạn → API trả 401                                │
│     → Interceptor bắt 401                                       │
│     → POST /auth/refresh với refreshToken                        │
│     ├── Thành công → token mới → retry request gốc              │
│     └── Thất bại → logout → redirect /login                     │
│                                                                 │
│ 11. User click Logout                                           │
│     → authApi.logout() (fire-and-forget)                        │
│     → storeLogout() (xóa localStorage + state)                  │
│     → queryClient.clear() (xóa toàn bộ cache)                   │
│     → navigate('/login')                                         │
└─────────────────────────────────────────────────────────────────┘
```

### 23.2 Booking Flow (toàn bộ)

```
┌─ BOOKING FLOW ──────────────────────────────────────────────────┐
│                                                                 │
│  1. User xem hotel → HotelDetailPage                            │
│  2. Click "Book Now"                                            │
│     ├── Chưa login → redirect /login (ProtectedRoute)           │
│     └── Đã login → navigate /hotels/{id}/book                   │
│                                                                 │
│  3. BookingPage render → BƯỚC 1: RoomList                       │
│     → useRoomsByHotel(hotelId) → GET /hotels/{id}/rooms         │
│     → Hiện danh sách phòng với giá, tiện ích                    │
│                                                                 │
│  4. User click "Book Now" trên RoomCard                         │
│     → setSelectedRoom(room) → BƯỚC 2: BookingForm              │
│                                                                 │
│  5. User chọn ngày check-in/out, số khách                      │
│     → PriceBreakdown tự tính: $150 × 3 nights + 10% tax        │
│     → Submit → createBooking.mutateAsync()                      │
│     → POST /bookings → Backend tạo booking (PENDING)            │
│     → Response: { booking }                                     │
│                                                                 │
│  6. POST /payments/initiate/:bookingId                          │
│     → Response: { transactionId, amount, currency, bankInfo }   │
│     → setTransactionId() → BƯỚC 3: LianLianCheckout             │
│                                                                 │
│  7. User xem bank details, click "Confirm Payment"              │
│     → POST /payments/confirm/:transactionId                     │
│     → Payment confirmed                                         │
│                                                                 │
│  8. onSuccess() → navigate /bookings/{id}                       │
│     → BookingDetailPage hiện BookingTimeline                     │
│     → Booking status = CONFIRMED                                │
└─────────────────────────────────────────────────────────────────┘
```

### 23.3 Search Flow (Dual-mode)

```
┌─ SEARCH FLOW ───────────────────────────────────────────────────┐
│                                                                 │
│  1. User gõ "beach resort bali" vào SearchBar                   │
│  2. Submit → navigate /search?q=beach+resort+bali               │
│                                                                 │
│  3. SearchResultsPage mount                                     │
│     → Đọc q từ URL params                                       │
│     → useDebounce(query, 300ms) → đợi user ngừng gõ             │
│                                                                 │
│  4. Debounced query sẵn sàng → 2 query chạy SONG SONG:         │
│                                                                 │
│     ┌─ useFullTextSearch ──────────────────────────┐             │
│     │ GET /search?q=beach+resort+bali              │             │
│     │ → PostgreSQL full-text match                 │             │
│     │ → Trả: [Hotel A, B, C, D] source='keyword'  │             │
│     └──────────────────────────────────────────────┘             │
│                                                                 │
│     ┌─ useSemanticSearch ──────────────────────────┐             │
│     │ POST /search/semantic { query: "..." }       │             │
│     │ → AI embedding + vector similarity           │             │
│     │ → Trả: [Hotel B, E, F] source='semantic'    │             │
│     └──────────────────────────────────────────────┘             │
│                                                                 │
│  5. Merge + Deduplicate (useMemo):                              │
│     → Semantic results trước (ưu tiên AI):                       │
│       Hotel B (semantic) ← "AI-powered" badge                   │
│       Hotel E (semantic) ← "AI-powered" badge                   │
│       Hotel F (semantic) ← "AI-powered" badge                   │
│     → Keyword results sau (loại trùng):                          │
│       Hotel A (keyword)                                          │
│       Hotel C (keyword)                                          │
│       Hotel D (keyword)                                          │
│     → Hotel B keyword bị loại (đã có từ semantic)               │
│                                                                 │
│  6. Render SearchResults với mixed results                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 24. Build & Deployment

### 24.1 Vite Config

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
    // import '@/lib/cn' → import './src/lib/cn'
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Chia vendor code thành 8 chunks nhỏ
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query', 'zustand', 'axios'],
          'vendor-ui': [/* Radix UI packages */],
          'vendor-forms': ['react-hook-form', 'zod'],
          // No external payment SDK needed — LianLian Bank uses internal API calls
          'vendor-maps': ['leaflet', 'react-leaflet'],
          'vendor-utils': ['date-fns', 'lucide-react'],
        },
      },
    },
  },
});
```

**Tại sao chia chunks?**

```
Không chia chunks:
  bundle.js (2MB) → User tải 2MB mỗi lần

Chia chunks:
  vendor-react.js (200KB)  → Cache browser, không tải lại
  vendor-query.js (150KB)  → Cache browser
  vendor-ui.js (300KB)     → Cache browser
  app.js (100KB)           → Chỉ file này thay đổi khi deploy

→ Lần đầu: tải ~1MB
→ Lần sau: chỉ tải lại app.js (100KB) vì vendor chunks đã cache
```

### 24.2 Docker Multi-stage Build

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci                          # Install dependencies
COPY . .
RUN npm run build                   # tsc check + vite build → dist/

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**Tại sao multi-stage?**
- Stage 1 có node_modules (hàng trăm MB) → không cần trong production.
- Stage 2 chỉ copy dist/ (vài MB) + nginx → image nhẹ (~30MB).

### 24.3 Nginx Config

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;

    # SPA routing: Mọi URL trả về index.html
    location / {
        try_files $uri $uri/ /index.html;
        # /hotels/abc → không có file → trả index.html → React Router xử lý
    }

    # API proxy: Forward /api/* → backend
    location /api/ {
        proxy_pass http://api:3000/;  # 'api' là tên Docker service
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|svg|ico)$ {
        expires 1y;                    # Cache 1 năm
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 25. Sơ đồ tổng quan kết nối

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                   │
│                                                                        │
│  ┌─ main.tsx ─────────────────────────────────────────────────────┐    │
│  │ QueryClientProvider                                            │    │
│  │  ┌─ App.tsx ──────────────────────────────────────────────┐   │    │
│  │  │ BrowserRouter                                           │   │    │
│  │  │  ┌─ AppLayout ────────────────────────────────────┐    │   │    │
│  │  │  │ Header ← useAuthStore (user, isAuthenticated)   │    │   │    │
│  │  │  │         ← useUIStore (theme, sidebar)           │    │   │    │
│  │  │  │                                                 │    │   │    │
│  │  │  │ ProtectedRoute ← useAuthStore (isAuthenticated) │    │   │    │
│  │  │  │ RoleGuard ← useAuthStore (user.role)            │    │   │    │
│  │  │  │                                                 │    │   │    │
│  │  │  │ Pages ← useQuery hooks ← API layer ──────────┐ │    │   │    │
│  │  │  │        ← useMutation hooks ← API layer ──────┤ │    │   │    │
│  │  │  │        ← useForm + Zod (validation)           │ │    │   │    │
│  │  │  └───────────────────────────────────────────────┘ │    │   │    │
│  │  └────────────────────────────────────────────────────┘   │    │
│  │  Toaster (sonner) ← toast.success/error calls              │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌─ API Layer ────────────────────────────────────────────────────┐    │
│  │ apiClient (Axios)                                              │    │
│  │  ├── Request Interceptor: gắn JWT token từ localStorage       │    │
│  │  ├── Response Interceptor: 401 → silent refresh → queue       │    │
│  │  └── Domain APIs: auth, user, hotel, room, booking,            │    │
│  │                    review, search, payment                     │    │
│  └────────────────────────────────┬───────────────────────────────┘    │
│                                   │ HTTP                               │
│  ┌─ State Layer ──────────────────┼───────────────────────────────┐    │
│  │ Zustand Stores:                │                               │    │
│  │  ├── auth.store: tokens,       │                               │    │
│  │  │    user, isAuthenticated    │                               │    │
│  │  │    ↔ localStorage           │                               │    │
│  │  └── ui.store: theme,          │                               │    │
│  │       sidebar ↔ localStorage   │                               │    │
│  │       ↔ document.documentElement│                               │    │
│  │                                │                               │    │
│  │ TanStack Query Cache:          │                               │    │
│  │  ├── ['hotels', 'list', ...]   │                               │    │
│  │  ├── ['bookings', 'detail', id]│                               │    │
│  │  └── ['auth', 'me']            │                               │    │
│  └────────────────────────────────┼───────────────────────────────┘    │
│                                   │                                    │
├───────────────────────────────────┼────────────────────────────────────┤
│  Vite Dev Proxy / Nginx           │                                    │
│  /api/* → http://localhost:3000   │                                    │
├───────────────────────────────────┼────────────────────────────────────┤
│                                   ▼                                    │
│                          NestJS Backend                                │
│                          Port 3000                                     │
│                          ├── Auth (JWT)                                │
│                          ├── Hotels CRUD                               │
│                          ├── Rooms CRUD                                │
│                          ├── Bookings + LianLian Bank                   │
│                          ├── Reviews CRUD                              │
│                          ├── Search (ES + AI)                          │
│                          └── Crawler                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tóm tắt các pattern quan trọng

| Pattern | Ở đâu | Mục đích |
|---------|--------|----------|
| **Failed Request Queue** | `api/client.ts` | Xử lý nhiều 401 đồng thời, chỉ refresh 1 lần |
| **Query Key Factory** | `config/query-keys.ts` | Cache key có cấu trúc cho invalidation chính xác |
| **Cache Invalidation** | `hooks/use*.ts` (onSuccess) | Tự động refetch data sau mutation |
| **State Machine** | `pages/user/BookingPage.tsx` | 3 bước booking (chọn phòng → form → payment) |
| **Dual Search + Merge** | `pages/public/SearchResultsPage.tsx` | Kết hợp keyword + AI search |
| **Zustand + localStorage** | `stores/*.ts` | Persist state qua page refresh |
| **DOM manipulation** | `stores/ui.store.ts` | Toggle dark mode class trên `<html>` |
| **Debounce** | `hooks/useDebounce.ts` | Giảm số lần gọi API khi user gõ |
| **Code Splitting** | `vite.config.ts` | 8 vendor chunks cho caching hiệu quả |
| **Nested Route Guards** | `App.tsx` | ProtectedRoute + RoleGuard lồng nhau |
| **Zod + React Hook Form** | `lib/validators.ts` + Forms | Type-safe validation |
| **Error Boundary** | `components/common/ErrorBoundary.tsx` | Bắt lỗi render, không crash app |
| **Conditional Data Fetching** | `enabled` option trong useQuery | Chỉ fetch khi có đủ dữ liệu |
| **keepPreviousData** | `useHotels`, `useBookings` | UX mượt khi chuyển trang |
