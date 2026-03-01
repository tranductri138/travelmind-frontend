# TravelMind Web

> React TypeScript + TailwindCSS — Frontend cho nền tảng TravelMind
> Kết nối với NestJS Backend API + Python AI Service

---

## Tổng quan

Single Page Application cho người dùng cuối và admin. Giao tiếp **duy nhất** với NestJS Backend (port 3000) — không gọi trực tiếp Python AI service hay bất kỳ infra nào khác.

```
Browser (React SPA)
    │
    │  REST API + WebSocket
    ▼
NestJS Backend (port 3000)    ← Là gateway duy nhất
    │         │
    ▼         ▼
PostgreSQL  RabbitMQ ──► Python AI (port 8000)
Redis       Qdrant
LianLian Bank
```

---

## Tech Stack

| Layer | Technology | Lý do |
|-------|-----------|-------|
| Language | TypeScript (strict) | Type-safe, align với NestJS backend |
| Framework | React 19 | Ecosystem lớn nhất, team quen |
| Build | Vite 6 | HMR nhanh, build production nhỏ |
| Routing | React Router 7 | File-based hoặc config-based, loader/action pattern |
| State | TanStack Query (React Query) v5 | Server state, caching, invalidation, retry tự động |
| Local State | Zustand | Nhẹ, simple, cho auth/UI state |
| Styling | TailwindCSS 4 | Utility-first, consistent design, purge unused |
| Components | shadcn/ui | Copy-paste components, không vendor lock-in, dựa trên Radix UI |
| Forms | React Hook Form + Zod | Performance (uncontrolled), validation schema share được với backend |
| HTTP | Axios | Interceptors cho JWT refresh, error handling |
| Maps | Leaflet / Mapbox GL | Hiển thị hotels trên bản đồ |
| Payment | LianLian Bank payment form (no external SDK) | Simulated bank transfer, no PCI scope |
| Date | date-fns | Tree-shakable, immutable |
| Icons | Lucide React | Consistent, tree-shakable |
| Testing | Vitest + Testing Library | Nhanh, compatible Vite |
| E2E | Playwright | Cross-browser, đã dùng ở Python AI service |
| Linting | ESLint + Prettier | Standard |
| Package Manager | npm | Built-in Node.js, không cần cài thêm, team quen |

---

## Project Structure

