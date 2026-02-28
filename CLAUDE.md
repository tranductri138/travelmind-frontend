# TravelMind Frontend

React 19 + TypeScript (strict) + Vite 7 SPA. Connects to NestJS backend at port 3000.

## Tech Stack
- **UI**: TailwindCSS 4 + shadcn/ui (Radix UI) + Lucide icons
- **State**: TanStack Query v5 (server) + Zustand (client: auth, UI/theme)
- **Routing**: React Router 7 with ProtectedRoute + RoleGuard
- **Forms**: React Hook Form + Zod validation
- **HTTP**: Axios with JWT interceptors (auto refresh on 401)
- **Payment**: Stripe Elements (@stripe/react-stripe-js)
- **Maps**: Leaflet + react-leaflet
- **Utils**: date-fns, clsx + tailwind-merge

## Commands
```
npm run dev        # localhost:5173, proxy /api -> localhost:3000
npm run build      # tsc check + vite build (code-split into 8 chunks)
npm run preview    # preview production build
npm run lint       # eslint
```

## Project Structure
```
src/
├── config/          # env.ts (Zod), routes.ts, query-keys.ts
├── lib/             # cn.ts, format.ts, validators.ts (Zod schemas)
├── api/             # client.ts (Axios + JWT) + 8 domain API files
├── types/           # 9 type files mirroring backend DTOs
├── stores/          # auth.store.ts, ui.store.ts (Zustand)
├── hooks/           # 7 TanStack Query wrapper hooks
├── components/
│   ├── ui/          # 23 shadcn/ui components (DO NOT edit manually)
│   ├── layout/      # AppLayout, Header, Footer, Sidebar, MobileNav
│   ├── auth/        # LoginForm, RegisterForm, ProtectedRoute, RoleGuard
│   ├── hotel/       # HotelCard, HotelGrid, HotelGallery, HotelMap, HotelFilters
│   ├── room/        # RoomCard, RoomList, AvailabilityCalendar, PriceBreakdown
│   ├── booking/     # BookingForm, BookingCard, BookingTimeline, CancelDialog
│   ├── payment/     # StripeCheckout, PaymentStatus
│   ├── review/      # ReviewCard, ReviewList, ReviewForm, ReviewStats
│   ├── search/      # SearchBar, SearchResults, SemanticBadge
│   └── common/      # Pagination, EmptyState, ErrorBoundary, StarRating, PriceTag, etc.
├── pages/
│   ├── public/      # Home, HotelList, HotelDetail, Search, Login, Register
│   ├── user/        # Booking, MyBookings, BookingDetail, Profile, WriteReview
│   └── admin/       # Dashboard, HotelManage, HotelForm, BookingManage, Crawler
├── main.tsx         # Entry: QueryClientProvider + Toaster (sonner)
└── App.tsx          # BrowserRouter + all routes with guards
```

## Key Patterns
- **Path alias**: `@/` -> `src/` (tsconfig.app.json + vite.config.ts)
- **API layer**: `src/api/*.api.ts` — typed Axios calls, one file per domain
- **Query keys**: Factory pattern in `src/config/query-keys.ts`
- **Auth flow**: Login -> tokens in localStorage + Zustand -> Axios interceptor attaches Bearer -> 401 triggers silent refresh -> fail = logout + redirect /login
- **Booking flow**: Select room -> BookingForm -> POST /bookings -> get clientSecret -> Stripe Elements confirmPayment -> redirect to BookingDetail
- **Search**: Parallel keyword (Elasticsearch) + semantic (AI) -> merge + deduplicate -> semantic results get "AI-powered" badge
- **Admin**: Routes under /admin wrapped in RoleGuard(['ADMIN']), sidebar nav via Sidebar.tsx
- **shadcn/ui**: Installed via `npx shadcn@latest add <component>` — components live in `src/components/ui/`, import cn from `@/lib/cn`

## Environment Variables
```
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Build Notes
- `tsc -p tsconfig.app.json --noEmit` for type checking (NOT `tsc -b` which fails on path aliases in composite mode)
- Code splitting via `manualChunks` in vite.config.ts — 8 vendor chunks, all under 500KB
- Docker: multi-stage (node build -> nginx serve), nginx.conf handles SPA routing + /api proxy