```
travelmind-web/
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── .env.example
├── .env.development                # VITE_API_URL=http://localhost:3000/api
│
├── public/
│   ├── favicon.ico
│   └── og-image.png
│
├── src/
│   ├── main.tsx                    # ReactDOM.createRoot, providers
│   ├── App.tsx                     # Router setup
│   ├── vite-env.d.ts
│   │
│   ├── config/
│   │   ├── env.ts                  # Type-safe env vars (Zod validate)
│   │   ├── routes.ts               # Route path constants
│   │   └── query-keys.ts           # TanStack Query key factory
│   │
│   ├── api/                        # HTTP layer — giao tiếp NestJS
│   │   ├── client.ts               # Axios instance + interceptors (JWT refresh)
│   │   ├── auth.api.ts             # login, register, refresh, logout
│   │   ├── user.api.ts             # getMe, updateProfile, deleteAccount
│   │   ├── hotel.api.ts            # list, detail, nearby, create, update, delete, hardDelete
│   │   ├── room.api.ts             # listByHotel, checkAvailability, create, delete, hardDelete
│   │   ├── booking.api.ts          # create, list, detail, cancel, delete
│   │   ├── payment.api.ts          # initiate, confirm
│   │   ├── review.api.ts           # listByHotel, create, delete
│   │   └── search.api.ts           # fullText, semantic (NestJS proxy AI)
│   │
│   ├── types/                      # TypeScript interfaces — mirror API responses
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── hotel.ts
│   │   ├── room.ts
│   │   ├── booking.ts
│   │   ├── payment.ts
│   │   ├── review.ts
│   │   ├── search.ts
│   │   └── common.ts               # Pagination, ApiResponse<T>, etc.
│   │
│   ├── hooks/                      # Custom hooks — business logic
│   │   ├── useAuth.ts              # Login/logout/register + token management
│   │   ├── useHotels.ts            # useQuery wrappers: list, detail, nearby
│   │   ├── useRooms.ts             # Room list + availability check
│   │   ├── useBookings.ts          # CRUD booking
│   │   ├── useReviews.ts           # List + create review
│   │   ├── useSearch.ts            # Full-text + semantic search
│   │   └── useDebounce.ts          # Utility
│   │
│   ├── stores/                     # Zustand — client-only state
│   │   ├── auth.store.ts           # tokens, user, isAuthenticated
│   │   └── ui.store.ts             # sidebar, modal, theme
│   │
│   ├── components/                 # Shared UI components
│   │   ├── ui/                     # shadcn/ui (Button, Input, Card, Dialog, Toast...)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ... 
│   │   │
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx        # Header + Sidebar + Main + Footer
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx          # Admin sidebar
│   │   │   └── MobileNav.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ProtectedRoute.tsx   # Redirect nếu chưa login
│   │   │   └── RoleGuard.tsx        # Check role admin/user
│   │   │
│   │   ├── hotel/
│   │   │   ├── HotelCard.tsx        # Card preview trong list
│   │   │   ├── HotelGrid.tsx        # Grid/List toggle layout
│   │   │   ├── HotelGallery.tsx     # Image gallery lightbox
│   │   │   ├── HotelMap.tsx         # Single hotel trên map
│   │   │   ├── HotelFilters.tsx     # Price, rating, amenities filter
│   │   │   └── AmenityBadge.tsx
│   │   │
│   │   ├── room/
│   │   │   ├── RoomCard.tsx
│   │   │   ├── RoomList.tsx
│   │   │   ├── AvailabilityCalendar.tsx   # Date picker check-in/out
│   │   │   └── PriceBreakdown.tsx
│   │   │
│   │   ├── booking/
│   │   │   ├── BookingForm.tsx       # Select room + dates + guests
│   │   │   ├── BookingCard.tsx       # Booking summary card
│   │   │   ├── BookingTimeline.tsx   # Status: PENDING → CONFIRMED → COMPLETED
│   │   │   └── CancelDialog.tsx
│   │   │
│   │   ├── payment/
│   │   │   ├── LianLianCheckout.tsx  # LianLian Bank payment form
│   │   │   └── PaymentStatus.tsx
│   │   │
│   │   ├── review/
│   │   │   ├── ReviewCard.tsx
│   │   │   ├── ReviewList.tsx
│   │   │   ├── ReviewForm.tsx        # Star rating + text
│   │   │   └── ReviewStats.tsx       # Aggregate: avg rating, distribution
│   │   │
│   │   ├── search/
│   │   │   ├── SearchBar.tsx         # Input + suggestions dropdown
│   │   │   ├── SearchResults.tsx
│   │   │   └── SemanticBadge.tsx     # "AI-powered" indicator
│   │   │
│   │   └── common/
│   │       ├── Pagination.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── LoadingSkeleton.tsx
│   │       ├── StarRating.tsx
│   │       ├── PriceTag.tsx
│   │       └── ImageWithFallback.tsx
│   │
│   ├── pages/                       # Route-level components (1 file = 1 route)
│   │   │
│   │   ├── public/                  # Không cần login
│   │   │   ├── HomePage.tsx              # Landing: search bar + featured hotels
│   │   │   ├── HotelListPage.tsx         # GET /hotels — grid + filters + map toggle
│   │   │   ├── HotelDetailPage.tsx       # GET /hotels/:id — gallery, rooms, reviews, map
│   │   │   ├── SearchResultsPage.tsx     # GET /search — full-text + semantic results
│   │   │   ├── LoginPage.tsx             # POST /auth/login
│   │   │   └── RegisterPage.tsx          # POST /auth/register
│   │   │
│   │   ├── user/                    # Cần login (role: USER)
│   │   │   ├── BookingPage.tsx           # POST /bookings — form đặt phòng + LianLian Bank
│   │   │   ├── MyBookingsPage.tsx        # GET /bookings — lịch sử booking
│   │   │   ├── BookingDetailPage.tsx     # GET /bookings/:id — chi tiết + cancel
│   │   │   ├── ProfilePage.tsx           # GET + PATCH /users/me
│   │   │   └── WriteReviewPage.tsx       # POST /reviews
│   │   │
│   │   └── admin/                   # Cần login (role: ADMIN)
│   │       ├── DashboardPage.tsx         # Overview: bookings, revenue, hotels
│   │       ├── HotelManagePage.tsx       # CRUD hotels
│   │       ├── HotelFormPage.tsx         # POST + PATCH /hotels
│   │       ├── BookingManagePage.tsx      # Tất cả bookings, filter status
│   │       └── CrawlerPage.tsx           # POST /crawler/trigger, GET status
│   │
│   ├── lib/                         # Utilities
│   │   ├── cn.ts                    # clsx + twMerge helper
│   │   ├── format.ts               # Currency, date, number formatters
│   │   └── validators.ts           # Zod schemas (share form validation)
│   │
│   └── assets/
│       ├── logo.svg
│       └── placeholder-hotel.jpg
│
├── Dockerfile
├── Dockerfile.dev
├── nginx.conf                       # Production: serve SPA + proxy API
└── .dockerignore
```

---

## Pages ↔ API Mapping

Mỗi page map trực tiếp với 1 hoặc nhiều API endpoints từ NestJS Backend.

### Public Pages

| Page | Route | API Calls | Mô tả |
|------|-------|-----------|-------|
| HomePage | `/` | `GET /hotels?featured=true&limit=8` | Landing page, search bar, featured hotels |
| HotelListPage | `/hotels` | `GET /hotels?page&limit&sort&minPrice&maxPrice&rating&amenities` | Grid + filters + pagination + map toggle |
| HotelDetailPage | `/hotels/:id` | `GET /hotels/:id` + `GET /hotels/:id/rooms` + `GET /reviews?hotelId=:id` | Full detail: gallery, rooms, reviews, map location |
| SearchResultsPage | `/search?q=...` | `GET /search?q=...` (PostgreSQL + AI semantic) | Kết quả kết hợp keyword + semantic search |
| LoginPage | `/login` | `POST /auth/login` | Form login → JWT tokens → redirect |
| RegisterPage | `/register` | `POST /auth/register` | Form đăng ký |

### User Pages (ProtectedRoute)

| Page | Route | API Calls | Mô tả |
|------|-------|-----------|-------|
| BookingPage | `/hotels/:id/book` | `GET /hotels/:id/rooms` + `POST /bookings` + `POST /payments/initiate/:bookingId` | Chọn room, dates, guests → tạo booking → LianLian Bank checkout |
| MyBookingsPage | `/bookings` | `GET /bookings?page&status` | Lịch sử booking, filter theo status |
| BookingDetailPage | `/bookings/:id` | `GET /bookings/:id` + `PATCH /bookings/:id/cancel` + `DELETE /bookings/:id` | Chi tiết + timeline + hủy/xóa booking |
| ProfilePage | `/profile` | `GET /users/me` + `PATCH /users/me` + `DELETE /users/me` | Xem/sửa thông tin cá nhân, xóa tài khoản |
| WriteReviewPage | `/bookings/:id/review` | `POST /reviews` | Viết review sau khi đã booking |

### Admin Pages (RoleGuard)

| Page | Route | API Calls | Mô tả |
|------|-------|-----------|-------|
| DashboardPage | `/admin` | Aggregate endpoints | Overview metrics |
| HotelManagePage | `/admin/hotels` | `GET /hotels` + `DELETE /hotels/:id` + `DELETE /hotels/:id/permanent` | CRUD list hotels, soft/hard delete |
| HotelFormPage | `/admin/hotels/new` `/admin/hotels/:id/edit` | `POST /hotels` + `PATCH /hotels/:id` | Tạo/sửa hotel |
| BookingManagePage | `/admin/bookings` | `GET /bookings` (all) + `DELETE /bookings/:id` | Quản lý tất cả bookings, xóa booking |
| CrawlerPage | `/admin/crawler` | `POST /crawler/trigger` + `GET /crawler/status` | Trigger scraping, xem status |

---

## Data Flow Patterns

### Authentication — JWT + Silent Refresh

```
Login → POST /auth/login → { accessToken, refreshToken }
    │
    ├── accessToken → Zustand store + Axios header (Authorization: Bearer xxx)
    └── refreshToken → httpOnly cookie (nếu BFF) hoặc Zustand

Mọi request:
    Axios interceptor → attach accessToken
    Nếu 401 → auto POST /auth/refresh → new tokens → retry request gốc
    Nếu refresh cũng fail → logout → redirect /login
```

### Server State — TanStack Query

```
useHotels() hook
    │
    └── useQuery({
          queryKey: ['hotels', filters],     // Cache key
          queryFn: () => hotelApi.list(filters),
          staleTime: 5 * 60 * 1000,          // 5 phút coi là fresh
          placeholderData: keepPreviousData,   // Giữ data cũ khi paginate
        })

Khi user tạo booking:
    useMutation → POST /bookings
    onSuccess → queryClient.invalidateQueries(['bookings'])
    → TanStack Query auto refetch → UI update
```

### Booking + Payment Flow

```
HotelDetailPage                    BookingPage                   LianLian Bank
      │                                │                              │
      │ User click "Đặt phòng"        │                              │
      ├───────────────────────────────►│                              │
      │                                │                              │
      │                    Chọn room + dates + guests                 │
      │                    POST /bookings                             │
      │                    → booking (PENDING)                        │
      │                                │                              │
      │                    POST /payments/initiate/:bookingId         │
      │                    → { transactionId, amount, currency, bankInfo }
      │                                │                              │
      │                    Render <LianLianCheckout>                  │
      │                    User sees bank details, clicks "Confirm"   │
      │                                │                              │
      │                    POST /payments/confirm/:transactionId      │
      │                    → payment confirmed                        │
      │                                │                              │
      │                    Booking status: CONFIRMED                  │
      │                    Redirect → BookingDetailPage               │
```

### Search — Keyword + Semantic

```
SearchBar (user gõ)
    │
    │ debounce 300ms
    ▼
SearchResultsPage
    │
    ├── GET /search?q=... (PostgreSQL full-text)        → keyword results
    │
    └── POST /search/semantic (NestJS proxy → AI)      → semantic results
          body: { query: "..." }
    │
    ▼
Merge + deduplicate results
    ├── Semantic results có badge "AI-powered"
    └── Sorted by combined relevance score
```

---

## Docker

### Dockerfile (Production — Nginx SPA)

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

### nginx.conf

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA — mọi route trả về index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls tới NestJS
    location /api/ {
        proxy_pass http://api:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static assets cache
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Thêm vào docker-compose.yml

```yaml
  web:
    build:
      context: ../travelmind-web
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ../travelmind-web/src:/app/src
    environment:
      - VITE_API_URL=http://localhost:3000
    depends_on:
      - api
```

---

## Tổ chức repo

```
# Multi-repo
github.com/org/travelmind-api     ← NestJS backend
github.com/org/travelmind-ai      ← Python AI service
github.com/org/travelmind-web     ← React frontend (repo này)

# Hoặc monorepo
travelmind/
├── apps/
│   ├── api/      ← NestJS
│   ├── ai/       ← Python
│   └── web/      ← React (repo này)
├── packages/
│   └── shared-types/   ← TypeScript interfaces dùng chung api + web
└── docker-compose.yml
```

---

## Getting Started

```bash
# Setup
cd travelmind-web
cp .env.example .env.development
npm install

# Dev server (port 5173, proxy API tới localhost:3000)
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Test
npm test

# Lint + format
npm run lint
npm run format
```
